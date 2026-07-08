// @ts-nocheck
import { Box, Card, CardContent, Typography, Stack, Chip, Button, Skeleton } from '@mui/material'
import { QrCode, DirectionsRun, CalendarMonth, FitnessCenter } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { usePortalData } from '@/hooks/usePortalData'
import { formatDate, formatTime, daysUntilExpiry } from '@/utils/formatters'
import QRCode from 'react-qr-code'

export default function PortalDashboardPage() {
  const { memberUser } = useAuthStore()
  const { data, isLoading } = usePortalData()

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={150} />
      </Stack>
    )
  }

  const sub = data?.activeSubscription
  const plan = sub?.membership_plans as any
  const daysLeft = sub ? daysUntilExpiry(sub.end_date) : 0

  return (
    <Stack spacing={3}>
      {/* Check-in QR Code */}
      <Card sx={{ bgcolor: 'primary.dark', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.1 }}>
          <QrCode sx={{ fontSize: 160 }} />
        </Box>
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }} mb={1}>
            Your Access Pass
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, display: 'inline-block', mb: 2 }}>
            <QRCode value={memberUser?.member_code || 'INVALID'} size={140} />
          </Box>
          <Typography variant="body1" fontWeight={700} fontFamily="monospace" letterSpacing={2}>
            {memberUser?.member_code}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Show this QR code at the reception to check in.
          </Typography>
        </CardContent>
      </Card>

      {/* Active Membership */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Active Membership
        </Typography>
        {sub ? (
          <Card sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    {plan?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Valid till {formatDate(sub.end_date)}
                  </Typography>
                </Box>
                <Chip 
                  label={daysLeft < 0 ? 'Expired' : `${daysLeft} days left`} 
                  color={daysLeft < 0 ? 'error' : daysLeft <= 7 ? 'warning' : 'success'} 
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Button fullWidth variant="outlined" startIcon={<CalendarMonth />} size="small">
                Renew Membership
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                You don't have an active membership.
              </Typography>
              <Button variant="contained" size="small">View Plans</Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Active PT */}
      {data?.activePT && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Personal Training
          </Typography>
          <Card sx={{ border: '1px solid rgba(255,101,132,0.3)', bgcolor: 'rgba(255,101,132,0.05)' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#FF6584', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FitnessCenter sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={700}>{(data.activePT.pt_packages as any).name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Trainer: {(data.activePT.staff_users as any).name}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight={800} color="#FF6584" lineHeight={1}>
                    {data.activePT.sessions_total - data.activePT.sessions_used}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">left</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Recent Attendance */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Recent Activity
        </Typography>
        {data?.recentAttendance.length ? (
          <Stack spacing={1}>
            {data.recentAttendance.map((log: any) => (
              <Card key={log.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DirectionsRun sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(log.check_in_at)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Checked in at {formatTime(log.check_in_at)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No recent activity found.
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
