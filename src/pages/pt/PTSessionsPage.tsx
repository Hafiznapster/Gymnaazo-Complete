import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, Button, Chip,
  Tab, Tabs, Grid, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Skeleton, Divider, LinearProgress, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete,
} from '@mui/material'
import { Add, FitnessCenter, Person, CheckCircle } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useMembers } from '@/hooks/useMembers'
import { useTrainers } from '@/hooks/useStaff'
import {
  usePTPackages, useCreatePTPackage, useUpdatePTPackage,
  usePTEnrollments, useEnrollMember,
  usePTSessions, useLogPTSession,
} from '@/hooks/usePT'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PTPackage } from '@/types/database'

// ─── Package Card ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, onEdit }: { pkg: PTPackage; onEdit: (p: PTPackage) => void }) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: pkg.is_active ? '1px solid rgba(108,99,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
        opacity: pkg.is_active ? 1 : 0.55,
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(108,99,255,0.15)' },
      }}
      onClick={() => onEdit(pkg)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>{pkg.name}</Typography>
          <Chip
            label={pkg.is_active ? 'Active' : 'Inactive'}
            size="small"
            color={pkg.is_active ? 'success' : 'default'}
            sx={{ fontSize: 11 }}
          />
        </Stack>
        <Stack direction="row" spacing={2} mb={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">Sessions</Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main">{pkg.sessions_count}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Validity</Typography>
            <Typography variant="h6" fontWeight={800}>{pkg.validity_days}d</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Price</Typography>
            <Typography variant="h6" fontWeight={800} color="success.main">{formatCurrency(pkg.price)}</Typography>
          </Box>
        </Stack>
        {pkg.description && (
          <Typography variant="caption" color="text.secondary">{pkg.description}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Package Dialog ───────────────────────────────────────────────────────────
const pkgSchema = z.object({
  name: z.string().min(2),
  sessions_count: z.coerce.number().min(1),
  validity_days: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})
type PkgForm = z.infer<typeof pkgSchema>

function PackageDialog({
  editPkg,
  open,
  onClose,
}: {
  editPkg: PTPackage | null
  open: boolean
  onClose: () => void
}) {
  const { mutateAsync: create } = useCreatePTPackage()
  const { mutateAsync: update } = useUpdatePTPackage()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PkgForm>({
    resolver: zodResolver(pkgSchema),
    values: editPkg
      ? { name: editPkg.name, sessions_count: editPkg.sessions_count, validity_days: editPkg.validity_days, price: editPkg.price, description: editPkg.description ?? '', is_active: editPkg.is_active }
      : { sessions_count: 10, validity_days: 60, price: 5000, is_active: true },
  })

  async function onSubmit(data: PkgForm) {
    try {
      if (editPkg) {
        await update({ id: editPkg.id, updates: data })
        toast.success('Package updated!')
      } else {
        await create(data)
        toast.success('Package created!')
      }
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editPkg ? 'Edit Package' : 'New PT Package'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Package Name *" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <Stack direction="row" spacing={2}>
            <TextField label="Sessions *" type="number" fullWidth {...register('sessions_count')} />
            <TextField label="Validity (days) *" type="number" fullWidth {...register('validity_days')} />
          </Stack>
          <TextField label="Price (₹) *" type="number" fullWidth {...register('price')} />
          <TextField label="Description" fullWidth {...register('description')} multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {editPkg ? 'Save Changes' : 'Create Package'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Enroll Dialog ────────────────────────────────────────────────────────────
const enrollSchema = z.object({
  member_id: z.string().min(1, 'Select a member'),
  trainer_id: z.string().min(1, 'Select a trainer'),
  package_id: z.string().min(1, 'Select a package'),
  notes: z.string().optional(),
})
type EnrollForm = z.infer<typeof enrollSchema>

function EnrollDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutateAsync: enroll } = useEnrollMember()
  const { data: members } = useMembers()
  const { data: trainers } = useTrainers()
  const { data: packages } = usePTPackages()

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EnrollForm>({
    resolver: zodResolver(enrollSchema),
  })

  const selectedPkg = packages?.find((p) => p.id === watch('package_id'))

  async function onSubmit(data: EnrollForm) {
    const pkg = packages?.find((p) => p.id === data.package_id)
    if (!pkg) return
    try {
      await enroll({
        member_id: data.member_id,
        trainer_id: data.trainer_id,
        package_id: data.package_id,
        sessions_total: pkg.sessions_count,
        validity_days: pkg.validity_days,
        notes: data.notes,
      })
      toast.success('Member enrolled!')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const memberOpts = (members ?? []).map((m) => ({ id: m.id, label: `${m.name} · ${m.member_code}` }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enroll in PT Package</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Controller
            name="member_id"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={memberOpts}
                getOptionLabel={(o) => o.label}
                value={memberOpts.find((o) => o.id === field.value) ?? null}
                onChange={(_, v) => field.onChange(v?.id ?? '')}
                renderInput={(params) => (
                  <TextField {...params} label="Member *" error={!!errors.member_id} helperText={errors.member_id?.message} />
                )}
              />
            )}
          />
          <Controller
            name="trainer_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.trainer_id}>
                <InputLabel>Trainer *</InputLabel>
                <Select label="Trainer *" {...field}>
                  {(trainers ?? []).map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="package_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.package_id}>
                <InputLabel>PT Package *</InputLabel>
                <Select label="PT Package *" {...field}>
                  {(packages ?? []).filter((p) => p.is_active).map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} — {p.sessions_count} sessions · {formatCurrency(p.price)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          {selectedPkg && (
            <Alert severity="info" icon={false}>
              {selectedPkg.sessions_count} sessions · {selectedPkg.validity_days} day validity · {formatCurrency(selectedPkg.price)}
            </Alert>
          )}
          <TextField label="Notes" multiline rows={2} fullWidth
            {...useForm<EnrollForm>().register?.('notes')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Enroll Member
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PTSessionsPage() {
  const [tab, setTab] = useState(0)
  const [pkgDialog, setPkgDialog] = useState(false)
  const [editPkg, setEditPkg] = useState<PTPackage | null>(null)
  const [enrollDialog, setEnrollDialog] = useState(false)

  const { data: packages, isLoading: pkgLoading } = usePTPackages()
  const { data: enrollments, isLoading: enrollLoading } = usePTEnrollments()
  const { data: sessions, isLoading: sessLoading } = usePTSessions()

  return (
    <Box>
      <TopBar
        title="Personal Training"
        actions={
          <Stack direction="row" spacing={1}>
            {tab === 0 && (
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => { setEditPkg(null); setPkgDialog(true) }}>
                New Package
              </Button>
            )}
            {tab === 1 && (
              <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setEnrollDialog(true)}>
                Enroll Member
              </Button>
            )}
          </Stack>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={`Packages (${packages?.length ?? 0})`} />
            <Tab label={`Active Enrollments (${enrollments?.filter((e: any) => e.status === 'active').length ?? 0})`} />
            <Tab label={`Session Log (${sessions?.length ?? 0})`} />
          </Tabs>
        </Box>

        {/* Packages Tab */}
        {tab === 0 && (
          pkgLoading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={140} /></Grid>)}
            </Grid>
          ) : !packages?.length ? (
            <Alert severity="info">No PT packages yet. Create your first package to get started.</Alert>
          ) : (
            <Grid container spacing={2}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                  <PackageCard pkg={pkg} onEdit={(p) => { setEditPkg(p); setPkgDialog(true) }} />
                </Grid>
              ))}
            </Grid>
          )
        )}

        {/* Enrollments Tab */}
        {tab === 1 && (
          enrollLoading ? <Skeleton variant="rounded" height={300} /> : (
            <Stack spacing={1.5}>
              {!(enrollments?.length) ? (
                <Alert severity="info">No active PT enrollments.</Alert>
              ) : (
                (enrollments as any[]).map((enrollment) => {
                  const member = enrollment.members as any
                  const pkg = enrollment.pt_packages as any
                  const trainer = enrollment.staff_users as any
                  const pct = Math.round((enrollment.sessions_used / enrollment.sessions_total) * 100)

                  return (
                    <Card key={enrollment.id}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.dark', fontSize: 14, width: 36, height: 36 }}>
                                {member?.name?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{member?.name}</Typography>
                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">{member?.member_code}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Package</Typography>
                            <Typography variant="body2" fontWeight={600}>{pkg?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Trainer: {trainer?.name}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              {enrollment.sessions_used} / {enrollment.sessions_total} sessions
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ mt: 0.5, mb: 0.5, height: 6, borderRadius: 3 }}
                              color={pct >= 90 ? 'error' : pct >= 70 ? 'warning' : 'primary'}
                            />
                            {enrollment.expires_at && (
                              <Typography variant="caption" color="text.secondary">
                                Expires: {formatDate(enrollment.expires_at)}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Chip
                              label={enrollment.status}
                              size="small"
                              color={enrollment.status === 'active' ? 'success' : 'default'}
                              sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </Stack>
          )
        )}

        {/* Sessions Tab */}
        {tab === 2 && (
          sessLoading ? <Skeleton variant="rounded" height={300} /> : (
            <Stack spacing={1}>
              {!(sessions?.length) ? (
                <Alert severity="info">No PT sessions logged yet.</Alert>
              ) : (
                (sessions as any[]).map((session) => {
                  const member = session.members as any
                  const trainer = session.staff_users as any

                  return (
                    <Card key={session.id}>
                      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircle
                          sx={{
                            color: session.status === 'completed' ? 'success.main' : session.status === 'no_show' ? 'error.main' : 'text.secondary',
                            fontSize: 20, flexShrink: 0,
                          }}
                        />
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={700}>{member?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">with</Typography>
                            <Typography variant="body2" fontWeight={600}>{trainer?.name}</Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(session.session_date)}
                            {session.duration_mins && ` · ${session.duration_mins} mins`}
                            {session.notes && ` · ${session.notes}`}
                          </Typography>
                        </Box>
                        <Chip
                          label={session.status.replace('_', ' ')}
                          size="small"
                          color={session.status === 'completed' ? 'success' : session.status === 'no_show' ? 'error' : 'default'}
                          sx={{ fontSize: 11, textTransform: 'capitalize' }}
                        />
                        {session.member_rating && (
                          <Typography variant="caption" color="warning.main">
                            {'★'.repeat(session.member_rating)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </Stack>
          )
        )}
      </Box>

      <PackageDialog
        editPkg={editPkg}
        open={pkgDialog}
        onClose={() => { setPkgDialog(false); setEditPkg(null) }}
      />
      <EnrollDialog open={enrollDialog} onClose={() => setEnrollDialog(false)} />
    </Box>
  )
}
