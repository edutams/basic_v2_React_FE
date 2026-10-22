import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Checkbox,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  Avatar,
  Skeleton,
  Alert,
  MenuItem,
  Tooltip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  PersonOutline as PersonOutlineIcon,
  LinkOff as LinkOffIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  IconSearch,
  IconDotsVertical,
  IconCheck,
  IconX,
  IconTrash,
  IconFilterOff,
  IconCircleCheck,
  IconClock,
  IconCircleX,
  IconInfoCircle,
  IconHelpCircle,
} from '@tabler/icons-react';
import { statusLabel } from './StaffStatusModal';

const STATUS_ICON = {
  success: IconCircleCheck,
  warning: IconClock,
  error: IconCircleX,
  info: IconInfoCircle,
  default: IconHelpCircle,
};

const NonTeachingStaffTab = ({
  loading,
  staff,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  roleOptions,
  onResetFilters,
  page,
  rowsPerPage,
  total,
  handleChangePage,
  handleChangeRowsPerPage,
  handleAddStaff,
  handleBulkMenuOpen,
  handleUploadStaff,
  handleMenuOpen,
  getStatusColor,
  selectedIds,
  setSelectedIds,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onRowClick,
  selectedStaffId,
}) => {
  const allSelected = staff.length > 0 && staff.every((s) => selectedIds.has(s.user_id));
  const someSelected = staff.some((s) => selectedIds.has(s.user_id)) && !allSelected;

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      staff.forEach((s) => next.delete(s.user_id));
    } else {
      staff.forEach((s) => next.add(s.user_id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <Box>
      {/* Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 1.5,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <TextField
            size="small"
            placeholder="Search by name, staff ID, phone, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 400 } }}
          />

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 140 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            {(roleOptions || []).map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Clear search and every filter back to defaults">
            <Button
              size="small"
              variant="contained"
              startIcon={<IconFilterOff size={16} />}
              onClick={onResetFilters}
            >
              Reset
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>
            {selectedIds.size} selected
          </Typography>
          <Button
            size="small"
            color="success"
            variant="contained"
            startIcon={<IconCheck size={14} />}
            onClick={onBulkActivate}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Activate
          </Button>
          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<IconX size={14} />}
            onClick={onBulkDeactivate}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Deactivate
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<IconTrash size={14} />}
            onClick={onBulkDelete}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Delete
          </Button>
        </Paper>
      )}

      {/* Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
              }}
            >
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={staff.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>FullName</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell padding="checkbox">
                      <Skeleton variant="rounded" width={18} height={18} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={20} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={34} height={34} />
                        <Box>
                          <Skeleton variant="text" width={120} height={20} />
                          <Skeleton variant="text" width={70} height={14} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={140} height={20} />
                      <Skeleton variant="text" width={90} height={16} />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={22}
                        sx={{ borderRadius: '12px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rounded"
                        width={60}
                        height={22}
                        sx={{ borderRadius: '12px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      No staff found
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((staffMember, index) => {
                  const isRowSelected = selectedIds.has(staffMember.user_id);
                  return (
                    <TableRow
                      key={staffMember.user_id}
                      hover
                      selected={selectedStaffId === staffMember.user_id || isRowSelected}
                      onClick={() => {
                        toggleOne(staffMember.user_id);
                        onRowClick?.(staffMember);
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(37, 99, 235, 0.12)',
                          borderLeft: '3px solid',
                          borderLeftColor: 'primary.main',
                        },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(37, 99, 235, 0.18)' },
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(staffMember);
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isRowSelected}
                          onChange={() => toggleOne(staffMember.user_id)}
                        />
                      </TableCell>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={staffMember.user?.avatar}
                            alt={staffMember.user?.lname?.[0]}
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: '12px',
                              fontWeight: 700,
                              bgcolor: 'secondary.main',
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {staffMember.user?.full_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {staffMember.staff_id || staffMember.user?.user_id || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PhoneIcon sx={{ fontSize: 14, color: '#2563EB' }} />
                          <Typography variant="body2">{staffMember.user?.phone || '—'}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <EmailIcon sx={{ fontSize: 14, color: '#16A34A' }} />
                          <Typography variant="caption" color="text.secondary">
                            {staffMember.user?.email || '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={staffMember.role || 'N/A'}
                          size="small"
                          color="secondary"
                          variant="contained"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusColor = getStatusColor(staffMember.staff_status);
                          const StatusIcon = STATUS_ICON[statusColor] || STATUS_ICON.default;
                          return (
                            <Chip
                              icon={<StatusIcon size={14} />}
                              label={statusLabel(staffMember.staff_status)}
                              color={statusColor}
                              size="small"
                            />
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, staffMember)}>
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default NonTeachingStaffTab;
