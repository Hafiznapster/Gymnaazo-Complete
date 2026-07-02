// @ts-nocheck
import { useState } from 'react'
import { Box, Card, CardContent, Typography, Stack, Chip, Button, Avatar } from '@mui/material'
import { EventAvailable, AccessTime, People } from '@mui/icons-material'
import { format, addDays } from 'date-fns'

const MOCK_CLASSES = [
  { id: '1', name: 'Morning Yoga', trainer: 'Sarah', time: '07:00 AM', duration: 60, capacity: 20, booked: 12, date: new Date() },
  { id: '2', name: 'HIIT Bootcamp', trainer: 'Mike', time: '09:00 AM', duration: 45, capacity: 15, booked: 15, date: new Date() },
  { id: '3', name: 'Zumba Dance', trainer: 'Priya', time: '06:00 PM', duration: 60, capacity: 25, booked: 18, date: addDays(new Date(), 1) },
]

export default function PortalClassesPage() {
  const [bookedClasses, setBookedClasses] = useState<string[]>(['1'])

  const handleBook = (id: string) => {
    setBookedClasses(prev => [...prev, id])
  }

  const handleCancel = (id: string) => {
    setBookedClasses(prev => prev.filter(cId => cId !== id))
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Book a Class
      </Typography>

      <Stack spacing={2}>
        {MOCK_CLASSES.map(cls => {
          const isBooked = bookedClasses.includes(cls.id)
          const isFull = cls.booked >= cls.capacity && !isBooked

          return (
            <Card key={cls.id} sx={{ bgcolor: 'rgba(255,255,255,0.03)', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Box>
                    <Chip 
                      size="small" 
                      label={format(cls.date, 'MMM do')} 
                      sx={{ mb: 1, fontSize: 10, height: 20, bgcolor: 'rgba(255,255,255,0.1)' }} 
                    />
                    <Typography variant="h6" fontWeight={700} fontSize={16}>{cls.name}</Typography>
                  </Box>
                  {isBooked && (
                    <Chip size="small" color="success" label="Booked" sx={{ height: 20, fontSize: 10 }} />
                  )}
                  {isFull && (
                    <Chip size="small" color="error" label="Full" sx={{ height: 20, fontSize: 10 }} />
                  )}
                </Stack>

                <Stack spacing={1} mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {cls.time} ({cls.duration} mins)
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'secondary.main' }}>
                      {cls.trainer[0]}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" fontSize={13}>
                      {cls.trainer}
                    </Typography>
                  </Box>
                </Stack>

                {isBooked ? (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    fullWidth 
                    onClick={() => handleCancel(cls.id)}
                    size="small"
                  >
                    Cancel Booking
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    disabled={isFull}
                    onClick={() => handleBook(cls.id)}
                    size="small"
                  >
                    {isFull ? 'Waitlist Full' : 'Book Spot'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}
