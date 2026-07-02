// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button,
  Grid, Avatar, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Divider
} from '@mui/material'
import { Add, Phone, Mail, MoreVert, Circle } from '@mui/icons-material'

const MOCK_LEADS = [
  { id: '1', name: 'Rahul Sharma', phone: '+91 9876543210', status: 'new', source: 'Instagram' },
  { id: '2', name: 'Priya Patel', phone: '+91 9876543211', status: 'contacted', source: 'Walk-in' },
  { id: '3', name: 'Amit Kumar', phone: '+91 9876543212', status: 'trial_scheduled', source: 'Referral' },
  { id: '4', name: 'Neha Singh', phone: '+91 9876543213', status: 'converted', source: 'Website' },
]

const PIPELINE_STAGES = [
  { id: 'new', label: 'New Leads', color: 'primary.main' },
  { id: 'contacted', label: 'Contacted', color: 'warning.main' },
  { id: 'trial_scheduled', label: 'Trial Scheduled', color: 'info.main' },
  { id: 'converted', label: 'Converted', color: 'success.main' },
]

export default function LeadsPage() {
  const [openAdd, setOpenAdd] = useState(false)
  const [leads, setLeads] = useState(MOCK_LEADS)

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Lead Management (CRM)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track inquiries, manage trials, and convert prospects to members.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setOpenAdd(true)}>
          Add Lead
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage.id)
          return (
            <Grid item xs={12} md={3} key={stage.id} sx={{ height: '100%' }}>
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.02)', 
                borderRadius: 2, 
                p: 2, 
                height: '100%',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Circle sx={{ color: stage.color, fontSize: 12 }} />
                    <Typography variant="subtitle1" fontWeight={700}>{stage.label}</Typography>
                  </Box>
                  <Chip size="small" label={stageLeads.length} sx={{ fontWeight: 700 }} />
                </Stack>
                
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2} sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
                  {stageLeads.map(lead => (
                    <Card key={lead.id} sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle2" fontWeight={700}>{lead.name}</Typography>
                          <IconButton size="small" sx={{ mt: -0.5, mr: -0.5 }}><MoreVert fontSize="small" /></IconButton>
                        </Stack>
                        
                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{lead.phone}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                            <Chip size="small" label={lead.source} sx={{ fontSize: 10, height: 20, bgcolor: 'rgba(255,255,255,0.05)' }} />
                            {stage.id !== 'converted' && (
                              <Button size="small" sx={{ fontSize: 10, py: 0 }}>Move &rarr;</Button>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth />
            <TextField label="Phone Number" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select label="Source" defaultValue="Walk-in">
                <MenuItem value="Walk-in">Walk-in</MenuItem>
                <MenuItem value="Instagram">Instagram</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Website">Website</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenAdd(false)}>Save Lead</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
