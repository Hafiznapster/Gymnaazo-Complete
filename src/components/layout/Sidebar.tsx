import { NavLink, useLocation } from 'react-router-dom'
import {
  Box, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Chip,
} from '@mui/material'
import {
  Dashboard, People, FitnessCenter, Payment,
  CheckCircle, Schedule,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import type { StaffRole } from '@/types/database'

export const DRAWER_WIDTH = 260

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: StaffRole[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  path: '/dashboard',  icon: <Dashboard />,     roles: ['owner', 'manager', 'receptionist', 'trainer'] },
  { label: 'Members',    path: '/members',    icon: <People />,        roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Plans',      path: '/plans',      icon: <FitnessCenter />, roles: ['owner', 'manager'] },
  { label: 'Payments',   path: '/payments',   icon: <Payment />,       roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Attendance', path: '/attendance', icon: <CheckCircle />,   roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Expiry',     path: '/expiry',     icon: <Schedule />,      roles: ['owner', 'manager', 'receptionist'] },
]

const ROLE_COLOR: Record<StaffRole, 'primary' | 'secondary' | 'default' | 'warning'> = {
  owner: 'primary',
  manager: 'secondary',
  receptionist: 'default',
  trainer: 'warning',
}

export function Sidebar() {
  const location = useLocation()
  const { staffUser, gym } = useAuthStore()

  const visibleItems = NAV_ITEMS.filter(
    (item) => staffUser && item.roles.includes(staffUser.role),
  )

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F0F1E',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          💪
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} color="text.primary">
            {gym?.name ?? 'Gymnazo'}
          </Typography>
          <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
            Management Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflowY: 'auto' }}>
        {visibleItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(108,99,255,0.14)',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '&:hover': { bgcolor: 'rgba(108,99,255,0.20)' },
                  },
                  '&:hover:not(.Mui-selected)': {
                    bgcolor: 'rgba(255,255,255,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 3, height: 20, borderRadius: 2,
                      bgcolor: 'primary.main',
                      position: 'absolute',
                      right: 0,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Staff Profile */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: 'primary.dark', fontSize: 14, fontWeight: 700 }}
        >
          {staffUser?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {staffUser?.name}
          </Typography>
          <Chip
            label={staffUser?.role ?? ''}
            size="small"
            color={ROLE_COLOR[staffUser?.role as StaffRole] ?? 'default'}
            sx={{ height: 18, fontSize: 10, mt: 0.3, textTransform: 'capitalize' }}
          />
        </Box>
      </Box>
    </Box>
  )
}
