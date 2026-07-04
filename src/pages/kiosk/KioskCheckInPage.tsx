// @ts-nocheck
import { useState } from 'react'
import { Box, Typography, Card, CardContent, Button, Stack, TextField, Avatar, CircularProgress, IconButton, Grid } from '@mui/material'
import { CheckCircle, Cancel, Backspace, QrCodeScanner, Logout } from '@mui/icons-material'
import { Link } from 'react-router-dom'

export default function KioskCheckInPage() {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [member, setMember] = useState<any>(null)

  const handleKeyPress = (num: string) => {
    if (pin.length < 10) setPin(prev => prev + num)
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleCheckIn = () => {
    if (pin.length < 4) return
    setStatus('checking')
    
    // Mock API call
    setTimeout(() => {
      if (pin === '1234') { // Mock logic
        setMember({ name: 'Rahul Sharma', plan: 'Pro Annual', status: 'active', photo: 'R' })
        setStatus('success')
      } else {
        setStatus('error')
      }

      // Reset after 4 seconds
      setTimeout(() => {
        setStatus('idle')
        setPin('')
        setMember(null)
      }, 4000)
    }, 1000)
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      bgcolor: '#0B0B14', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      
      {/* Admin exit button */}
      <IconButton 
        component={Link} 
        to="/dashboard" 
        sx={{ position: 'absolute', top: 20, right: 20, color: 'rgba(255,255,255,0.2)' }}
      >
        <Logout />
      </IconButton>

      <Typography variant="h3" fontWeight={800} color="primary.main" mb={1}>
        Gymnazo
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={6}>
        Welcome! Please check in.
      </Typography>

      {status === 'idle' && (
        <Card sx={{ bgcolor: '#1A1A2E', backgroundImage: 'none', width: 400, borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <TextField 
              value={pin}
              placeholder="Enter Member ID or Phone"
              variant="outlined"
              fullWidth
              InputProps={{
                readOnly: true,
                sx: { fontSize: 24, textAlign: 'center', letterSpacing: 2, '& input': { textAlign: 'center' } }
              }}
              sx={{ mb: 4 }}
            />

            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Grid item xs={4} key={num}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ height: 60, fontSize: 24, borderRadius: 2 }}
                    onClick={() => handleKeyPress(num.toString())}
                  >
                    {num}
                  </Button>
                </Grid>
              ))}
              <Grid item xs={4}>
                <Button variant="text" fullWidth sx={{ height: 60 }} onClick={() => setPin('')}>
                  CLEAR
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button variant="outlined" fullWidth sx={{ height: 60, fontSize: 24, borderRadius: 2 }} onClick={() => handleKeyPress('0')}>
                  0
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button variant="text" fullWidth sx={{ height: 60 }} onClick={handleBackspace}>
                  <Backspace />
                </Button>
              </Grid>
            </Grid>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large" 
              sx={{ height: 56, fontSize: 18 }}
              onClick={handleCheckIn}
              disabled={pin.length < 4}
            >
              Check In
            </Button>
            
            <Button 
              variant="text" 
              color="inherit" 
              fullWidth 
              size="large" 
              startIcon={<QrCodeScanner />}
              sx={{ mt: 2 }}
            >
              Scan QR Code instead
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'checking' && (
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5">Verifying Membership...</Typography>
        </Stack>
      )}

      {status === 'success' && member && (
        <Stack alignItems="center" spacing={2} sx={{ animation: 'fadeIn 0.5s' }}>
          <CheckCircle sx={{ fontSize: 120, color: 'success.main' }} />
          <Typography variant="h3" fontWeight={700}>Check-in Successful</Typography>
          <Typography variant="h5" color="text.secondary" mb={2}>Welcome back, {member.name}!</Typography>
          
          <Card sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', borderRadius: 3, p: 2, minWidth: 300, mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'success.dark', fontSize: 24 }}>{member.photo}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} color="success.main">{member.status.toUpperCase()}</Typography>
                <Typography variant="body2">{member.plan}</Typography>
              </Box>
            </Stack>
          </Card>
        </Stack>
      )}

      {status === 'error' && (
        <Stack alignItems="center" spacing={2}>
          <Cancel sx={{ fontSize: 120, color: 'error.main' }} />
          <Typography variant="h3" fontWeight={700}>Check-in Failed</Typography>
          <Typography variant="h5" color="text.secondary">Membership expired or invalid ID.</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Please speak to the front desk.</Typography>
        </Stack>
      )}
      
      {/* Required for dynamic key grid to compile without actual @mui/material/Grid import above if I missed it */}
    </Box>
  )
}
