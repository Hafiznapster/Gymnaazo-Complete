import {
  Box, Card, CardContent, Typography, Stack, Button, Chip, Alert, Divider,
} from '@mui/material'
import { QrCode2, Lock, OpenInNew } from '@mui/icons-material'
import { TopBar } from '@/components/layout/TopBar'

const FLOW = [
  { step: 1, title: 'Staff initiates QR payment', desc: 'Receptionist selects "Razorpay QR" as payment method' },
  { step: 2, title: 'Edge Function creates order', desc: 'POST /create-razorpay-qr → Razorpay API generates a QR code' },
  { step: 3, title: 'QR displayed to member', desc: 'Member scans QR using any UPI app (GPay, PhonePe, Paytm, etc.)' },
  { step: 4, title: 'Member pays', desc: 'UPI payment flows directly into gym\'s Razorpay account' },
  { step: 5, title: 'Webhook fires', desc: 'Razorpay sends payment.captured event to our webhook endpoint' },
  { step: 6, title: 'DB auto-updates', desc: 'Edge Function verifies HMAC signature, marks payment as paid, triggers WhatsApp receipt' },
]

export default function RazorpayPage() {
  return (
    <Box>
      <TopBar title="Razorpay QR Payments" />
      <Box sx={{ pt: '64px', p: 3 }}>
        <Alert
          severity="warning"
          icon={<Lock />}
          sx={{ mb: 3 }}
          action={
            <Button size="small" endIcon={<OpenInNew />} href="https://dashboard.razorpay.com" target="_blank">
              Open Razorpay
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={700}>
            ⏳ Pending Integration — Razorpay QR Code API
          </Typography>
          <Typography variant="body2">
            Manual cash/UPI payments are fully working now. Razorpay integration adds dynamic,
            auto-verified QR codes. The Edge Functions are written and ready — just needs your API keys.
          </Typography>
        </Alert>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Payment Flow */}
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} mb={2}>Payment Flow</Typography>
            <Stack spacing={1.5}>
              {FLOW.map((f) => (
                <Card key={f.step}>
                  <CardContent sx={{ p: 2, display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: '50%',
                        bgcolor: 'rgba(108,99,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 14, color: 'primary.main', flexShrink: 0,
                      }}
                    >
                      {f.step}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{f.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{f.desc}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Setup Checklist */}
          <Card sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Setup Checklist</Typography>
              <Stack spacing={1.5}>
                {[
                  'Create Razorpay account at razorpay.com',
                  'Complete KYC for live payments',
                  'Generate API Key ID & Key Secret',
                  'Set up webhook endpoint in Razorpay dashboard',
                  'Add RAZORPAY_KEY_ID to Supabase secrets',
                  'Add RAZORPAY_KEY_SECRET to Supabase secrets',
                  'Add RAZORPAY_WEBHOOK_SECRET to Supabase secrets',
                  'Deploy Edge Function: create-razorpay-qr',
                  'Deploy Edge Function: razorpay-webhook',
                ].map((step, i) => (
                  <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'text.secondary', flexShrink: 0, mt: 0.1 }}>
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{step}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>Required Env Vars:</Typography>
                {['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'].map((k) => (
                  <Typography key={k} variant="caption" fontFamily="monospace" color="primary.light">
                    {k}
                  </Typography>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                See <strong>RAZORPAY_SETUP.md</strong> in the project root for detailed instructions.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  )
}
