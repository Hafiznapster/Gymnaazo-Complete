import { useState } from 'react'
import {
  Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, TextField, Button,
  InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Avatar, Stack, Skeleton, Chip,
} from '@mui/material'
import { Search, Add, PersonAdd } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useMembers } from '@/hooks/useMembers'
import { formatDate, formatPhone } from '@/utils/formatters'
import type { MemberStatus } from '@/types/database'

export default function MembersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const { data: members, isLoading } = useMembers({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const paginatedMembers = (members ?? []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil((members?.length ?? 0) / PAGE_SIZE)

  return (
    <Box>
      <TopBar
        title="Members"
        actions={
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/members/register')}
            size="small"
          >
            Register Member
          </Button>
        }
      />
      <Box sx={{ pt: '64px', p: 3 }}>
        {/* Filters */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <TextField
            placeholder="Search name, phone, or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
            >
              <MenuItem value="all">All Members</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="frozen">Frozen</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Stats row */}
        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            label={`${members?.length ?? 0} total`}
            size="small"
            variant="outlined"
          />
          {search && (
            <Chip
              label={`${members?.length ?? 0} results for "${search}"`}
              size="small"
              color="primary"
              onDelete={() => setSearch('')}
            />
          )}
        </Stack>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton width={j === 0 ? 160 : 80} height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : paginatedMembers.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ border: 0 }}>
                        <EmptyState
                          icon={<PersonAdd />}
                          title={search ? 'No members found' : 'No members yet'}
                          description={
                            search
                              ? `No members match "${search}". Try a different search.`
                              : 'Register your first member to get started.'
                          }
                          actionLabel={search ? undefined : 'Register Member'}
                          onAction={search ? undefined : () => navigate('/members/register')}
                        />
                      </TableCell>
                    </TableRow>
                  )
                  : paginatedMembers.map((member) => {
                      const subscriptions = (member as any).member_subscriptions ?? []
                      const activeSub = subscriptions.find((s: any) => s.status === 'active')
                        ?? subscriptions[0]
                      const plan = activeSub?.membership_plans

                      return (
                        <TableRow
                          key={member.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/members/${member.id}`)}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar
                                src={member.photo_url ?? undefined}
                                sx={{ width: 36, height: 36, bgcolor: 'primary.dark', fontSize: 14 }}
                              >
                                {member.name[0].toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {member.name}
                                </Typography>
                                {member.email && (
                                  <Typography variant="caption" color="text.secondary">
                                    {member.email}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                              {member.member_code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatPhone(member.phone)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={member.status as MemberStatus} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {plan?.name ?? '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {activeSub?.end_date ? formatDate(activeSub.end_date) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(member.joined_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} p={2}>
              <Button
                size="small"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2" color="text.secondary">
                Page {page + 1} of {totalPages}
              </Typography>
              <Button
                size="small"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </Card>
      </Box>
    </Box>
  )
}
