import { Box, CircularProgress, Typography } from '@mui/material'

export function LoadingScreen() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          mb: 1,
        }}
      >
        💪
      </Box>
      <CircularProgress size={32} sx={{ color: 'primary.main' }} />
      <Typography color="text.secondary" variant="body2">
        Loading Gymnazo...
      </Typography>
    </Box>
  )
}
