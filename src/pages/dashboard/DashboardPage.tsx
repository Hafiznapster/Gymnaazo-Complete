import {
  Box, Grid, Card, CardContent, Typography,
  Skeleton, Stack, Chip,
} from '@mui/material'
import { People, CheckCircle, AttachMoney, Schedule, Error } from '@mui/icons-material'
import { TopBar } from '@/components/layout/TopBar'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useExpiringSubscriptions } from '@/hooks/useSubscriptions'
import {
  formatCurrency, formatDate,
  daysUntilExpiry, getExpiryUrgency, EXPIRY_URGENCY_COLORS,
} from '@/utils/formatters'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
  loading?: boolean
}

function KPICard({ title, value, icon, color, subtitle, loading }: KPICardProps) {
  return (
    <Card
      sx={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 32px ${color}22` },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <>
            <Skeleton variant="rounded" width={48} height={48} sx={{ mb: 2 }} />
            <Skeleton width="55%" height={44} />
            <Skeleton width="45%" sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: `${color}1A`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                mb: 2,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { staffUser } = useAuthStore()
  const { data: stats, isLoading } = useDashboardStats()
  const { data: expiring } = useExpiringSubscriptions(7)

  const kpis = [
    {
      title: 'Total Members',
      value: stats?.totalMembers ?? '—',
      icon: <People />,
      color: '#6C63FF',
      subtitle: `${stats?.activeMembers ?? '—'} active`,
    },
    {
      title: "Today's Check-ins",
      value: stats?.todayCheckIns ?? '—',
      icon: <CheckCircle />,
      color: '#22C55E',
    },
    {
      title: "Today's Revenue",
      value: stats ? formatCurrency(stats.revenueToday) : '—',
      icon: <AttachMoney />,
      color: '#F59E0B',
    },
    {
      title: 'Expiring This Week',
      value: stats?.expiringThisWeek ?? '—',
      icon: <Schedule />,
      color: '#EF4444',
      subtitle: 'Need renewal soon',
    },
  ]

  return (
    <Box>
      <TopBar title={`Good ${getGreeting()}, ${staffUser?.name?.split(' ')[0] ?? 'there'}! 👋`} />
      <Box sx={{ pt: '64px', p: 3 }}>

        {/* KPI Cards */}
        <Grid container spacing={2.5} mb={3}>
          {kpis.map((kpi) => (
            <Grid item xs={12} sm={6} lg={3} key={kpi.title}>
              <KPICard {...kpi} loading={isLoading} />
            </Grid>
          ))}
        </Grid>

        {/* Expired Members Alert */}
        {(stats?.expiredCount ?? 0) > 0 && (
          <Card
            sx={{
              mb: 3,
              border: '1px solid rgba(239,68,68,0.3)',
              bgcolor: 'rgba(239,68,68,0.05)',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Error sx={{ color: 'error.main', fontSize: 20 }} />
              <Typography variant="body2" color="error.main" fontWeight={600}>
                {stats?.expiredCount} member{stats!.expiredCount !== 1 ? 's' : ''} with expired memberships
              </Typography>
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ ml: 'auto', cursor: 'pointer' }}
                onClick={() => navigate('/expiry')}
              >
                View all →
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
              <Typography variant="h6" fontWeight={700}>
                Expiring Soon — Next 7 Days
              </Typography>
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/expiry')}
              >
                View all →
              </Typography>
            </Stack>

            {!expiring || expiring.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography fontSize={32} mb={1}>🎉</Typography>
                <Typography color="text.secondary" variant="body2">
                  No members expiring in the next 7 days!
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {expiring.slice(0, 8).map((sub) => {
                  const days = daysUntilExpiry(sub.end_date)
                  const urgency = getExpiryUrgency(sub.end_date)
                  const member = sub.members as { id: string; name: string; member_code: string }
                  const plan = sub.membership_plans as { name: string }

                  return (
                    <Box
                      key={sub.id}
                      onClick={() => navigate(`/members/${member.id}`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.member_code}
                          {plan ? ` · ${plan.name}` : ''}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={days === 0 ? 'Today!' : `${days}d left`}
                          size="small"
                          sx={{
                            bgcolor: `${EXPIRY_URGENCY_COLORS[urgency]}1A`,
                            color: EXPIRY_URGENCY_COLORS[urgency],
                            fontWeight: 700,
                            fontSize: 11,
                            height: 22,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
                          {formatDate(sub.end_date)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
