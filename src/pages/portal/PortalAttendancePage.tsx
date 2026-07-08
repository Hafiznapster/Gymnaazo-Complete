// @ts-nocheck
import { Box, Card, CardContent, Typography, Stack, Alert, CircularProgress, Chip } from '@mui/material'
import { AssignmentTurnedIn, DirectionsRun, AccessTime } from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { formatDate, formatTime } from '@/utils/formatters'

export default function PortalAttendancePage() {
  const { memberUser } = useAuthStore()

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['portal-attendance', memberUser?.id],
    enabled: !!memberUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('member_id', memberUser!.id)
        .order('check_in_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Attendance History</Typography>
        <Chip label={`${attendance.length} check-ins`} size="small" color="primary" variant="outlined" />
      </Stack>

      {!attendance.length ? (
        <Alert severity="info" icon={<AssignmentTurnedIn />}>
          You haven't checked in yet.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {attendance.map((log: any) => (
            <Card key={log.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <CardContent sx={{ p: '14px 16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DirectionsRun sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={700}>
                    {formatDate(log.check_in_at)}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Check-in: {formatTime(log.check_in_at)}
                      {log.check_out_at && ` · Check-out: ${formatTime(log.check_out_at)}`}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
