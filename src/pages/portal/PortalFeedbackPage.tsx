// @ts-nocheck
import { useState } from 'react'
import { Box, Typography, Card, CardContent, Button, TextField, Rating, Stack, FormControlLabel, Switch } from '@mui/material'
import { Send } from '@mui/icons-material'

export default function PortalFeedbackPage() {
  const [rating, setRating] = useState<number | null>(0)
  const [comments, setComments] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setRating(0)
      setComments('')
      setIsAnonymous(false)
      setSubmitted(false)
    }, 3000)
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Feedback
      </Typography>

      <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {submitted ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="success.main" mb={1}>Thank You!</Typography>
              <Typography variant="body2" color="text.secondary">Your feedback helps us improve.</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                How was your experience today?
              </Typography>
              
              <Rating 
                value={rating} 
                onChange={(event, newValue) => setRating(newValue)} 
                size="large"
                sx={{ fontSize: 40, mb: 4 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Tell us what you liked or how we can improve..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%" mb={3}>
                <FormControlLabel
                  control={<Switch size="small" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />}
                  label={<Typography variant="body2">Submit Anonymously</Typography>}
                />
              </Stack>

              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                endIcon={<Send />}
                disabled={!rating}
                onClick={handleSubmit}
              >
                Submit Feedback
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  )
}
