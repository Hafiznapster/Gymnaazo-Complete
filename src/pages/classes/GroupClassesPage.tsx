// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  Grid, Avatar, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material'
import { Add, Event, AccessTime, People, Edit, Delete } from '@mui/icons-material'
import { format, addDays } from 'date-fns'

const MOCK_CLASSES = [
  { id: '1', name: 'Morning Yoga', trainer: 'Sarah', time: '07:00 AM', duration: 60, capacity: 20, booked: 12, date: new Date() },
  { id: '2', name: 'HIIT Bootcamp', trainer: 'Mike', time: '09:00 AM', duration: 45, capacity: 15, booked: 15, date: new Date() },
  { id: '3', name: 'Zumba Dance', trainer: 'Priya', time: '06:00 PM', duration: 60, capacity: 25, booked: 18, date: addDays(new Date(), 1) },
]

export default function GroupClassesPage() {
  const [openAdd, setOpenAdd] = useState(false)

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Class Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage group classes, assign trainers, and track bookings.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
          Schedule Class
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {MOCK_CLASSES.map((cls) => {
          const isFull = cls.booked >= cls.capacity
          return (
            <Grid item xs={12} md={4} key={cls.id}>
              <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', position: 'relative' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Chip 
                        size="small" 
                        label={format(cls.date, 'MMM do')} 
                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }} 
                      />
                      <Typography variant="h6" fontWeight={700}>{cls.name}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Stack>

                  <Stack spacing={1.5} mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {cls.time} ({cls.duration} mins)
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'secondary.main' }}>
                        {cls.trainer[0]}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        Trainer: {cls.trainer}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {cls.booked} / {cls.capacity} Booked
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                      width: `${(cls.booked / cls.capacity) * 100}%`, 
                      height: '100%', 
                      bgcolor: isFull ? 'error.main' : 'success.main' 
                    }} />
                  </Box>
                  
                  {isFull && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                      Class is fully booked
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Class</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Class Name" fullWidth placeholder="e.g. Yoga, Zumba" />
            <FormControl fullWidth>
              <InputLabel>Trainer</InputLabel>
              <Select label="Trainer" defaultValue="1">
                <MenuItem value="1">Sarah</MenuItem>
                <MenuItem value="2">Mike</MenuItem>
                <MenuItem value="3">Priya</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="time" label="Time" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField type="number" label="Duration (mins)" defaultValue={60} fullWidth />
              <TextField type="number" label="Max Capacity" defaultValue={20} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAdd(false)}>Schedule Class</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
