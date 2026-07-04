import { NavLink, useLocation } from 'react-router-dom'
import {
  Box, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Chip,
} from '@mui/material'
import {
  Dashboard, People, FitnessCenter, Payment, BarChart,
  CheckCircle, Schedule, SupervisorAccount, Settings,
  WhatsApp, QrCode2, DirectionsRun, Restaurant, EventAvailable,
  Campaign, AccountBalanceWallet, Inventory, Forum, TabletMac
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import type { StaffRole } from '@/types/database'

export const DRAWER_WIDTH = 260

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: StaffRole[]
  section?: string
  badge?: 'pending'
}

const NAV_ITEMS: NavItem[] = [
  // ── Core Operations
  { label: 'Dashboard',    path: '/dashboard',    icon: <Dashboard />,          roles: ['owner', 'manager', 'receptionist', 'trainer'], section: 'Core' },
  { label: 'Members',      path: '/members',      icon: <People />,             roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Plans',        path: '/plans',        icon: <FitnessCenter />,      roles: ['owner', 'manager'] },
  { label: 'Payments',     path: '/payments',     icon: <Payment />,            roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Attendance',   path: '/attendance',   icon: <CheckCircle />,        roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Expiry',       path: '/expiry',       icon: <Schedule />,           roles: ['owner', 'manager', 'receptionist'] },
  // ── Phase 2
  { label: 'Analytics',    path: '/analytics',    icon: <BarChart />,           roles: ['owner', 'manager'],                               section: 'Phase 2' },
  { label: 'Personal Training', path: '/pt',      icon: <FitnessCenter />,      roles: ['owner', 'manager', 'trainer'] },
  { label: 'Staff',        path: '/staff',        icon: <SupervisorAccount />,  roles: ['owner', 'manager'] },
  { label: 'Settings',     path: '/settings',     icon: <Settings />,           roles: ['owner'] },
  // ── Phase 3 & 4
  { label: 'Workouts',     path: '/workouts',     icon: <DirectionsRun />,      roles: ['owner', 'manager', 'trainer'], section: 'Trainer Tools' },
  { label: 'Diets',        path: '/diets',        icon: <Restaurant />,         roles: ['owner', 'manager', 'trainer'] },
  { label: 'Classes',      path: '/classes',      icon: <EventAvailable />,     roles: ['owner', 'manager', 'receptionist'] },
  { label: 'Leads (CRM)',  path: '/crm',          icon: <Campaign />,           roles: ['owner', 'manager'], section: 'Finance & Growth' },
  { label: 'Expenses',     path: '/finance',      icon: <AccountBalanceWallet />,roles: ['owner', 'manager'] },
  // ── Phase 5
  { label: 'Equipment',    path: '/equipment',    icon: <FitnessCenter />,      roles: ['owner', 'manager'], section: 'Assets & Operations' },
  { label: 'Inventory',    path: '/inventory',    icon: <Inventory />,          roles: ['owner', 'manager'] },
  { label: 'Feedback',     path: '/feedback',     icon: <Forum />,              roles: ['owner', 'manager'] },
  { label: 'Launch Kiosk', path: '/kiosk',        icon: <TabletMac />,          roles: ['owner', 'manager', 'receptionist'] },
  // ── Pending Integrations
  { label: 'WhatsApp',     path: '/integrations/whatsapp',  icon: <WhatsApp />,  roles: ['owner', 'manager'], section: 'Integrations', badge: 'pending' },
  { label: 'Razorpay QR',  path: '/integrations/razorpay',  icon: <QrCode2 />,   roles: ['owner'],                                          badge: 'pending' },
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
        {visibleItems.map((item, idx) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          const prevItem = visibleItems[idx - 1]
          const showSection = item.section && (!prevItem || prevItem.section !== item.section)

          return (
            <Box key={item.path}>
              {showSection && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ px: 1, pt: idx > 0 ? 1.5 : 0, pb: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.6 }}
                >
                  {item.section}
                </Typography>
              )}
              <ListItem disablePadding sx={{ mb: 0.5 }}>
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
                    '&:hover:not(.Mui-selected)': { bgcolor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: isActive ? 'primary.main' : item.badge === 'pending' ? 'warning.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: 14, color: isActive ? 'primary.main' : 'text.primary' }}
                  />
                  {item.badge === 'pending' && (
                    <Chip label="Pending" size="small" color="warning" sx={{ height: 16, fontSize: 9, fontWeight: 700 }} />
                  )}
                  {isActive && (
                    <Box sx={{ width: 3, height: 20, borderRadius: 2, bgcolor: 'primary.main', position: 'absolute', right: 0 }} />
                  )}
                </ListItemButton>
              </ListItem>
            </Box>
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
