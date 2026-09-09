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
import { Payments as PaymentsIcon } from '@mui/icons-material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { IconRefresh } from '@tabler/icons-react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { getSpaContact, StatusChip, formatDate } from './schoolTabHelpers';

import MoreVertIcon from '@mui/icons-material/MoreVert';

const ApprovedSchoolsTab = ({
  schoolList,
  schoolLoading,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  filters,
  onApplyFilters,
  onViewProfile,
  onEdit,
  onDeactivate,
  onApproveOnboarding,
  onManageGateway,
}) => {
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

  // `schoolList` is already exactly what the backend returned for the
  // current filters (and already scoped server-side to onboarding-approved
  // tenants) — no client-side re-filtering here.

  if (schoolLoading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx}>Onboarding Status</TableCell>
              <TableCell sx={thSx}>Completed At</TableCell>
              <TableCell sx={thSx}>Approved By</TableCell>
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
                <TableCell><Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '12px' }} /></TableCell>
                <TableCell><Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '12px' }} /></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={14} /></TableCell>
                <TableCell><Skeleton variant="text" width={110} height={14} /></TableCell>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', px: 2, py: 1.5 }}>
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
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
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Status</TableCell>
              <TableCell sx={thSx}>Onboarding Status</TableCell>
              <TableCell sx={thSx}>Completed At</TableCell>
              <TableCell sx={thSx}>Approved By</TableCell>
              <TableCell sx={thSx} align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginate(schoolList).length > 0 ? (
              paginate(schoolList).map((row, i) => {
                const spa = getSpaContact(row);
                const org = row.organization || row.agent;

                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ color: '#6b7280', fontSize: '13px' }}>
                      {page * rowsPerPage + i + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={row.image || row.logo}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!row.image && !row.logo && (
                            <PersonOutlineIcon sx={{ color: '#000', fontSize: 28 }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {row.tenant_name}
                          </Typography>
                          {row.domains?.[0]?.domain ? (
                            <Link
                              href={`https://${row.domains[0].domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="caption"
                              color="text.secondary"
                              underline="hover"
                            >
                              {row.domains[0].domain}
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
                          src={org?.organization_logo || org?.logo}
                          sx={{ width: 44, height: 44, bgcolor: '#E7E9EB' }}
                        >
                          {!org?.organization_logo && !org?.logo && (
                            <BusinessIcon sx={{ color: '#000' }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" fontWeight={600} display="block">
                            {org?.organization_name || org?.org_name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {org?.organization_email || org?.email || ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.onboarding_status || 'pending'} />
                    </TableCell>

                    {/* Completed At */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.onboarding_completed_at
                          ? formatDate(row.onboarding_completed_at)
                          : '—'}
                      </Typography>
                    </TableCell>

                    {/* Approved By */}
                    <TableCell>
                      <Typography variant="body2">
                        {row.onboarding_approved_by?.full_name ||
                          `${row.onboarding_approved_by?.fname || ''} ${row.onboarding_approved_by?.lname || ''}`.trim() ||
                          '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setActiveRow(row);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                    No approved schools yet.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={schoolList.length}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem
          onClick={() => {
            onManageGateway(activeRow);
            setAnchorEl(null);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PaymentsIcon fontSize="small" sx={{ color: '#6b7280' }} />
          Manage School Gateway
        </MenuItem>
        <MenuItem
          onClick={() => {
            onViewProfile(activeRow);
            setAnchorEl(null);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <VisibilityOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
          View Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEdit(activeRow);
            setAnchorEl(null);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
          Edit School
        </MenuItem>

        <MenuItem
          onClick={() => {
            onDeactivate(activeRow);
            setAnchorEl(null);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color:
              String(activeRow?.status || '').toLowerCase() === 'active' ? '#dc2626' : '#16a34a',
          }}
        >
          {String(activeRow?.status || '').toLowerCase() === 'active' ? (
            <>
              <BlockOutlinedIcon fontSize="small" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircleOutlineIcon fontSize="small" />
              Activate
            </>
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ApprovedSchoolsTab;
