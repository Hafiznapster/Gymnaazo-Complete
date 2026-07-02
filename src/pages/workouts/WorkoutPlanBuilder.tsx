// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  TextField, IconButton, Divider, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete
} from '@mui/material'
import {
  Add, Delete, DragIndicator, Save, PlayArrow
} from '@mui/icons-material'

// Mock Data for Exercise Library
const EXERCISE_LIBRARY = [
  { id: '1', name: 'Barbell Bench Press', muscle: 'Chest' },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { id: '3', name: 'Barbell Squat', muscle: 'Legs' },
  { id: '4', name: 'Leg Press', muscle: 'Legs' },
  { id: '5', name: 'Pull-ups', muscle: 'Back' },
  { id: '6', name: 'Barbell Row', muscle: 'Back' },
]

export default function WorkoutPlanBuilder() {
  const [planName, setPlanName] = useState('New Workout Plan')
  const [days, setDays] = useState([
    { id: 'day1', name: 'Day 1 - Push', exercises: [] }
  ])

  const [openAddEx, setOpenAddEx] = useState(false)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [selectedEx, setSelectedEx] = useState<any>(null)

  const handleAddDay = () => {
    setDays([...days, { id: Date.now().toString(), name: `Day ${days.length + 1}`, exercises: [] }])
  }

  const handleRemoveDay = (dayId: string) => {
    setDays(days.filter(d => d.id !== dayId))
  }

  const handleOpenAddEx = (dayId: string) => {
    setActiveDayId(dayId)
    setSelectedEx(null)
    setOpenAddEx(true)
  }

  const handleAddExercise = () => {
    if (!selectedEx || !activeDayId) return
    setDays(days.map(d => {
      if (d.id === activeDayId) {
        return {
          ...d,
          exercises: [...d.exercises, { ...selectedEx, sets: '3', reps: '10-12', uid: Date.now().toString() }]
        }
      }
      return d
    }))
    setOpenAddEx(false)
  }

  const handleRemoveExercise = (dayId: string, exUid: string) => {
    setDays(days.map(d => {
      if (d.id === dayId) {
        return { ...d, exercises: d.exercises.filter(e => e.uid !== exUid) }
      }
      return d
    }))
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Workout Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create structured workout routines and assign them to members.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Save />}>
          Save Plan
        </Button>
      </Stack>

      <Card sx={{ mb: 4, bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
        <CardContent>
          <TextField
            fullWidth
            label="Plan Name"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Stack spacing={3}>
            {days.map((day, index) => (
              <Card key={day.id} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <TextField
                      size="small"
                      value={day.name}
                      onChange={(e) => {
                        const newDays = [...days]
                        newDays[index].name = e.target.value
                        setDays(newDays)
                      }}
                      sx={{ width: 250 }}
                    />
                    <IconButton color="error" onClick={() => handleRemoveDay(day.id)}>
                      <Delete />
                    </IconButton>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {day.exercises.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1 }}>
                      No exercises added yet.
                    </Typography>
                  ) : (
                    <Stack spacing={1} mb={2}>
                      {day.exercises.map((ex) => (
                        <Box key={ex.uid} sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                          <DragIndicator sx={{ color: 'text.secondary', mr: 2, cursor: 'grab' }} />
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight={600}>{ex.name}</Typography>
                            <Chip size="small" label={ex.muscle} sx={{ mt: 0.5, height: 20, fontSize: 10 }} />
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField size="small" label="Sets" defaultValue={ex.sets} sx={{ width: 70 }} />
                            <TextField size="small" label="Reps" defaultValue={ex.reps} sx={{ width: 90 }} />
                            <IconButton size="small" color="error" onClick={() => handleRemoveExercise(day.id, ex.uid)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  <Button
                    startIcon={<Add />}
                    onClick={() => handleOpenAddEx(day.id)}
                    sx={{ mt: 1 }}
                  >
                    Add Exercise
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddDay}
            sx={{ mt: 3 }}
            fullWidth
          >
            Add Workout Day
          </Button>
        </CardContent>
      </Card>

      {/* Add Exercise Dialog */}
      <Dialog open={openAddEx} onClose={() => setOpenAddEx(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={EXERCISE_LIBRARY}
            getOptionLabel={(option) => option.name}
            onChange={(_, newValue) => setSelectedEx(newValue)}
            renderInput={(params) => <TextField {...params} label="Search Exercise" autoFocus />}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Muscle: {option.muscle}</Typography>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEx(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddExercise} disabled={!selectedEx}>
            Add to Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
