import {
  Box, Card, CardContent, Typography, Stack, Button, Chip, Divider, Alert,
} from '@mui/material'
import { WhatsApp, Lock, OpenInNew } from '@mui/icons-material'
import { TopBar } from '@/components/layout/TopBar'

const TRIGGERS = [
  { label: 'Welcome Message', when: 'On member registration', template: 'welcome_member' },
  { label: 'Expiry Reminder (7 days)', when: '7 days before expiry', template: 'expiry_reminder_7d' },
  { label: 'Expiry Reminder (3 days)', when: '3 days before expiry', template: 'expiry_reminder_3d' },
  { label: 'Expiry Reminder (Today)', when: 'On expiry date', template: 'expiry_today' },
  { label: 'Renewal Confirmation', when: 'On successful payment', template: 'renewal_confirmed' },
  { label: 'Birthday Greeting', when: 'On member\'s birthday', template: 'birthday_greeting' },
  { label: 'Inactivity Alert', when: 'After 14 days no check-in', template: 'inactivity_alert' },
  { label: 'Payment Receipt', when: 'After payment recorded', template: 'payment_receipt' },
]

export default function WhatsAppPage() {
  return (
    <Box>
      <TopBar title="WhatsApp Notifications" />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Pending banner */}
        <Alert
          severity="warning"
          icon={<Lock />}
          sx={{ mb: 3 }}
          action={
            <Button
              size="small"
              endIcon={<OpenInNew />}
              href="https://app.wati.io"
              target="_blank"
            >
              Open WATI
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={700}>
            ⏳ Pending Integration — WATI WhatsApp API
          </Typography>
          <Typography variant="body2">
            This feature requires your WATI API key and Meta-approved message templates.
            Once you have the keys, the Supabase Edge Functions are ready to be deployed.
          </Typography>
        </Alert>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Trigger list */}
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Configured Triggers (8)
            </Typography>
            <Stack spacing={1.5}>
              {TRIGGERS.map((t) => (
                <Card key={t.label}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <WhatsApp sx={{ color: '#25D366', fontSize: 22, flexShrink: 0 }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>{t.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.when}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {t.template}
                      </Typography>
                      <Chip label="Pending" size="small" color="warning" sx={{ fontSize: 10 }} />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Setup guide */}
          <Card sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Setup Checklist
              </Typography>
              <Stack spacing={1.5}>
                {[
                  'Create WATI account at wati.io',
                  'Complete Meta Business verification',
                  'Connect a WhatsApp Business phone number',
                  'Create & get templates approved by Meta',
                  'Copy WATI API key + endpoint URL',
                  'Add VITE_WATI_API_KEY to Supabase secrets',
                  'Deploy Edge Function: send-whatsapp',
                  'Enable Supabase Database Webhooks',
                ].map((step, i) => (
                  <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 22, height: 22, borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'text.secondary',
                        flexShrink: 0, mt: 0.1,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{step}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                See <strong>WATI_SETUP.md</strong> in the project root for detailed instructions.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  )
}
