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
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconDotsVertical, IconEdit, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { getSpaContact, formatDate, StatusChip } from './schoolTabHelpers';
import { usePermissions } from '@/context/AgentContext/permissions';

const SetupApprovals = ({
  schoolList,
  schoolLoading,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  nameValue,
  activeFilters,
  setFilterDrawerOpen,
  activeFilterCount,
  can,
  onReview,
  onEdit,
  onApproveOnboarding,
}) => {
  const { can: canPerm } = usePermissions();

  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const thSx = {
    fontWeight: 700,
    fontSize: '11px',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    py: 1.5,
  };

  const setupList = (schoolList || []).filter((s) => s.onboarding_status !== 'approved');

  const filter = (arr) => {
    let result = arr;
    if (nameValue) {
      result = result.filter((r) =>
        (r.tenant_name || r.institutionName || '').toLowerCase().includes(nameValue.toLowerCase()),
      );
    }
    if (activeFilters.name) {
      result = result.filter((r) =>
        (r.tenant_name || r.institutionName || '')
          .toLowerCase()
          .includes(activeFilters.name.toLowerCase()),
      );
    }
    if (activeFilters.status) {
      result = result.filter((r) => r.status === activeFilters.status);
    }
    if (activeFilters.date_from) {
      result = result.filter((r) => r.created_at && r.created_at >= activeFilters.date_from);
    }
    if (activeFilters.date_to) {
      result = result.filter((r) => r.created_at && r.created_at <= activeFilters.date_to);
    }
    return result;
  };

  const paginate = (arr) => arr.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const filtered = filter(setupList);

  if (schoolLoading) {
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
                <TableCell><Skeleton variant="text" width={90} height={14} /></TableCell>
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
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ px: 2, py: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<IconAdjustmentsHorizontal />}
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
              fontWeight: activeFilterCount > 0 ? 700 : 400,
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            Filters
            {activeFilterCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.8,
                  py: 0.1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>
        </Stack>
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
          <TableHead sx={{ bgcolor: '#fafafa' }}>
            <TableRow>
              <TableCell sx={thSx}>#</TableCell>
              <TableCell sx={thSx}>School</TableCell>
              <TableCell sx={thSx}>Admin Contact (SPA)</TableCell>
              <TableCell sx={thSx}>Organisation</TableCell>
              <TableCell sx={thSx}>Submitted</TableCell>
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
            {paginate(filtered).length > 0 ? (
              paginate(filtered).map((row, i) => {
                const spa = getSpaContact(row);
                const agent = row.agent || row.organization;

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
                    <TableCell>
                      <StatusChip status={row.onboarding_status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.onboarding_completed_at
                          ? formatDate(row.onboarding_completed_at)
                          : '—'}
                      </Typography>
                    </TableCell>
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
                        <IconDotsVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ width: '100%', justifyContent: 'center' }}>
                    No onboarding applications.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filtered.length}
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
            onApproveOnboarding(activeRow);
            setAnchorEl(null);
          }}
          disabled={activeRow?.onboarding_status !== 'completed'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: activeRow?.onboarding_status === 'completed' ? '#16a34a' : undefined,
          }}
        >
          {can('landlord.approve_tenants_onboarding') && (
            <>
              <TaskAltIcon fontSize="small" />
              {activeRow?.onboarding_status === 'completed'
                ? 'Approve Onboarding'
                : 'Onboarding Not Completed'}
            </>
          )}
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            onEdit(activeRow);
            setAnchorEl(null);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ color: '#6b7280' }} />
          Edit
        </MenuItem> */}
      </Menu>
    </>
  );
};

export default SetupApprovals;
