import { useState } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Chip, Avatar, Stack, Switch, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Tooltip, Skeleton,
} from '@mui/material'
import { Add, Edit, Block, CheckCircle } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useStaff, useUpdateStaff, useToggleStaffActive } from '@/hooks/useStaff'
import { useAuthStore } from '@/store/authStore'
import type { StaffUser } from '@/types/database'

const ROLE_COLOR: Record<StaffUser['role'], 'primary' | 'secondary' | 'default' | 'warning'> = {
  owner: 'primary',
  manager: 'secondary',
  receptionist: 'default',
  trainer: 'warning',
}

const editSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['owner', 'manager', 'receptionist', 'trainer']),
})
type EditForm = z.infer<typeof editSchema>

function EditDialog({
  staff,
  open,
  onClose,
}: {
  staff: StaffUser | null
  open: boolean
  onClose: () => void
}) {
  const { mutateAsync: updateStaff } = useUpdateStaff()
  const { staffUser: currentUser } = useAuthStore()

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: staff ? { name: staff.name, phone: staff.phone ?? '', role: staff.role } : undefined,
  })

  async function onSubmit(data: EditForm) {
    if (!staff) return
    try {
      await updateStaff({ id: staff.id, updates: data })
      toast.success('Staff updated!')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const isSelf = staff?.id === currentUser?.id

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Staff Member</DialogTitle>
      <DialogContent>
        {isSelf && (
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            You are editing your own profile. Role changes will take effect on next login.
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Full Name" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Phone" fullWidth {...register('phone')} />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select label="Role" {...field} disabled={isSelf && currentUser?.role === 'owner'}>
                  <MenuItem value="owner">Owner</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="trainer">Trainer</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function StaffPage() {
  const { data: staff, isLoading } = useStaff()
  const { mutateAsync: toggleActive } = useToggleStaffActive()
  const { staffUser: currentUser } = useAuthStore()
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null)

  async function handleToggle(s: StaffUser) {
    if (s.id === currentUser?.id) {
      toast.error("You can't deactivate yourself")
      return
    }
    try {
      await toggleActive({ id: s.id, is_active: !s.is_active })
      toast.success(`${s.name} ${s.is_active ? 'deactivated' : 'activated'}`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Box>
      <TopBar
        title="Staff Management"
        actions={
          <Tooltip title="New staff must first sign up via Supabase Auth, then be linked here">
            <Button variant="contained" startIcon={<Add />} size="small" disabled>
              Invite Staff
            </Button>
          </Tooltip>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>To add a new staff member:</strong> Create their account in{' '}
            <strong>Supabase Dashboard → Authentication → Users</strong>, then insert a row in{' '}
            <code>staff_users</code> with their <code>user_id</code> and <code>gym_id</code>.
            Self-service invite flow is a Phase 3 feature.
          </Typography>
        </Alert>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><Skeleton height={20} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : (staff ?? []).map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36, height: 36,
                                bgcolor: s.id === currentUser?.id ? 'primary.main' : 'primary.dark',
                                fontSize: 14,
                              }}
                            >
                              {s.name[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {s.name}
                                {s.id === currentUser?.id && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="primary.main"
                                    sx={{ ml: 0.5 }}
                                  >
                                    (you)
                                  </Typography>
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {s.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.role}
                            size="small"
                            color={ROLE_COLOR[s.role]}
                            sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {s.phone ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={s.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={s.is_active ? 'success' : 'default'}
                            icon={s.is_active ? <CheckCircle /> : <Block />}
                            sx={{ fontSize: 11 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => setEditTarget(s)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={s.is_active ? 'Deactivate' : 'Activate'}>
                              <Switch
                                size="small"
                                checked={s.is_active}
                                onChange={() => handleToggle(s)}
                                disabled={s.id === currentUser?.id}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <EditDialog
          staff={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      </Box>
    </Box>
  )
}
