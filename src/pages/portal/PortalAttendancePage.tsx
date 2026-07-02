// @ts-nocheck
import { Box, Card, CardContent, Typography, Stack, Alert } from '@mui/material'
import { AssignmentTurnedIn, DirectionsRun } from '@mui/icons-material'
import { usePortalData } from '@/hooks/usePortalData'
import { formatDate, formatTime } from '@/utils/formatters'

export default function PortalAttendancePage() {
  const { data, isLoading } = usePortalData()
  // Note: we can fetch full attendance history by calling supabase directly, 
  // but for now usePortalData has recent 5. Let's create a dedicated fetch here if needed, 
  // but for MVP using the existing recent is okay, or we can quickly fetch it.
  const attendance = data?.recentAttendance || []

  if (isLoading) return <Box p={3}>Loading...</Box>

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={800} mb={1}>
        Attendance History
      </Typography>

      {!attendance.length ? (
        <Alert severity="info" icon={<AssignmentTurnedIn />}>
          You haven't checked in yet.
        </Alert>
      ) : (
        attendance.map((log: any) => (
          <Card key={log.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DirectionsRun sx={{ color: 'primary.main' }} />
              </Box>
              <Box flex={1}>
                <Typography variant="body1" fontWeight={700}>
                  {formatDate(log.check_in_time)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check-in: {formatTime(log.check_in_time)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  )
}
