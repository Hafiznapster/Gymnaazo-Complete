import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Avatar, Chip, InputAdornment, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton,
} from '@mui/material'
import { QrCodeScanner, CheckCircle, Logout, Search } from '@mui/icons-material'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useTodayAttendance, useCheckIn, useCheckOut } from '@/hooks/useAttendance'
import { useMembers } from '@/hooks/useMembers'
import { formatDateTime, formatDate } from '@/utils/formatters'
import { format, differenceInMinutes } from 'date-fns'
import toast from 'react-hot-toast'

function formatDuration(checkIn: string, checkOut: string | null): string {
  if (!checkOut) return 'Still inside'
  const mins = differenceInMinutes(new Date(checkOut), new Date(checkIn))
  const hours = Math.floor(mins / 60)
  const remaining = mins % 60
  if (hours > 0) return `${hours}h ${remaining}m`
  return `${remaining}m`
}

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [checkInQuery, setCheckInQuery] = useState('')
  const [checkInError, setCheckInError] = useState('')

  const { data: todayAttendance, isLoading } = useTodayAttendance()
  const { data: members } = useMembers()
  const { mutateAsync: checkIn } = useCheckIn()
  const { mutateAsync: checkOut } = useCheckOut()

  // Members currently inside (checked in today, no checkout)
  const currentlyInside = (todayAttendance ?? []).filter((log: any) => !log.check_out_at)

  // Search members for quick check-in
  const searchResults = checkInQuery
    ? (members ?? []).filter((m) =>
        m.name.toLowerCase().includes(checkInQuery.toLowerCase()) ||
        m.phone.includes(checkInQuery) ||
        m.member_code.toLowerCase().includes(checkInQuery.toLowerCase()),
      ).slice(0, 5)
    : []

  async function handleCheckIn(memberId: string, memberName: string) {
    try {
      setCheckInError('')
      await checkIn(memberId)
      toast.success(`✅ ${memberName} checked in!`)
      setCheckInQuery('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check-in failed'
      setCheckInError(msg)
    }
  }

  async function handleCheckOut(logId: string, memberName: string) {
    try {
      await checkOut(logId)
      toast.success(`${memberName} checked out`)
    } catch {
      toast.error('Check-out failed')
    }
  }

  // Filtered today's log
  const filteredLog = (todayAttendance ?? []).filter((log: any) => {
    if (!searchQuery) return true
    const member = log.members as any
    return (
      member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.member_code?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Box>
      <TopBar title={`Attendance — ${format(new Date(), 'EEEE, dd MMM yyyy')}`} />
      <Box sx={{ pt: '64px', p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          {/* Left: Quick Check-in Panel */}
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
                  <QrCodeScanner sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Quick Check-in
                  </Typography>
                </Stack>

                <TextField
                  placeholder="Search member name, ID, phone..."
                  value={checkInQuery}
                  onChange={(e) => { setCheckInQuery(e.target.value); setCheckInError('') }}
                  fullWidth
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {checkInError && (
                  <Alert severity="error" sx={{ mt: 1.5 }}>
                    {checkInError}
                  </Alert>
                )}

                {searchResults.length > 0 && (
                  <Stack spacing={1} mt={1.5}>
                    {searchResults.map((member) => (
                      <Box
                        key={member.id}
                        onClick={() => handleCheckIn(member.id, member.name)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          '&:hover': { bgcolor: 'rgba(108,99,255,0.10)', borderColor: 'primary.main' },
                          transition: 'all 0.15s',
                        }}
                      >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 13 }}>
                          {member.name[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            {member.member_code}
                          </Typography>
                        </Box>
                        <Chip
                          label={member.status}
                          size="small"
                          color={member.status === 'active' ? 'success' : 'error'}
                          sx={{ ml: 'auto', fontSize: 10, fontWeight: 600 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}

                {/* Currently Inside */}
                <Box mt={3}>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main" mb={1.5}>
                    Inside Now ({currentlyInside.length})
                  </Typography>
                  {currentlyInside.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No members currently checked in.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {currentlyInside.map((log: any) => {
                        const member = log.members as any
                        return (
                          <Box
                            key={log.id}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(34,197,94,0.06)',
                              border: '1px solid rgba(34,197,94,0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'success.dark', fontSize: 11 }}>
                              {member?.name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box flex={1} minWidth={0}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {member?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                In {format(new Date(log.check_in_at), 'hh:mm a')}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Logout />}
                              onClick={() => handleCheckOut(log.id, member?.name)}
                              sx={{ fontSize: 11, py: 0.5, px: 1, minWidth: 0 }}
                            >
                              Out
                            </Button>
                          </Box>
                        )
                      })}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Today's Full Log */}
          <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Today's Log ({todayAttendance?.length ?? 0} check-ins)
              </Typography>
              <TextField
                placeholder="Filter log..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: 200 }}
              />
            </Stack>

            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Check-in</TableCell>
                      <TableCell>Check-out</TableCell>
                      <TableCell>Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 4 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton height={20} />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : filteredLog.length === 0
                      ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ border: 0 }}>
                            <EmptyState
                              icon={<CheckCircle />}
                              title="No check-ins yet today"
                              description="Use the quick check-in panel on the left to record attendance."
                            />
                          </TableCell>
                        </TableRow>
                      )
                      : filteredLog.map((log: any) => {
                          const member = log.members as any
                          const isInside = !log.check_out_at

                          return (
                            <TableRow key={log.id}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 13 }}>
                                    {member?.name?.[0]?.toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {member?.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                      {member?.member_code}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {format(new Date(log.check_in_at), 'hh:mm a')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {isInside ? (
                                  <Chip
                                    label="Inside"
                                    size="small"
                                    color="success"
                                    sx={{ fontSize: 11, fontWeight: 600 }}
                                  />
                                ) : (
                                  <Typography variant="body2">
                                    {format(new Date(log.check_out_at), 'hh:mm a')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDuration(log.check_in_at, log.check_out_at)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
