import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, Chip, Button,
  TextField, InputAdornment, Tab, Tabs, Avatar, Skeleton,
} from '@mui/material'
import { Schedule, Search, Refresh, Phone } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useExpiringSubscriptions, useExpiredSubscriptions } from '@/hooks/useSubscriptions'
import {
  formatDate, daysUntilExpiry, getExpiryUrgency,
  EXPIRY_URGENCY_COLORS, EXPIRY_URGENCY_LABELS,
} from '@/utils/formatters'

function ExpiryCard({ sub, onClick }: { sub: any; onClick: () => void }) {
  const days = daysUntilExpiry(sub.end_date)
  const urgency = getExpiryUrgency(sub.end_date)
  const member = sub.members as any
  const plan = sub.membership_plans as any
  const urgencyColor = EXPIRY_URGENCY_COLORS[urgency]

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderLeft: `4px solid ${urgencyColor}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: `0 4px 20px ${urgencyColor}22`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" flex={1} minWidth={0}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.dark', fontSize: 16 }}>
              {member?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" fontWeight={700} noWrap>
                  {member?.name}
                </Typography>
                <Chip
                  label={EXPIRY_URGENCY_LABELS[urgency]}
                  size="small"
                  sx={{
                    bgcolor: `${urgencyColor}1A`,
                    color: urgencyColor,
                    fontWeight: 700,
                    fontSize: 10,
                    height: 20,
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={1.5} mt={0.5}>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {member?.member_code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {plan?.name ?? '—'}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Box textAlign="right" ml={2} flexShrink={0}>
            <Typography variant="h5" fontWeight={800} color={urgencyColor} lineHeight={1}>
              {days < 0 ? Math.abs(days) : days}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {days < 0 ? 'days ago' : days === 0 ? 'Today!' : 'days left'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDate(sub.end_date)}
            </Typography>
          </Box>
        </Stack>

        {member?.phone && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5}>
            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {member.phone}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export default function ExpiryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [days, setDays] = useState(30)

  const { data: expiring, isLoading: expiringLoading } = useExpiringSubscriptions(days)
  const { data: expired, isLoading: expiredLoading } = useExpiredSubscriptions()

  const activeData = tab === 0 ? (expiring ?? []) : (expired ?? [])
  const isLoading = tab === 0 ? expiringLoading : expiredLoading

  const filtered = activeData.filter((sub) => {
    if (!search) return true
    const member = sub.members as any
    return (
      member?.name?.toLowerCase().includes(search.toLowerCase()) ||
      member?.member_code?.toLowerCase().includes(search.toLowerCase()) ||
      member?.phone?.includes(search)
    )
  })

  return (
    <Box>
      <TopBar title="Expiry Management" />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Summary chips */}
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          <Chip
            label={`${expiring?.filter((s) => daysUntilExpiry(s.end_date) <= 0).length ?? 0} expired today`}
            sx={{ bgcolor: `${EXPIRY_URGENCY_COLORS.expired}1A`, color: EXPIRY_URGENCY_COLORS.expired, fontWeight: 600 }}
          />
          <Chip
            label={`${expiring?.filter((s) => { const d = daysUntilExpiry(s.end_date); return d >= 1 && d <= 3 }).length ?? 0} expiring in 3 days`}
            sx={{ bgcolor: `${EXPIRY_URGENCY_COLORS.critical}1A`, color: EXPIRY_URGENCY_COLORS.critical, fontWeight: 600 }}
          />
          <Chip
            label={`${expiring?.filter((s) => { const d = daysUntilExpiry(s.end_date); return d >= 4 && d <= 7 }).length ?? 0} expiring in 7 days`}
            sx={{ bgcolor: `${EXPIRY_URGENCY_COLORS.warning}1A`, color: EXPIRY_URGENCY_COLORS.warning, fontWeight: 600 }}
          />
          <Chip
            label={`${expired?.length ?? 0} already expired`}
            sx={{ bgcolor: 'rgba(148,163,184,0.12)', color: 'text.secondary', fontWeight: 600 }}
          />
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`Expiring Soon (${expiring?.length ?? 0})`} />
            <Tab label={`Already Expired (${expired?.length ?? 0})`} />
          </Tabs>
        </Box>

        {/* Filters */}
        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <TextField
            placeholder="Search member..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: 340 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          {tab === 0 && (
            <Stack direction="row" spacing={1}>
              {[7, 14, 30, 60].map((d) => (
                <Chip
                  key={d}
                  label={`${d}d`}
                  size="small"
                  onClick={() => setDays(d)}
                  color={days === d ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          )}
        </Stack>

        {/* Cards */}
        {isLoading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={100} />
            ))}
          </Stack>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Schedule />}
            title={tab === 0 ? `No members expiring in ${days} days` : 'No expired memberships'}
            description={tab === 0 ? '🎉 Great! No renewals needed right now.' : 'All members have active memberships.'}
          />
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((sub) => (
              <ExpiryCard
                key={sub.id}
                sub={sub}
                onClick={() => navigate(`/members/${(sub.members as any).id}`)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
