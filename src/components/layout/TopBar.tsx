import { Box, IconButton, Typography, Tooltip, Stack } from '@mui/material'
import { Logout, NotificationsNone } from '@mui/icons-material'
import { useLogin } from '@/hooks/useAuth'
import { DRAWER_WIDTH } from './Sidebar'

interface TopBarProps {
  title?: string
  actions?: React.ReactNode
}

export function TopBar({ title, actions }: TopBarProps) {
  const { logout } = useLogin()

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: DRAWER_WIDTH,
        right: 0,
        height: 64,
        bgcolor: 'rgba(13,13,26,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        zIndex: 1100,
        gap: 2,
      }}
    >
      {title && (
        <Typography variant="h6" fontWeight={700} flex={1} noWrap>
          {title}
        </Typography>
      )}
      {!title && <Box flex={1} />}
      {actions && <Stack direction="row" spacing={1} alignItems="center">{actions}</Stack>}
      <Tooltip title="Notifications">
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <NotificationsNone fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sign out">
        <IconButton size="small" onClick={logout} sx={{ color: 'text.secondary' }}>
          <Logout fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
