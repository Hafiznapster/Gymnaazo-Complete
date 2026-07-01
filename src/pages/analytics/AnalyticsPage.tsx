import { useState } from 'react'
import {
  Box, Card, CardContent, Grid, Typography, Stack, Skeleton,
  ToggleButton, ToggleButtonGroup, Divider,
} from '@mui/material'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TopBar } from '@/components/layout/TopBar'
import { useAuthStore } from '@/store/authStore'
import {
  useMonthlyRevenue,
  useMemberGrowth,
  usePaymentMethodBreakdown,
  useRevenueByType,
  useDailyAttendance,
} from '@/hooks/useAnalytics'
import { formatCurrency } from '@/utils/formatters'

const CHART_COLORS = ['#6C63FF', '#FF6584', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6']

const METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  upi_manual: 'UPI',
  razorpay_qr: 'Razorpay QR',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="h6" fontWeight={700} mb={2}>
      {children}
    </Typography>
  )
}

function ChartCard({ title, children, loading }: {
  title: string
  children: React.ReactNode
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <SectionTitle>{title}</SectionTitle>
        {loading ? (
          <Skeleton variant="rounded" height={200} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <Box
      sx={{
        bgcolor: '#1e1e35',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        p: 1.5,
        fontSize: 13,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      {payload.map((entry: any, i: number) => (
        <Typography key={i} variant="body2" fontWeight={600} sx={{ color: entry.color }}>
          {entry.name}:{' '}
          {entry.name?.toLowerCase().includes('revenue') || entry.name?.toLowerCase().includes('amount')
            ? formatCurrency(entry.value)
            : entry.value}
        </Typography>
      ))}
    </Box>
  )
}

export default function AnalyticsPage() {
  const { staffUser } = useAuthStore()
  const [revenueMonths, setRevenueMonths] = useState(6)

  const { data: monthlyRevenue, isLoading: revLoading } = useMonthlyRevenue(revenueMonths)
  const { data: memberGrowth, isLoading: growthLoading } = useMemberGrowth(revenueMonths)
  const { data: paymentMethods, isLoading: methodsLoading } = usePaymentMethodBreakdown()
  const { data: revenueByType, isLoading: typeLoading } = useRevenueByType()
  const { data: dailyAttendance, isLoading: attendLoading } = useDailyAttendance()

  const totalRevenue = (monthlyRevenue ?? []).reduce((s, m) => s + m.revenue, 0)

  return (
    <Box>
      <TopBar title="Analytics" />
      <Box sx={{ pt: '64px', p: 3 }}>

        {/* Summary KPIs */}
        <Grid container spacing={2.5} mb={3}>
          {[
            {
              label: `Revenue (${revenueMonths}mo)`,
              value: revLoading ? null : formatCurrency(totalRevenue),
              color: '#6C63FF',
            },
            {
              label: 'Total Members',
              value: growthLoading ? null : (memberGrowth?.at(-1)?.total ?? 0),
              color: '#22C55E',
            },
            {
              label: 'New This Month',
              value: growthLoading ? null : (memberGrowth?.at(-1)?.new_members ?? 0),
              color: '#F59E0B',
            },
            {
              label: 'Check-ins Today',
              value: attendLoading ? null : (dailyAttendance?.at(-1)?.count ?? 0),
              color: '#3B82F6',
            },
          ].map((kpi) => (
            <Grid item xs={6} md={3} key={kpi.label}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2,
                      bgcolor: `${kpi.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 1.5,
                    }}
                  />
                  {kpi.value === null ? (
                    <Skeleton width={80} height={36} />
                  ) : (
                    <Typography variant="h5" fontWeight={800} sx={{ color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {kpi.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Revenue + Member Growth side by side */}
        <Stack direction="row" mb={1} justifyContent="flex-end">
          <ToggleButtonGroup
            size="small"
            value={revenueMonths}
            exclusive
            onChange={(_, v) => v && setRevenueMonths(v)}
          >
            {[3, 6, 12].map((m) => (
              <ToggleButton key={m} value={m} sx={{ fontSize: 12, px: 2 }}>
                {m}M
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={7}>
            <ChartCard title="Monthly Revenue" loading={revLoading}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <ChartCard title="Member Growth" loading={growthLoading}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={memberGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Members"
                    stroke="#22C55E"
                    strokeWidth={2.5}
                    dot={{ fill: '#22C55E', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new_members"
                    name="New Members"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          {/* Daily Attendance */}
          <Grid item xs={12} lg={7}>
            <ChartCard title="Daily Attendance (Last 30 Days)" loading={attendLoading}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Check-ins" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Payment Method Pie */}
          <Grid item xs={12} sm={6} lg={2.5}>
            <ChartCard title="Revenue by Method" loading={methodsLoading}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={(paymentMethods ?? []).map((d) => ({
                      ...d,
                      name: METHOD_LABEL[d.name] ?? d.name,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={10}
                  >
                    {(paymentMethods ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{
                      background: '#1e1e35',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Revenue by Type Pie */}
          <Grid item xs={12} sm={6} lg={2.5}>
            <ChartCard title="Revenue by Type" loading={typeLoading}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={(revenueByType ?? []).map((d) => ({
                      ...d,
                      name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={10}
                  >
                    {(revenueByType ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{
                      background: '#1e1e35',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
