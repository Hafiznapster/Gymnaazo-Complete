// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip, Grid
} from '@mui/material'
import { Add, Build, Delete, FitnessCenter, SettingsBackupRestore } from '@mui/icons-material'
import { format, addMonths } from 'date-fns'

const MOCK_EQUIPMENT = [
  { id: '1', name: 'Treadmill T1000', category: 'Cardio', brand: 'Matrix', status: 'working', warranty: addMonths(new Date(), 12) },
  { id: '2', name: 'Leg Press Machine', category: 'Strength', brand: 'Hammer Strength', status: 'maintenance', warranty: addMonths(new Date(), -2) },
  { id: '3', name: 'Dumbbell Rack (5-50kg)', category: 'Free Weights', brand: 'Rogue', status: 'working', warranty: addMonths(new Date(), 24) },
  { id: '4', name: 'Rowing Ergometer', category: 'Cardio', brand: 'Concept2', status: 'out_of_order', warranty: addMonths(new Date(), 6) },
]

export default function EquipmentPage() {
  const [openAdd, setOpenAdd] = useState(false)

  const workingCount = MOCK_EQUIPMENT.filter(e => e.status === 'working').length
  const maintenanceCount = MOCK_EQUIPMENT.filter(e => e.status === 'maintenance').length
  const brokenCount = MOCK_EQUIPMENT.filter(e => e.status === 'out_of_order').length

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Equipment & Assets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your gym machines, track maintenance, and monitor warranties.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
          Add Equipment
        </Button>
      </Stack>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
                <FitnessCenter fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Operational</Typography>
                <Typography variant="h4" fontWeight={700}>{workingCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <SettingsBackupRestore fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Under Maintenance</Typography>
                <Typography variant="h4" fontWeight={700}>{maintenanceCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <Build fontSize="large" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Out of Order</Typography>
                <Typography variant="h4" fontWeight={700}>{brokenCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Machine Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Warranty Expiry</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_EQUIPMENT.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.brand}</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={row.status.replace('_', ' ').toUpperCase()} 
                    color={row.status === 'working' ? 'success' : row.status === 'maintenance' ? 'warning' : 'error'}
                    sx={{ fontWeight: 700, fontSize: 10 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={new Date() > row.warranty ? 'error.main' : 'text.primary'}>
                    {format(row.warranty, 'MMM do, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <Build fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Equipment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Equipment Name" fullWidth />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" defaultValue="Cardio">
                  <MenuItem value="Cardio">Cardio</MenuItem>
                  <MenuItem value="Strength">Strength</MenuItem>
                  <MenuItem value="Free Weights">Free Weights</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Brand" fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Purchase Date" InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="date" label="Warranty Expiry" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <TextField label="Purchase Price (₹)" type="number" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAdd(false)}>Save Equipment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
