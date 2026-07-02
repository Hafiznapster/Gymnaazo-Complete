// @ts-nocheck
import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Switch, FormControlLabel, Chip,
  IconButton, Tooltip, Skeleton,
} from '@mui/material'
import { Add, Edit, FitnessCenter } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePlans, useCreatePlan, useUpdatePlan, useTogglePlanStatus } from '@/hooks/usePlans'
import { formatCurrency } from '@/utils/formatters'
import type { MembershipPlan } from '@/types/database'

const schema = z.object({
  name: z.string().min(2, 'Plan name required'),
  category: z.string().optional(),
  duration_days: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  description: z.string().optional(),
  perks: z.string().optional(), // comma-separated
})
type FormData = z.infer<typeof schema>

const CATEGORIES = ['Regular', 'Premium', 'Student', 'Corporate', 'PT', 'Trial']

interface PlanFormDialogProps {
  open: boolean
  onClose: () => void
  editPlan?: MembershipPlan | null
}

function PlanFormDialog({ open, onClose, editPlan }: PlanFormDialogProps) {
  const { mutateAsync: createPlan } = useCreatePlan()
  const { mutateAsync: updatePlan } = useUpdatePlan()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editPlan
      ? {
          name: editPlan.name,
          category: editPlan.category ?? '',
          duration_days: editPlan.duration_days,
          price: editPlan.price,
          description: editPlan.description ?? '',
          perks: editPlan.perks.join(', '),
        }
      : {},
  })

  async function onSubmit(data: FormData) {
    try {
      const perks = data.perks
        ? data.perks.split(',').map((p) => p.trim()).filter(Boolean)
        : []

      if (editPlan) {
        await updatePlan({ id: editPlan.id, ...data, perks })
        toast.success('Plan updated!')
      } else {
        await createPlan({ ...data, perks })
        toast.success('Plan created!')
      }
      reset()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {editPlan ? 'Edit Plan' : 'Create New Plan'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Plan Name *"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Category"
              fullWidth
              {...register('category')}
              select
              SelectProps={{ native: true }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Duration (days) *"
              type="number"
              fullWidth
              {...register('duration_days')}
              error={!!errors.duration_days}
              helperText={errors.duration_days?.message}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price (₹) *"
              type="number"
              fullWidth
              {...register('price')}
              error={!!errors.price}
              helperText={errors.price?.message}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              {...register('description')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Perks (comma-separated)"
              fullWidth
              {...register('perks')}
              placeholder="Gym access, Locker room, Free assessment"
              helperText="Separate each perk with a comma"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : editPlan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans(false) // Show all including inactive
  const { mutateAsync: toggleStatus } = useTogglePlanStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<MembershipPlan | null>(null)

  function handleEdit(plan: MembershipPlan) {
    setEditPlan(plan)
    setDialogOpen(true)
  }

  function handleClose() {
    setDialogOpen(false)
    setEditPlan(null)
  }

  async function handleToggle(plan: MembershipPlan) {
    try {
      await toggleStatus({ id: plan.id, is_active: !plan.is_active })
      toast.success(`Plan ${plan.is_active ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update plan status')
    }
  }

  return (
    <Box>
      <TopBar
        title="Membership Plans"
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            onClick={() => setDialogOpen(true)}
          >
            New Plan
          </Button>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        {isLoading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={220} />
              </Grid>
            ))}
          </Grid>
        ) : !plans || plans.length === 0 ? (
          <EmptyState
            icon={<FitnessCenter />}
            title="No plans yet"
            description="Create your first membership plan to get started."
            actionLabel="Create Plan"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={2.5}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    opacity: plan.is_active ? 1 : 0.55,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {plan.name}
                        </Typography>
                        {plan.category && (
                          <Chip
                            label={plan.category}
                            size="small"
                            sx={{ mt: 0.5, fontSize: 11 }}
                          />
                        )}
                      </Box>
                      <Tooltip title="Edit plan">
                        <IconButton size="small" onClick={() => handleEdit(plan)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography variant="h4" fontWeight={700} color="primary.main" my={2}>
                      {formatCurrency(plan.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {plan.duration_days} days
                      {plan.description ? ` · ${plan.description}` : ''}
                    </Typography>

                    {plan.perks.length > 0 && (
                      <Stack spacing={0.5} mb={2}>
                        {plan.perks.map((perk) => (
                          <Typography key={perk} variant="caption" color="text.secondary">
                            ✓ {perk}
                          </Typography>
                        ))}
                      </Stack>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={plan.is_active}
                          onChange={() => handleToggle(plan)}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="caption" color={plan.is_active ? 'success.main' : 'text.secondary'}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <PlanFormDialog open={dialogOpen} onClose={handleClose} editPlan={editPlan} />
    </Box>
  )
}
