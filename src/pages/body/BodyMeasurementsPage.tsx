import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField,
  Grid, Chip, Alert, IconButton, Tooltip, Skeleton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import { Add, Delete, TrendingUp, Scale, ArrowBack } from '@mui/icons-material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useMemberById } from '@/hooks/useMembers'
import { useMemberMeasurements, useLogMeasurement, useDeleteMeasurement } from '@/hooks/useBodyMeasurements'
import { formatDate } from '@/utils/formatters'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

const schema = z.object({
  recorded_at: z.string().min(1),
  weight_kg: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
  body_fat_pct: z.coerce.number().min(0).max(100).optional(),
  chest_cm: z.coerce.number().min(0).optional(),
  waist_cm: z.coerce.number().min(0).optional(),
  hips_cm: z.coerce.number().min(0).optional(),
  arms_cm: z.coerce.number().min(0).optional(),
  thighs_cm: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const CHART_METRICS = [
  { key: 'weight_kg', label: 'Weight (kg)', color: '#6C63FF' },
  { key: 'waist_cm', label: 'Waist (cm)', color: '#FF6584' },
  { key: 'chest_cm', label: 'Chest (cm)', color: '#22C55E' },
  { key: 'arms_cm', label: 'Arms (cm)', color: '#F59E0B' },
  { key: 'body_fat_pct', label: 'Body Fat %', color: '#3B82F6' },
]

function AddMeasurementDialog({
  memberId,
  open,
  onClose,
}: {
  memberId: string
  open: boolean
  onClose: () => void
}) {
  const { mutateAsync: log } = useLogMeasurement()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { recorded_at: format(new Date(), 'yyyy-MM-dd') },
  })

  async function onSubmit(data: FormData) {
    try {
      await log({
        member_id: memberId,
        recorded_at: data.recorded_at,
        weight_kg: data.weight_kg ?? null,
        height_cm: data.height_cm ?? null,
        body_fat_pct: data.body_fat_pct ?? null,
        chest_cm: data.chest_cm ?? null,
        waist_cm: data.waist_cm ?? null,
        hips_cm: data.hips_cm ?? null,
        arms_cm: data.arms_cm ?? null,
        thighs_cm: data.thighs_cm ?? null,
        notes: data.notes ?? null,
      })
      toast.success('Measurement logged!')
      reset()
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Measurement</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <TextField label="Date" type="date" fullWidth {...register('recorded_at')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6}><TextField label="Weight (kg)" type="number" fullWidth {...register('weight_kg')} inputProps={{ step: 0.1 }} /></Grid>
          <Grid item xs={6}><TextField label="Height (cm)" type="number" fullWidth {...register('height_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={6}><TextField label="Body Fat %" type="number" fullWidth {...register('body_fat_pct')} inputProps={{ step: 0.1 }} /></Grid>
          <Grid item xs={6}><TextField label="Chest (cm)" type="number" fullWidth {...register('chest_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={6}><TextField label="Waist (cm)" type="number" fullWidth {...register('waist_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={6}><TextField label="Hips (cm)" type="number" fullWidth {...register('hips_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={6}><TextField label="Arms (cm)" type="number" fullWidth {...register('arms_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={6}><TextField label="Thighs (cm)" type="number" fullWidth {...register('thighs_cm')} inputProps={{ step: 0.5 }} /></Grid>
          <Grid item xs={12}><TextField label="Notes" fullWidth multiline rows={2} {...register('notes')} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          Log Measurement
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function BodyMeasurementsPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: member } = useMemberById(memberId!)
  const { data: measurements, isLoading } = useMemberMeasurements(memberId!)
  const { mutateAsync: deleteMeasurement } = useDeleteMeasurement()

  const chartData = (measurements ?? []).map((m) => ({
    date: format(new Date(m.recorded_at), 'MMM dd'),
    weight_kg: m.weight_kg,
    waist_cm: m.waist_cm,
    chest_cm: m.chest_cm,
    arms_cm: m.arms_cm,
    body_fat_pct: m.body_fat_pct,
  }))

  // Compute latest vs first difference
  const latest = measurements?.at(-1)
  const first = measurements?.[0]
  const diff = (key: keyof typeof latest) =>
    latest && first && latest[key] != null && first[key] != null
      ? Number(latest[key]) - Number(first[key])
      : null

  async function handleDelete(id: string) {
    try {
      await deleteMeasurement({ id, memberId: memberId! })
      toast.success('Measurement deleted')
      setDeleteTarget(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Box>
      <TopBar
        title={`Body Progress — ${member?.name ?? '…'}`}
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBack />} size="small" onClick={() => navigate(`/members/${memberId}`)}>
              Back
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small" onClick={() => setAddOpen(true)}>
              Log Measurement
            </Button>
          </Stack>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Summary chips */}
        {latest && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={3}>
            {[
              { label: 'Weight', value: latest.weight_kg ? `${latest.weight_kg} kg` : null, diffKey: 'weight_kg' },
              { label: 'Waist', value: latest.waist_cm ? `${latest.waist_cm} cm` : null, diffKey: 'waist_cm' },
              { label: 'Body Fat', value: latest.body_fat_pct ? `${latest.body_fat_pct}%` : null, diffKey: 'body_fat_pct' },
            ].map((item) => {
              const d = diff(item.diffKey as keyof typeof latest)
              if (!item.value) return null
              return (
                <Card key={item.label} sx={{ minWidth: 120 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" fontWeight={800}>{item.value}</Typography>
                    {d !== null && (
                      <Chip
                        label={`${d > 0 ? '+' : ''}${d.toFixed(1)}`}
                        size="small"
                        color={d < 0 ? 'success' : d > 0 ? 'error' : 'default'}
                        sx={{ mt: 0.5, fontSize: 10, fontWeight: 700 }}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}

        {/* Progress Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Progress Chart
            </Typography>
            {isLoading ? (
              <Skeleton variant="rounded" height={220} />
            ) : chartData.length < 2 ? (
              <Alert severity="info">
                Log at least 2 measurements to see progress charts.
              </Alert>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <RechartTooltip
                    contentStyle={{
                      background: '#1e1e35',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  {CHART_METRICS.filter((m) => chartData.some((d) => d[m.key as keyof typeof d] != null)).map((m) => (
                    <Line
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      name={m.label}
                      stroke={m.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Measurement History
            </Typography>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : !measurements?.length ? (
              <Alert severity="info">No measurements logged yet.</Alert>
            ) : (
              <Stack spacing={1}>
                {[...measurements].reverse().map((m) => (
                  <Box
                    key={m.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.07)',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                        {formatDate(m.recorded_at)}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {[
                          m.weight_kg && `${m.weight_kg} kg`,
                          m.height_cm && `${m.height_cm} cm tall`,
                          m.body_fat_pct && `${m.body_fat_pct}% BF`,
                          m.chest_cm && `Chest: ${m.chest_cm}`,
                          m.waist_cm && `Waist: ${m.waist_cm}`,
                          m.hips_cm && `Hips: ${m.hips_cm}`,
                          m.arms_cm && `Arms: ${m.arms_cm}`,
                          m.thighs_cm && `Thighs: ${m.thighs_cm}`,
                        ]
                          .filter(Boolean)
                          .map((label) => (
                            <Chip key={label as string} label={label as string} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                          ))}
                      </Stack>
                      {m.notes && (
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                          {m.notes}
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(m.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <AddMeasurementDialog
        memberId={memberId!}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Measurement"
        message="Are you sure you want to delete this measurement record?"
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
