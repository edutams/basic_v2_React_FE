import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  Skeleton,
  Avatar,
  Link,
  Alert,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { IconDotsVertical, IconRefresh, IconUserPlus } from '@tabler/icons-react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { getSpaContact, formatDate, StatusChip } from './schoolTabHelpers';
import { usePermissions } from '@/context/AgentContext/permissions';

const ApplicationReview = ({
  prospectList,
  prospectLoading,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  filters,
  onApplyFilters,
  setOpenAddModal,
  can,
  onReview,
  onEdit,
}) => {
  const { can: canPerm } = usePermissions();

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [draft, setDraft] = useState(filters);

  const thSx = {
    fontWeight: 700,
    fontSize: '11px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
  };

  const handleFetch = () => {
    onApplyFilters(draft);
    setPage(0);
  };
  const handleReset = () => {
    const empty = { search: '', status: '', date_from: '', date_to: '' };
    setDraft(empty);
    onApplyFilters(empty);
    setPage(0);
  };
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // `prospectList` is already exactly what the backend returned for the
  // current filters — no client-side re-filtering here, only client-side
  // paging over that already-scoped list.

  if (prospectLoading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Submitted</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton variant="text" width={20} height={20} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box>
                      <Skeleton variant="text" width={140} height={18} />
                      <Skeleton variant="text" width={100} height={14} />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box>
                      <Skeleton variant="text" width={110} height={14} />
                      <Skeleton variant="text" width={130} height={14} />
                      <Skeleton variant="text" width={90} height={14} />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box>
                      <Skeleton variant="text" width={120} height={14} />
                      <Skeleton variant="text" width={100} height={14} />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell><Skeleton variant="text" width={90} height={14} /></TableCell>
                <TableCell><Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '12px' }} /></TableCell>
                <TableCell align="right"><Skeleton variant="circular" width={28} height={28} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            px: 2,
            py: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" flexGrow={1}>
            <TextField
              placeholder="Search by school name…"
              size="small"
              value={draft.search}
              onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetch();
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flexGrow: 1, minWidth: 280 }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              type="date"
              size="small"
              label="From"
              value={draft.date_from}
              onChange={(e) => setDraft((p) => ({ ...p, date_from: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={draft.date_to}
              onChange={(e) => setDraft((p) => ({ ...p, date_to: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" size="small" startIcon={<IconRefresh size={16} />} onClick={handleFetch}>
              Fetch
            </Button>
            {hasActiveFilters && (
              <Button size="small" onClick={handleReset}>
                Reset
              </Button>
            )}
          </Box>

          {canPerm('landlord.school.create') && (
            <Button
              variant="contained"
              size="small"
              startIcon={<IconUserPlus />}
              onClick={() => setOpenAddModal(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              Add New School
            </Button>
          )}
        </Box>
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Submitted</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx} align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginate(prospectList).length > 0 ? (
              paginate(prospectList).map((row, i) => {
                const spa = getSpaContact(row);
                const agent = row.agent;
                const domainHost = agent?.organization_domain
                  ? `${row.tenant_short_name}.${agent.organization_domain}`
                  : row.tenant_short_name || '';
                const prospectiveUrl = domainHost ? `https://${domainHost}` : null;

                return (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                      {page * rowsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={row.logo || row.image}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!row.logo && !row.image && (
                            <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                            {row.tenant_name}
                          </Typography>
                          {prospectiveUrl ? (
                            <Link
                              href={prospectiveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="caption"
                              color="text.secondary"
                              underline="hover"
                            >
                              {domainHost}
                            </Link>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={spa.image} sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}>
                          {!spa.image && <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {spa.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {spa.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {spa.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={agent?.organization_logo}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!agent?.organization_logo && <BusinessIcon sx={{ color: '#000' }} />}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {agent?.organization_name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agent?.organization_email || ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(row.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setActiveRow(row);
                        }}
                      >
                        <IconDotsVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                    No applications found.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={prospectList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 170 } }}
      >
        <MenuItem
          onClick={() => {
            onReview(activeRow);
            setAnchorEl(null);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <RateReviewOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
          Review Application
        </MenuItem>

        {activeRow?.status === 'pending' && (
          <MenuItem
            onClick={() => {
              onEdit(activeRow);
              setAnchorEl(null);
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <EditOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
            Edit
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ApplicationReview;
