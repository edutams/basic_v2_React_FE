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
  ButtonGroup,
  TablePagination,
  Avatar,
  Skeleton,
  Alert,
  Stack,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconChevronDown,
  IconCheck,
  IconX,
  IconBook,
  IconSchool,
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

const dedupeBy = (arr, key) => {
  const seen = new Set();
  return (arr || []).filter((item) => {
    if (seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  });
};

const classArmLabel = (classArm) =>
  [classArm?.programme_class?.class?.class_code, classArm?.class_arm_names]
    .filter(Boolean)
    .join(' ') || 'N/A';

const OverflowList = ({ items, limit = 2 }) => {
  const visible = items.slice(0, limit);
  const more = items.length - visible.length;
  if (items.length === 0) {
    return (
      <Typography variant="caption" color="textSecondary">
        Not assigned
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
      {visible.map((label, i) => (
        <Chip key={i} size="small" label={label} />
      ))}
      {more > 0 && (
        <Tooltip title={items.slice(limit).join(', ')}>
          <Typography variant="caption" color="primary" fontWeight={700}>
            +{more}
          </Typography>
        </Tooltip>
      )}
    </Stack>
  );
};

const TeachingStaffTab = ({
  loading,
  staff,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  subjectFilter,
  setSubjectFilter,
  classFilter,
  setClassFilter,
  subjectOptions,
  classOptions,
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
  onBulkAssignSubjects,
  onBulkAssignClasses,
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
      <Box
        sx={{
          pb: 1.5,
          mb: 1.5,
          borderBottom: '1px solid #f0f0f0',
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
            placeholder="Search by name, staff ID, phone, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
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
            <MenuItem value="leave">On Leave</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="all">All Subjects</MenuItem>
            {(subjectOptions || []).map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.subject_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {(classOptions || []).map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {classArmLabel(c)}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Clear search and every filter back to defaults">
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconFilterOff size={16} />}
              onClick={onResetFilters}
            >
              Reset
            </Button>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            size="small"
            fullWidth={{ xs: true, sm: false }}
            startIcon={<IconPlus />}
            onClick={handleAddStaff}
          >
            Add Teaching Staff
          </Button>

          <ButtonGroup fullWidth={{ xs: true, sm: false }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPlus />}
              sx={{ textTransform: 'none' }}
              onClick={handleUploadStaff}
            >
              Multiple Teachers Upload
            </Button>

            <Button variant="contained" size="small" onClick={handleBulkMenuOpen} sx={{ px: 1 }}>
              <IconChevronDown size={16} />
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Box
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
            color="warning"
            variant="contained"
            startIcon={<IconX size={14} />}
            onClick={onBulkDeactivate}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Deactivate
          </Button>
          <Button
            size="small"
            color="info"
            variant="contained"
            startIcon={<IconBook size={14} />}
            onClick={onBulkAssignSubjects}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Assign Subjects
          </Button>
          <Button
            size="small"
            color="secondary"
            variant="contained"
            startIcon={<IconSchool size={14} />}
            onClick={onBulkAssignClasses}
            sx={{ px: 1, fontSize: '0.75rem' }}
          >
            Assign Classes
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
        </Box>
      )}

      {/* Table */}
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
              <TableCell sx={{ fontWeight: 700 }}>Subjects</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Classes</TableCell>
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
                      width={90}
                      height={22}
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      variant="rounded"
                      width={70}
                      height={22}
                      sx={{ borderRadius: '12px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      variant="rounded"
                      width={70}
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
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Alert severity="info" sx={{ justifyContent: 'center' }}>
                    No staff found
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((staffMember, index) => {
                const isClassTeacher = (staffMember.class_teachers?.length || 0) > 0;
                const isSubjectTeacher = (staffMember.subject_teachers?.length || 0) > 0;
                const subjectNames = dedupeBy(
                  (staffMember.subject_teachers || []).map((st) => ({
                    id: st.subject_id,
                    name: st.subject?.subject_name,
                  })),
                  'id',
                ).map((s) => s.name || 'N/A');
                const classLabels = dedupeBy(
                  [
                    ...(staffMember.class_teachers || []),
                    ...(staffMember.subject_teachers || []),
                  ].map((row) => ({
                    id: row.class_arm_id,
                    label: classArmLabel(row.class_arm),
                  })),
                  'id',
                ).map((c) => c.label);

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
                        // Stop it reaching the row's own onClick (which would
                        // call toggleOne a second time and cancel this one
                        // out) — but a checkbox click should open the side
                        // drawer exactly like clicking anywhere else in the
                        // row, so that part still needs firing here.
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
                            bgcolor: 'primary.main',
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
                      <Typography variant="body2">{staffMember.user?.email || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {staffMember.user?.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {isClassTeacher && <Chip size="small" color="info" label="Class Teacher" />}
                        {isSubjectTeacher && (
                          <Chip
                            size="small"
                            color="secondary"
                            variant="outlined"
                            label="Subject Teacher"
                          />
                        )}
                        {!isClassTeacher && !isSubjectTeacher && (
                          <Typography variant="caption" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <OverflowList items={subjectNames} />
                    </TableCell>
                    <TableCell>
                      <OverflowList items={classLabels} />
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
    </Box>
  );
};

export default TeachingStaffTab;
