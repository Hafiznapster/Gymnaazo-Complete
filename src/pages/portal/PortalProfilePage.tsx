// @ts-nocheck
import { Box, Card, CardContent, Typography, Stack, Avatar, Divider, Button, Alert } from '@mui/material'
import { Edit, MonitorWeight, Settings } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { formatDate } from '@/utils/formatters'
import { supabase } from '@/lib/supabase'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function PortalProfilePage() {
  const { memberUser, setAuth, setMemberUser } = useAuthStore()
  const { data: measurements } = useBodyMeasurements(memberUser?.id || '')

  async function handleLogout() {
    await supabase.auth.signOut()
    setAuth(null, null)
    setMemberUser(null)
  }

  // Sort measurements for chart
  const chartData = (measurements ?? [])
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((m) => ({
      date: formatDate(m.recorded_at),
      weight: m.weight_kg
    }))

  return (
    <Stack spacing={3}>
      <Card sx={{ bgcolor: '#0F0F1E', border: '1px solid rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar 
            sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: 32, fontWeight: 700, mx: 'auto', mb: 2 }}
          >
            {memberUser?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={800}>{memberUser?.name}</Typography>
          <Typography variant="body2" color="text.secondary" fontFamily="monospace" mb={2}>
            {memberUser?.phone}
          </Typography>
          <Button variant="outlined" size="small" startIcon={<Edit />}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Body Progress (Weight)
        </Typography>
        <Card sx={{ bgcolor: '#0F0F1E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CardContent sx={{ p: 2 }}>
            {!chartData.length ? (
              <Alert severity="info" icon={<MonitorWeight />}>
                No measurements logged yet. Check with your trainer.
              </Alert>
            ) : (
              <Box sx={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A2E', border: 'none', borderRadius: 8 }}
                      itemStyle={{ color: '#fff', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Button 
          fullWidth 
          variant="text" 
          color="error" 
          onClick={handleLogout}
          sx={{ py: 2, fontWeight: 700 }}
        >
          Logout
        </Button>
      </Box>
    </Stack>
  )
}
