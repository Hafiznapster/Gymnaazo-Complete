// @ts-nocheck
import { Box, Card, CardContent, Typography, Stack, Chip, Alert } from '@mui/material'
import { FitnessCenter, CheckCircle } from '@mui/icons-material'
import { usePortalData } from '@/hooks/usePortalData'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from '@/utils/formatters'

export default function PortalPTPage() {
  const { data: portalData, isLoading: portalLoading } = usePortalData()
  
  const ptEnrollmentId = portalData?.activePT?.id

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['portalPTSessions', ptEnrollmentId],
    queryFn: async () => {
      if (!ptEnrollmentId) return []
      const { data, error } = await supabase
        .from('pt_sessions')
        .select('*')
        .eq('enrollment_id', ptEnrollmentId)
        .order('session_date', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!ptEnrollmentId
  })

  if (portalLoading || sessionsLoading) return <Box p={3}>Loading...</Box>

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={800} mb={1}>
        Personal Training
      </Typography>

      {!portalData?.activePT ? (
        <Alert severity="info" icon={<FitnessCenter />}>
          You are not currently enrolled in a PT package.
        </Alert>
      ) : (
        <>
          <Card sx={{ bgcolor: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Package</Typography>
              <Typography variant="h6" fontWeight={700} color="#FF6584">
                {(portalData.activePT.pt_packages as any).name}
              </Typography>
              <Typography variant="body2" mt={1}>
                Trainer: {(portalData.activePT.staff_users as any).name}
              </Typography>
              <Typography variant="body2">
                Sessions used: {portalData.activePT.sessions_used} / {portalData.activePT.sessions_total}
              </Typography>
            </CardContent>
          </Card>

          <Typography variant="subtitle2" fontWeight={700} mt={2}>
            Session History
          </Typography>

          {!sessions?.length ? (
            <Typography variant="body2" color="text.secondary">No sessions logged yet.</Typography>
          ) : (
            sessions.map((session: any) => (
              <Card key={session.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle sx={{ color: session.status === 'completed' ? 'success.main' : 'text.secondary' }} />
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(session.session_date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.duration_mins ? `${session.duration_mins} mins` : 'Completed'}
                      {session.notes && ` · ${session.notes}`}
                    </Typography>
                  </Box>
                  <Chip 
                    label={session.status} 
                    size="small" 
                    color={session.status === 'completed' ? 'success' : 'default'}
                    sx={{ fontSize: 10, textTransform: 'capitalize' }}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </Stack>
  )
}
