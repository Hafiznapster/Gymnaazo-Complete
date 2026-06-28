import { Chip } from '@mui/material'
import type { MemberStatus } from '@/types/database'

const STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; color: 'success' | 'error' | 'warning' | 'default' }
> = {
  active: { label: 'Active', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  frozen: { label: 'Frozen', color: 'warning' },
  pending: { label: 'Pending', color: 'default' },
}

export function StatusBadge({ status }: { status: MemberStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' }
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600, fontSize: 11 }}
    />
  )
}
