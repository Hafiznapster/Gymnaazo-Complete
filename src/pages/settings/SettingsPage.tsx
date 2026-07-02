// @ts-nocheck
import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, Button, TextField,
  Grid, Divider, Alert, Avatar, Chip, CircularProgress,
} from '@mui/material'
import { Save, Business, Phone, Email, LocationOn, Receipt } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { TopBar } from '@/components/layout/TopBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  name: z.string().min(2, 'Gym name is required'),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
  timezone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const { gym, setGym } = useAuthStore()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      name: gym?.name ?? '',
      phone: gym?.phone ?? '',
      email: gym?.email ?? '',
      address: gym?.address ?? '',
      gstin: gym?.gstin ?? '',
      timezone: gym?.timezone ?? 'Asia/Kolkata',
    },
  })

  async function onSubmit(data: FormData) {
    if (!gym) return
    setSaving(true)
    try {
      const { data: updated, error } = await supabase
        .from('gyms')
        .update({
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          gstin: data.gstin || null,
          timezone: data.timezone || 'Asia/Kolkata',
        })
        .eq('id', gym.id)
        .select()
        .single()

      if (error) throw error
      setGym(updated)
      toast.success('Settings saved!')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <TopBar title="Settings" />
      <Box sx={{ pt: '64px', p: 3, maxWidth: 700, mx: 'auto' }}>

        {/* Gym identity header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Avatar
                sx={{
                  width: 64, height: 64, bgcolor: 'primary.main',
                  fontSize: 28, fontWeight: 700,
                }}
              >
                {gym?.name?.[0]?.toUpperCase() ?? 'G'}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>{gym?.name}</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip label={`ID: ${gym?.id?.slice(0, 8)}…`} size="small" sx={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Chip label={gym?.slug ?? ''} size="small" color="primary" sx={{ fontSize: 11 }} />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card component="form" onSubmit={handleSubmit(onSubmit)}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Gym Info */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Business sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Gym Information
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Gym Name *"
                      fullWidth
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      fullWidth
                      {...register('phone')}
                      placeholder="+91 98765 43210"
                      InputProps={{ startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      fullWidth
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{ startAdornment: <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      fullWidth
                      multiline
                      rows={2}
                      {...register('address')}
                      InputProps={{ startAdornment: <LocationOn fontSize="small" sx={{ mr: 1, mt: 1, color: 'text.secondary', alignSelf: 'flex-start' }} /> }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Tax & Billing */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Receipt sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Tax & Billing
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="GSTIN"
                      fullWidth
                      {...register('gstin')}
                      placeholder="22AAAAA0000A1Z5"
                      inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
                      helperText="Shown on PDF receipts"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Timezone"
                      fullWidth
                      {...register('timezone')}
                      helperText="Default: Asia/Kolkata"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Pending integrations notice */}
              <Alert severity="warning" icon={false}>
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                  🔌 Pending Integrations
                </Typography>
                <Typography variant="body2">
                  The following require external API keys and will be set up separately:
                </Typography>
                <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, pl: 2, m: 0, '& li': { mb: 0.5 } }}>
                  {[
                    'WhatsApp (WATI) — for member notifications',
                    'Razorpay — for dynamic QR code payments',
                    'Member Portal — phone OTP login for members',
                  ].map((item) => (
                    <Typography key={item} component="li" variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Alert>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                disabled={saving || !isDirty}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
