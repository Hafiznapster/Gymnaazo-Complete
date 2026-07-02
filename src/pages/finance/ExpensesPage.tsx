// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material'
import { Add, Delete, AttachMoney, TrendingDown } from '@mui/icons-material'
import { format } from 'date-fns'

const MOCK_EXPENSES = [
  { id: '1', amount: 45000, category: 'Rent', date: new Date(), notes: 'Monthly rent for July' },
  { id: '2', amount: 8500, category: 'Utilities', date: new Date(), notes: 'Electricity bill' },
  { id: '3', amount: 12000, category: 'Marketing', date: new Date(), notes: 'Instagram Ads' },
  { id: '4', amount: 2500, category: 'Maintenance', date: new Date(), notes: 'Treadmill repair' },
]

export default function ExpensesPage() {
  const [openAdd, setOpenAdd] = useState(false)

  const totalExpenses = MOCK_EXPENSES.reduce((acc, exp) => acc + exp.amount, 0)

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Expenses & Ledger
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Log operational expenses to accurately track Profit & Loss.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
          Log Expense
        </Button>
      </Stack>

      <Stack direction="row" spacing={3} mb={4}>
        <Card sx={{ flex: 1, bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 101, 132, 0.1)', color: '#FF6584' }}>
              <TrendingDown fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Expenses (This Month)</Typography>
              <Typography variant="h4" fontWeight={700}>₹{totalExpenses.toLocaleString()}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <TableContainer component={Paper} sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_EXPENSES.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{format(row.date, 'MMM do, yyyy')}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.category} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                  -₹{row.amount.toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{row.notes}</TableCell>
                <TableCell align="right">
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
        <DialogTitle>Log New Expense</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Amount (₹)" type="number" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" defaultValue="Rent">
                <MenuItem value="Rent">Rent</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Salaries">Salaries</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Equipment">Equipment</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Misc">Misc</MenuItem>
              </Select>
            </FormControl>
            <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} defaultValue={format(new Date(), 'yyyy-MM-dd')} fullWidth />
            <TextField label="Notes" multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAdd(false)}>Save Expense</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
