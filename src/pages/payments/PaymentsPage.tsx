import { useState } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, TextField, Button,
  InputAdornment, Stack, Skeleton, Chip, Avatar,
} from '@mui/material'
import { Search, Add, Receipt, Download } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePayments, useTodayRevenue } from '@/hooks/usePayments'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { exportPayments } from '@/utils/excelExport'

const METHOD_LABEL: Record<string, string> = {
  cash: '💵 Cash',
  upi_manual: '📲 UPI',
  razorpay_qr: '📱 QR Pay',
  card: '💳 Card',
  bank_transfer: '🏦 Bank',
  cheque: '📝 Cheque',
}

const TYPE_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'success'> = {
  admission: 'primary',
  subscription: 'success',
  pt: 'secondary',
  other: 'default',
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: payments, isLoading } = usePayments()
  const { data: todayRevenue } = useTodayRevenue()

  const filtered = (payments ?? []).filter((p) => {
    if (!search) return true
    const member = p.members as any
    return (
      member?.name?.toLowerCase().includes(search.toLowerCase()) ||
      member?.member_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.receipt_no.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <Box>
      <TopBar
        title="Payments"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              size="small"
              onClick={() => exportPayments(filtered)}
              disabled={!filtered.length}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={() => navigate('/payments/record')}
            >
              Record Payment
            </Button>
          </Stack>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Today's Revenue Banner */}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.08))',
            border: '1px solid rgba(108,99,255,0.2)',
          }}
        >
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Revenue Today
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {todayRevenue !== undefined ? formatCurrency(todayRevenue) : '—'}
              </Typography>
            </Box>
            <Receipt sx={{ fontSize: 40, color: 'primary.main', opacity: 0.4 }} />
          </Box>
        </Card>

        {/* Search */}
        <TextField
          placeholder="Search member name, ID, or receipt number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton width={j === 4 ? 70 : 100} height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ border: 0 }}>
                        <EmptyState
                          icon={<Receipt />}
                          title="No payments found"
                          description="Record the first payment to see it here."
                          actionLabel="Record Payment"
                          onAction={() => navigate('/payments/record')}
                        />
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map((payment) => {
                      const member = payment.members as any

                      return (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar
                                sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 12 }}
                              >
                                {member?.name?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {member?.name ?? '—'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                  {member?.member_code ?? ''}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" color="text.secondary" fontSize={12}>
                              {payment.receipt_no}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.type}
                              size="small"
                              color={TYPE_COLOR[payment.type] ?? 'default'}
                              sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {METHOD_LABEL[payment.payment_method] ?? payment.payment_method}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {formatCurrency(payment.amount)}
                            </Typography>
                            {payment.discount_amount > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                -{formatCurrency(payment.discount_amount)} disc
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDateTime(payment.paid_at ?? payment.created_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  )
}
