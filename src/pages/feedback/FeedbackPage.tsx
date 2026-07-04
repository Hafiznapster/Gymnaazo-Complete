// @ts-nocheck
import { Box, Typography, Stack, Card, CardContent, Grid, Chip, Rating, Avatar, IconButton } from '@mui/material'
import { Reply, CheckCircleOutline, FilterList } from '@mui/icons-material'
import { format, subDays } from 'date-fns'

const MOCK_FEEDBACK = [
  { id: '1', rating: 5, type: 'pt_session', member: 'Rahul Sharma', text: 'Great session with Mike today! Really pushed me.', date: new Date(), status: 'new' },
  { id: '2', rating: 4, type: 'facility', member: 'Priya Patel', text: 'The AC in the cardio section wasn\'t working very well.', date: subDays(new Date(), 1), status: 'reviewed' },
  { id: '3', rating: 2, type: 'general', member: 'Anonymous', text: 'Music was too loud this morning.', date: subDays(new Date(), 2), status: 'resolved' },
  { id: '4', rating: 5, type: 'class', member: 'Amit Kumar', text: 'Loved the Zumba class with Priya!', date: subDays(new Date(), 3), status: 'new' },
]

export default function FeedbackPage() {
  const avgRating = (MOCK_FEEDBACK.reduce((acc, curr) => acc + curr.rating, 0) / MOCK_FEEDBACK.length).toFixed(1)
  const npsScore = 75 // Mock NPS

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Feedback & Reviews
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor member satisfaction and respond to concerns.
          </Typography>
        </Box>
        <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}><FilterList /></IconButton>
      </Stack>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Typography variant="h2" fontWeight={700} color="primary.main">{avgRating}</Typography>
              <Rating value={parseFloat(avgRating)} precision={0.1} readOnly size="large" sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">Average Rating ({MOCK_FEEDBACK.length} reviews)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <Typography variant="h2" fontWeight={700} color="success.main">{npsScore}</Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>Excellent</Typography>
              <Typography variant="body2" color="text.secondary">Net Promoter Score (NPS)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack spacing={2}>
        {MOCK_FEEDBACK.map((fb) => (
          <Card key={fb.id} sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', borderLeft: `4px solid ${fb.rating >= 4 ? '#22C55E' : fb.rating === 3 ? '#F59E0B' : '#EF4444'}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.dark' }}>{fb.member[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{fb.member}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(fb.date, 'MMM do, yyyy • h:mm a')}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={fb.type.replace('_', ' ').toUpperCase()} sx={{ fontSize: 10, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  {fb.status === 'new' && <Chip size="small" color="error" label="NEW" sx={{ fontSize: 10 }} />}
                  {fb.status === 'resolved' && <Chip size="small" color="success" label="RESOLVED" sx={{ fontSize: 10 }} />}
                </Stack>
              </Stack>
              
              <Rating value={fb.rating} readOnly size="small" sx={{ mb: 1 }} />
              <Typography variant="body1" sx={{ mb: 2 }}>"{fb.text}"</Typography>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" startIcon={<CheckCircleOutline />} color="success">Mark Resolved</Button>
                <Button size="small" startIcon={<Reply />} variant="outlined">Reply</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
