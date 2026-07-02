import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Box, Paper, BottomNavigation, BottomNavigationAction, Typography, Avatar } from '@mui/material'
import { Dashboard, FitnessCenter, AssignmentTurnedIn, Person, EventAvailable } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'

export function PortalLayout() {
  const location = useLocation()
  const { memberUser, gym } = useAuthStore()

  // Find active tab value based on route
  const getActiveTab = () => {
    if (location.pathname.includes('/portal/profile')) return 4
    if (location.pathname.includes('/portal/attendance')) return 3
    if (location.pathname.includes('/portal/classes')) return 2
    if (location.pathname.includes('/portal/pt')) return 1
    return 0 // Dashboard
  }

  return (
    <Box sx={{ pb: 7, bgcolor: '#0B0B14', minHeight: '100vh' }}>
      {/* Top App Bar for Portal */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: '#0F0F1E',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}
          >
            💪
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {gym?.name ?? 'Gymnazo'}
          </Typography>
        </Box>
        <Avatar 
          sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 12, fontWeight: 700 }}
        >
          {memberUser?.name?.[0]?.toUpperCase()}
        </Avatar>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          bgcolor: '#0F0F1E'
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={getActiveTab()}
          sx={{ 
            bgcolor: 'transparent',
            height: 65,
            '& .MuiBottomNavigationAction-root': {
              color: 'text.secondary',
              minWidth: 'auto',
              padding: '6px 0',
              '&.Mui-selected': {
                color: 'primary.main',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: 10,
              mt: 0.5,
              '&.Mui-selected': {
                fontSize: 11,
                fontWeight: 700
              }
            }
          }}
        >
          <BottomNavigationAction component={NavLink} to="/portal/dashboard" label="Home" icon={<Dashboard />} />
          <BottomNavigationAction component={NavLink} to="/portal/pt" label="Training" icon={<FitnessCenter />} />
          <BottomNavigationAction component={NavLink} to="/portal/classes" label="Classes" icon={<EventAvailable />} />
          <BottomNavigationAction component={NavLink} to="/portal/attendance" label="Check-in" icon={<AssignmentTurnedIn />} />
          <BottomNavigationAction component={NavLink} to="/portal/profile" label="Profile" icon={<Person />} />
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
