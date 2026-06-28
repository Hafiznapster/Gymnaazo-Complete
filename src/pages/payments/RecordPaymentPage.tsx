import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Select, FormControl, InputLabel,
  Stack, Alert, Divider, Autocomplete,
} from '@mui/material'
import { ArrowBack, Receipt } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useMembers } from '@/hooks/useMembers'
import { useRecordPayment } from '@/hooks/usePayments'
import { useAuthStore } from '@/store/authStore'
import { generateReceiptPDF } from '@/utils/receiptGenerator'
import { formatCurrency } from '@/utils/formatters'

const schema = z.object({
  member_id: z.string().min(1, 'Select a member'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  type: z.enum(['admission', 'subscription', 'pt', 'other']),
  payment_method: z.enum(['cash', 'upi_manual', 'card', 'bank_transfer', 'cheque']),
  discount_amount: z.coerce.number().min(0).default(0),
  discount_reason: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RecordPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { gym } = useAuthStore()
  const { data: members } = useMembers()
  const { mutateAsync: recordPayment } = useRecordPayment()
  const [error, setError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: 'cash',
      type: 'subscription',
      discount_amount: 0,
    },
  })

  // Pre-select member if passed in URL (?member=uuid)
  useEffect(() => {
    const memberId = searchParams.get('member')
    if (memberId) setValue('member_id', memberId)
  }, [searchParams])

  const amount = watch('amount') || 0
  const discount = watch('discount_amount') || 0
  const total = Math.max(0, amount - discount)

  const selectedMemberId = watch('member_id')
  const selectedMember = members?.find((m) => m.id === selectedMemberId)

  async function onSubmit(data: FormData) {
    try {
      setError('')
      const { payment, gym: gymData } = await recordPayment({
        member_id: data.member_id,
        amount: total,
        type: data.type,
        payment_method: data.payment_method,
        discount_amount: data.discount_amount,
        discount_reason: data.discount_reason,
        notes: data.notes,
      })

      // Generate receipt
      const doc = generateReceiptPDF({
        receiptNo: payment.receipt_no,
        memberName: selectedMember?.name ?? 'Member',
        memberCode: selectedMember?.member_code ?? '—',
        amount: total,
        discountAmount: data.discount_amount,
        taxAmount: 0,
        planName: data.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        paymentMethod: data.payment_method,
        paymentDate: new Date().toISOString(),
        gymName: gymData?.name ?? 'Gymnazo',
        gymAddress: gymData?.address,
        gymPhone: gymData?.phone,
        gymGstin: gymData?.gstin,
      })
      doc.save(`receipt-${payment.receipt_no}.pdf`)

      toast.success('Payment recorded & receipt downloaded!')
      navigate('/payments')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment'
      setError(msg)
    }
  }

  const memberOptions = (members ?? []).map((m) => ({
    id: m.id,
    label: `${m.name} · ${m.member_code} · ${m.phone}`,
  }))

  return (
    <Box>
      <TopBar
        title="Record Payment"
        actions={
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/payments')}
            size="small"
          >
            Back
          </Button>
        }
      />
      <Box sx={{ pt: '64px', p: 3, maxWidth: 640, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Controller
                    name="member_id"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        options={memberOptions}
                        getOptionLabel={(o) => o.label}
                        value={memberOptions.find((o) => o.id === field.value) ?? null}
                        onChange={(_, newVal) => field.onChange(newVal?.id ?? '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Member *"
                            error={!!errors.member_id}
                            helperText={errors.member_id?.message}
                            size="small"
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Type *</InputLabel>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select label="Payment Type *" {...field}>
                          <MenuItem value="admission">Admission Fee</MenuItem>
                          <MenuItem value="subscription">Subscription / Renewal</MenuItem>
                          <MenuItem value="pt">Personal Training (PT)</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method *</InputLabel>
                    <Controller
                      name="payment_method"
                      control={control}
                      render={({ field }) => (
                        <Select label="Payment Method *" {...field}>
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
                    label="Amount (₹) *"
                    type="number"
                    fullWidth
                    {...register('amount')}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Discount (₹)"
                    type="number"
                    fullWidth
                    {...register('discount_amount')}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {discount > 0 && (
                  <Grid item xs={12}>
                    <TextField
                      label="Discount Reason"
                      fullWidth
                      {...register('discount_reason')}
                      placeholder="Student, referral, promotional..."
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    rows={2}
                    {...register('notes')}
                    placeholder="Any additional notes..."
                  />
                </Grid>
              </Grid>

              {/* Total */}
              <Divider sx={{ my: 2.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total to Collect</Typography>
                  {discount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(amount)} - {formatCurrency(discount)} discount
                    </Typography>
                  )}
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {formatCurrency(total)}
                </Typography>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Receipt />}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment & Print Receipt'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
