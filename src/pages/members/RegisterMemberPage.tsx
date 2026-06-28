import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Select, FormControl, InputLabel,
  Stack, FormHelperText, Alert, Divider, Chip,
} from '@mui/material'
import { ArrowBack, PersonAdd } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useCreateMember } from '@/hooks/useMembers'
import { usePlans } from '@/hooks/usePlans'
import { useCreateSubscription } from '@/hooks/useSubscriptions'
import { useRecordPayment } from '@/hooks/usePayments'
import { useAuthStore } from '@/store/authStore'
import { generateReceiptPDF } from '@/utils/receiptGenerator'
import { format } from 'date-fns'

const schema = z.object({
  // Member info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  blood_group: z.string().optional(),
  medical_notes: z.string().optional(),
  alt_phone: z.string().optional(),
  source: z.string().optional(),
  // Subscription (optional at registration)
  plan_id: z.string().optional(),
  start_date: z.string().optional(),
  // Payment
  payment_method: z.enum(['cash', 'upi_manual', 'card', 'bank_transfer', 'cheque', '']).optional(),
  admission_fee: z.string().optional(),
  discount_amount: z.string().optional(),
  discount_reason: z.string().optional(),
  payment_notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const SOURCES = ['Walk-in', 'Referral', 'Social Media', 'Google', 'Banner/Flyer', 'Other']

export default function RegisterMemberPage() {
  const navigate = useNavigate()
  const { gym } = useAuthStore()
  const { mutateAsync: createMember } = useCreateMember()
  const { mutateAsync: createSubscription } = useCreateSubscription()
  const { mutateAsync: recordPayment } = useRecordPayment()
  const { data: plans } = usePlans()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      start_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'cash',
    },
  })

  const selectedPlanId = watch('plan_id')
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId)
  const admissionFeeStr = watch('admission_fee') ?? ''
  const discountStr = watch('discount_amount') ?? '0'
  const totalAmount = (Number(admissionFeeStr) || selectedPlan?.price || 0) - (Number(discountStr) || 0)

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true)
      setError('')

      // 1. Create member
      const member = await createMember({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        dob: data.dob || undefined,
        gender: (data.gender as 'male' | 'female' | 'other') || undefined,
        address: data.address || undefined,
        emergency_contact: data.emergency_contact || undefined,
        blood_group: data.blood_group || undefined,
        medical_notes: data.medical_notes || undefined,
        alt_phone: data.alt_phone || undefined,
        source: data.source || undefined,
      })

      let subscriptionId: string | undefined

      // 2. Create subscription if plan selected
      if (data.plan_id && data.start_date && selectedPlan) {
        const sub = await createSubscription({
          member_id: member.id,
          plan_id: data.plan_id,
          start_date: data.start_date,
          duration_days: selectedPlan.duration_days,
        })
        subscriptionId = sub.id
      }

      // 3. Record payment if amount entered
      if (totalAmount > 0 && data.payment_method) {
        const { payment, gym: gymData } = await recordPayment({
          member_id: member.id,
          subscription_id: subscriptionId,
          amount: totalAmount,
          type: subscriptionId ? 'subscription' : 'admission',
          payment_method: data.payment_method as any,
          discount_amount: Number(discountStr) || 0,
          discount_reason: data.discount_reason || undefined,
          notes: data.payment_notes || undefined,
        })

        // Generate receipt PDF
        const doc = generateReceiptPDF({
          receiptNo: payment.receipt_no,
          memberName: member.name,
          memberCode: member.member_code,
          amount: totalAmount,
          discountAmount: Number(discountStr) || 0,
          taxAmount: 0,
          planName: selectedPlan?.name ?? 'Admission Fee',
          paymentMethod: data.payment_method,
          paymentDate: new Date().toISOString(),
          gymName: gymData?.name ?? 'Gymnazo',
          gymAddress: gymData?.address,
          gymPhone: gymData?.phone,
          gymGstin: gymData?.gstin,
        })
        doc.save(`receipt-${member.member_code}-${payment.receipt_no}.pdf`)
      }

      toast.success(`${member.name} registered successfully! ID: ${member.member_code}`)
      navigate(`/members/${member.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box>
      <TopBar
        title="Register New Member"
        actions={
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/members')}
            size="small"
          >
            Back
          </Button>
        }
      />
      <Box sx={{ pt: '64px', p: 3, maxWidth: 900, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Personal Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name *"
                    fullWidth
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number *"
                    fullWidth
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    placeholder="10-digit mobile number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Alternate Phone"
                    fullWidth
                    {...register('alt_phone')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    {...register('dob')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select label="Gender" {...field}>
                          <MenuItem value="">Select</MenuItem>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Blood Group</InputLabel>
                    <Controller
                      name="blood_group"
                      control={control}
                      render={({ field }) => (
                        <Select label="Blood Group" {...field}>
                          <MenuItem value="">Unknown</MenuItem>
                          {BLOOD_GROUPS.map((bg) => (
                            <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    {...register('address')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact"
                    fullWidth
                    {...register('emergency_contact')}
                    placeholder="Name & phone of emergency contact"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>How did they find us?</InputLabel>
                    <Controller
                      name="source"
                      control={control}
                      render={({ field }) => (
                        <Select label="How did they find us?" {...field}>
                          <MenuItem value="">Not specified</MenuItem>
                          {SOURCES.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Medical Notes"
                    fullWidth
                    multiline
                    rows={2}
                    {...register('medical_notes')}
                    placeholder="Any medical conditions, injuries, or special requirements..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Membership Plan */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Membership Plan
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Optional — you can assign a plan later from the member's profile
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Plan</InputLabel>
                    <Controller
                      name="plan_id"
                      control={control}
                      render={({ field }) => (
                        <Select label="Select Plan" {...field}>
                          <MenuItem value="">No plan (register only)</MenuItem>
                          {(plans ?? []).map((plan) => (
                            <MenuItem key={plan.id} value={plan.id}>
                              {plan.name} — ₹{plan.price} / {plan.duration_days}d
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    {...register('start_date')}
                    InputLabelProps={{ shrink: true }}
                    disabled={!selectedPlanId}
                  />
                </Grid>
                {selectedPlan && (
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedPlan.perks.map((perk) => (
                        <Chip key={perk} label={perk} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>
                Payment
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Record the first payment and download receipt
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={selectedPlan ? `Amount (plan: ₹${selectedPlan.price})` : 'Amount (₹)'}
                    fullWidth
                    {...register('admission_fee')}
                    placeholder={selectedPlan ? String(selectedPlan.price) : '0'}
                    type="number"
                    inputProps={{ min: 0 }}
                    helperText={selectedPlan && !watch('admission_fee') ? `Will use plan price ₹${selectedPlan.price}` : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Controller
                      name="payment_method"
                      control={control}
                      render={({ field }) => (
                        <Select label="Payment Method" {...field}>
                          <MenuItem value="cash">💵 Cash</MenuItem>
                          <MenuItem value="upi_manual">📲 UPI (QR Scan)</MenuItem>
                          <MenuItem value="card">💳 Card</MenuItem>
                          <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
                          <MenuItem value="cheque">📝 Cheque</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Discount Amount (₹)"
                    fullWidth
                    {...register('discount_amount')}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Discount Reason"
                    fullWidth
                    {...register('discount_reason')}
                    placeholder="Student, referral, etc."
                    disabled={!(Number(discountStr) > 0)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Payment Notes"
                    fullWidth
                    {...register('payment_notes')}
                    placeholder="Any notes about this payment..."
                  />
                </Grid>
              </Grid>

              {totalAmount > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
                    <Typography color="text.secondary">Total to collect:</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/members')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<PersonAdd />}
              disabled={isSubmitting}
              sx={{ minWidth: 180 }}
            >
              {isSubmitting ? 'Registering...' : 'Register Member'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
