import { Box, Typography, Button } from '@mui/material'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 1.5,
      }}
    >
      {icon && (
        <Box sx={{ fontSize: 56, opacity: 0.3, lineHeight: 1 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          maxWidth={320}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
