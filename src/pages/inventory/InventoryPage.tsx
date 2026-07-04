// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material'
import { Add, AddShoppingCart, Edit, Warning } from '@mui/icons-material'

const MOCK_INVENTORY = [
  { id: '1', name: 'Whey Protein (Optimum Nutrition)', category: 'Supplements', quantity: 12, threshold: 5, price: 6500 },
  { id: '2', name: 'Mineral Water Bottle (1L)', category: 'Beverages', quantity: 45, threshold: 20, price: 40 },
  { id: '3', name: 'Gymnazo Branded T-Shirt', category: 'Merchandise', quantity: 3, threshold: 10, price: 800 },
  { id: '4', name: 'Pre-workout (C4)', category: 'Supplements', quantity: 8, threshold: 5, price: 2500 },
]

export default function InventoryPage() {
  const [openAdd, setOpenAdd] = useState(false)

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track consumables, supplements, and merchandise stock levels.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
          Add Item
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Stock Level</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_INVENTORY.map((row) => {
              const isLowStock = row.quantity <= row.threshold
              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      {row.name}
                      {isLowStock && <Warning color="error" fontSize="small" titleAccess="Low Stock!" />}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.category} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color={isLowStock ? 'error.main' : 'text.primary'}>
                      {row.quantity} units
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (Min: {row.threshold})
                    </Typography>
                  </TableCell>
                  <TableCell>₹{row.price}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" title="Update Stock">
                      <AddShoppingCart fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="info" title="Edit Item">
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Item Name" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" defaultValue="Supplements">
                <MenuItem value="Supplements">Supplements</MenuItem>
                <MenuItem value="Beverages">Beverages</MenuItem>
                <MenuItem value="Merchandise">Merchandise</MenuItem>
                <MenuItem value="Consumables">Consumables</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField label="Initial Quantity" type="number" defaultValue={0} fullWidth />
              <TextField label="Low Stock Alert Threshold" type="number" defaultValue={5} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Cost Price (₹)" type="number" fullWidth />
              <TextField label="Selling Price (₹)" type="number" fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAdd(false)}>Save Item</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
