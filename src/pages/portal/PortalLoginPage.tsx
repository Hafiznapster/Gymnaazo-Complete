// @ts-nocheck
import { useState } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button, InputAdornment, Alert, CircularProgress } from '@mui/material'
import { Phone, Lock, ArrowForward } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function PortalLoginPage() {
  const navigate = useNavigate()
  const { setMemberUser, setSession, setGym } = useAuthStore() as any // Cast since setSession is setAuth in our code

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp() {
    if (phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      // In a real app with Twilio configured, we'd use:
      // await supabase.auth.signInWithOtp({ phone: `+91${phone}` })
      
      // For this implementation, we'll verify the member exists
      const { data: members, error: searchErr } = await supabase
        .from('members')
        .select('*, gyms(*)')
        .eq('phone', phone)
        .limit(1)

      if (searchErr || !members?.length) {
        throw new Error('No member found with this phone number. Please check with your gym.')
      }

      // Simulate OTP sent
      toast.success('OTP sent! (Use 123456 for demo)')
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (otp !== '123456') { // Demo hardcoded OTP
      setError('Invalid OTP code')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Fetch member and log them in
      const { data: members, error: searchErr } = await supabase
        .from('members')
        .select('*, gyms(*)')
        .eq('phone', phone)
        .limit(1)

      if (searchErr || !members?.length) throw new Error('Login failed')

      const member = members[0]
      const gymData = member.gyms

      // Update auth store (without full Supabase auth session for demo purposes)
      setMemberUser(member)
      setGym(gymData)
      toast.success('Welcome back!')
      navigate('/portal/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0B0B14' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 2,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 8px 32px rgba(108,99,255,0.25)'
            }}
          >
            💪
          </Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Gymnazo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Member Portal Login
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 400, bgcolor: '#0F0F1E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            {step === 'phone' ? (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Enter your registered phone number
                </Typography>
                <TextField
                  fullWidth
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography color="text.secondary" sx={{ ml: 1 }}>+91</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Enter the OTP sent to +91 {phone}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer', display: 'block', mb: 3 }} onClick={() => setStep('phone')}>
                  Change phone number
                </Typography>
                <TextField
                  fullWidth
                  placeholder="6-digit OTP (use 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3, input: { letterSpacing: 8, fontSize: 18, fontWeight: 700, textAlign: 'center' } }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  endIcon={loading && <CircularProgress size={20} color="inherit" />}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                >
                  {loading ? 'Verifying...' : 'Login'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
