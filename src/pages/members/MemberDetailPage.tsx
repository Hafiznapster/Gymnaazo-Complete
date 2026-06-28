import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Button,
  Stack, Grid, Divider, Tab, Tabs, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel, Skeleton, Alert,
} from '@mui/material'
import {
  ArrowBack, Payment, Edit, FitnessCenter,
  CheckCircle, Receipt,
} from '@mui/icons-material'
import { TopBar } from '@/components/layout/TopBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useMember } from '@/hooks/useMembers'
import { usePlans } from '@/hooks/usePlans'
import { useCreateSubscription, useRenewSubscription } from '@/hooks/useSubscriptions'
import { useRecordPayment } from '@/hooks/usePayments'
import { useAuthStore } from '@/store/authStore'
import { generateReceiptPDF } from '@/utils/receiptGenerator'
import { formatDate, formatDateTime, formatCurrency, formatPhone, daysUntilExpiry, getExpiryUrgency, EXPIRY_URGENCY_COLORS } from '@/utils/formatters'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { MemberStatus } from '@/types/database'

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  )
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { gym } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [assignPlanOpen, setAssignPlanOpen] = useState(false)

  const { data: member, isLoading } = useMember(id)
  const { data: plans } = usePlans()
  const { mutateAsync: createSubscription } = useCreateSubscription()
  const { mutateAsync: renewSubscription } = useRenewSubscription()
  const { mutateAsync: recordPayment } = useRecordPayment()

  const [renewForm, setRenewForm] = useState({
    plan_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'cash' as string,
    discount_amount: '',
    notes: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)

  if (isLoading) {
    return (
      <Box>
        <TopBar />
        <Box sx={{ pt: '64px', p: 3 }}>
          <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={400} />
        </Box>
      </Box>
    )
  }

  if (!member) {
    return (
      <Box>
        <TopBar title="Member Not Found" />
        <Box sx={{ pt: '64px', p: 3 }}>
          <Alert severity="error">Member not found.</Alert>
        </Box>
      </Box>
    )
  }

  const subscriptions = (member as any).member_subscriptions ?? []
  const payments = (member as any).payments ?? []
  const attendance = (member as any).attendance_logs ?? []

  const activeSub = subscriptions.find((s: any) => s.status === 'active')
  const activePlan = activeSub?.membership_plans
  const expiryDays = activeSub ? daysUntilExpiry(activeSub.end_date) : null
  const urgency = activeSub ? getExpiryUrgency(activeSub.end_date) : null

  const selectedRenewPlan = plans?.find((p) => p.id === renewForm.plan_id)

  async function handleRenew() {
    if (!selectedRenewPlan) return
    try {
      setIsProcessing(true)
      const amount = selectedRenewPlan.price - (Number(renewForm.discount_amount) || 0)

      const sub = await renewSubscription({
        member_id: member.id,
        plan_id: renewForm.plan_id,
        start_date: renewForm.start_date,
        duration_days: selectedRenewPlan.duration_days,
        renewal_count: activeSub?.renewal_count ?? 0,
        notes: renewForm.notes || undefined,
      })

      if (amount > 0) {
        const { payment, gym: gymData } = await recordPayment({
          member_id: member.id,
          subscription_id: sub.id,
          amount,
          type: 'subscription',
          payment_method: renewForm.payment_method as any,
          discount_amount: Number(renewForm.discount_amount) || 0,
          notes: renewForm.notes || undefined,
        })

        const doc = generateReceiptPDF({
          receiptNo: payment.receipt_no,
          memberName: member.name,
          memberCode: member.member_code,
          amount,
          discountAmount: Number(renewForm.discount_amount) || 0,
          taxAmount: 0,
          planName: selectedRenewPlan.name,
          paymentMethod: renewForm.payment_method,
          paymentDate: new Date().toISOString(),
          validFrom: renewForm.start_date,
          validTo: format(
            new Date(new Date(renewForm.start_date).getTime() + selectedRenewPlan.duration_days * 86400000),
            'yyyy-MM-dd',
          ),
          gymName: gymData?.name ?? 'Gymnazo',
          gymAddress: gymData?.address,
          gymPhone: gymData?.phone,
          gymGstin: gymData?.gstin,
        })
        doc.save(`receipt-${member.member_code}-${payment.receipt_no}.pdf`)
      }

      toast.success(`Renewed successfully! Valid until ${formatDate(sub.end_date)}`)
      setRenewDialogOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Renewal failed'
      toast.error(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box>
      <TopBar
        title={member.name}
        actions={
          <>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/members')}
              size="small"
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<FitnessCenter />}
              onClick={() => setRenewDialogOpen(true)}
              size="small"
            >
              Renew / Assign Plan
            </Button>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => navigate(`/payments/record?member=${id}`)}
              size="small"
            >
              Record Payment
            </Button>
          </>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="flex-start">
              <Avatar
                src={member.photo_url ?? undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.dark',
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {member.name[0].toUpperCase()}
              </Avatar>
              <Box flex={1}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                  <Typography variant="h5" fontWeight={700}>
                    {member.name}
                  </Typography>
                  <StatusBadge status={member.status as MemberStatus} />
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {member.member_code}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">
                    📞 {formatPhone(member.phone)}
                  </Typography>
                  {member.email && (
                    <Typography variant="body2" color="text.secondary">
                      ✉️ {member.email}
                    </Typography>
                  )}
                  {member.gender && (
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      👤 {member.gender}
                    </Typography>
                  )}
                  {member.blood_group && (
                    <Typography variant="body2" color="text.secondary">
                      🩸 {member.blood_group}
                    </Typography>
                  )}
                </Stack>
              </Box>
              {/* Subscription status */}
              {activeSub && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: urgency ? `${EXPIRY_URGENCY_COLORS[urgency]}11` : 'transparent',
                    border: '1px solid',
                    borderColor: urgency ? `${EXPIRY_URGENCY_COLORS[urgency]}33` : 'divider',
                    textAlign: 'center',
                    minWidth: 140,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Current Plan
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    {activePlan?.name ?? '—'}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={urgency ? EXPIRY_URGENCY_COLORS[urgency] : 'text.primary'}
                  >
                    {expiryDays !== null
                      ? expiryDays < 0
                        ? 'Expired'
                        : expiryDays === 0
                        ? 'Today!'
                        : `${expiryDays}d left`
                      : '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Until {formatDate(activeSub.end_date)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Details" />
            <Tab label={`Payments (${payments.length})`} />
            <Tab label={`Attendance (${attendance.length})`} />
            <Tab label={`Subscriptions (${subscriptions.length})`} />
          </Tabs>
        </Box>

        {/* Tab: Details */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Personal Details
                  </Typography>
                  <Stack spacing={2}>
                    <InfoRow label="Date of Birth" value={member.dob ? formatDate(member.dob) : null} />
                    <InfoRow label="Address" value={member.address} />
                    <InfoRow label="Alternate Phone" value={member.alt_phone} />
                    <InfoRow label="Emergency Contact" value={member.emergency_contact} />
                    <InfoRow label="Source" value={member.source} />
                    <InfoRow label="Member Since" value={formatDate(member.joined_at)} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Health Information
                  </Typography>
                  <Stack spacing={2}>
                    <InfoRow label="Blood Group" value={member.blood_group} />
                    <InfoRow label="Medical Notes" value={member.medical_notes} />
                  </Stack>
                  {member.tags.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Tags
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {member.tags.map((tag: string) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab: Payments */}
        {tab === 1 && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {payments.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No payments recorded yet.</Typography>
                </Box>
              ) : (
                <Box>
                  {payments.map((payment: any) => (
                    <Box
                      key={payment.id}
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        '&:last-child': { borderBottom: 0 },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 36, height: 36, borderRadius: 2,
                            bgcolor: 'rgba(34,197,94,0.12)',
                            color: 'success.main',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Receipt fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} textTransform="capitalize">
                            {payment.type.replace('_', ' ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.receipt_no} · {payment.payment_method.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(payment.paid_at ?? payment.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: Attendance */}
        {tab === 2 && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {attendance.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No attendance recorded yet.</Typography>
                </Box>
              ) : (
                attendance.slice(0, 30).map((log: any) => (
                  <Box
                    key={log.id}
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDateTime(log.check_in_at)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Check-in
                        </Typography>
                      </Box>
                    </Stack>
                    {log.check_out_at && (
                      <Typography variant="caption" color="text.secondary">
                        Out: {format(new Date(log.check_out_at), 'hh:mm a')}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: Subscriptions */}
        {tab === 3 && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {subscriptions.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No subscriptions yet.</Typography>
                </Box>
              ) : (
                subscriptions.map((sub: any) => (
                  <Box
                    key={sub.id}
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {sub.membership_plans?.name ?? 'Unknown Plan'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(sub.start_date)} → {formatDate(sub.end_date)}
                        {sub.renewal_count > 0 ? ` (Renewal #${sub.renewal_count})` : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={sub.status}
                      size="small"
                      color={sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'error' : 'default'}
                      sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 11 }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Renew / Assign Plan Dialog */}
      <Dialog open={renewDialogOpen} onClose={() => setRenewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {activeSub ? 'Renew Membership' : 'Assign Membership Plan'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Plan *</InputLabel>
              <Select
                label="Select Plan *"
                value={renewForm.plan_id}
                onChange={(e) => setRenewForm((f) => ({ ...f, plan_id: e.target.value }))}
              >
                {(plans ?? []).map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} — {formatCurrency(plan.price)} / {plan.duration_days} days
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              size="small"
              value={renewForm.start_date}
              onChange={(e) => setRenewForm((f) => ({ ...f, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                value={renewForm.payment_method}
                onChange={(e) => setRenewForm((f) => ({ ...f, payment_method: e.target.value }))}
              >
                <MenuItem value="cash">💵 Cash</MenuItem>
                <MenuItem value="upi_manual">📲 UPI (QR Scan)</MenuItem>
                <MenuItem value="card">💳 Card</MenuItem>
                <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Discount Amount (₹)"
              fullWidth
              size="small"
              type="number"
              value={renewForm.discount_amount}
              onChange={(e) => setRenewForm((f) => ({ ...f, discount_amount: e.target.value }))}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Notes"
              fullWidth
              size="small"
              value={renewForm.notes}
              onChange={(e) => setRenewForm((f) => ({ ...f, notes: e.target.value }))}
            />
            {selectedRenewPlan && (
              <Box
                sx={{
                  p: 2, borderRadius: 2, bgcolor: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.2)',
                }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total to collect</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(selectedRenewPlan.price - (Number(renewForm.discount_amount) || 0))}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRenewDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRenew}
            disabled={isProcessing || !renewForm.plan_id || !renewForm.start_date}
          >
            {isProcessing ? 'Processing...' : activeSub ? 'Renew & Print Receipt' : 'Assign & Print Receipt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
