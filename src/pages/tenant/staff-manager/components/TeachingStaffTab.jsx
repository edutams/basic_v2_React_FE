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
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  TablePagination,
  Avatar,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconChevronDown,
  IconUsers,
} from '@tabler/icons-react';
import { statusLabel } from './StaffStatusModal';

const TeachingStaffTab = ({
  loading,
  staff,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
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
}) => {
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
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <TextField
                size="small"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 300 },
                }}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 150 },
                }}
                SelectProps={{ native: true }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="leave">On Leave</option>
              </TextField>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Button variant="contained" size="small" fullWidth={{ xs: true, sm: false }} startIcon={<IconPlus />}
                onClick={handleAddStaff}
              >
                Add Teaching Staff
              </Button>

              <ButtonGroup fullWidth={{ xs: true, sm: false }}>
                <Button variant="contained" size="small" startIcon={<IconPlus />}
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

          {/* Table */}
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Staff Id</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>FullName</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Class(es)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject(s)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Appointment</TableCell>
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
                      <TableCell><Skeleton variant="text" width={20} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Skeleton variant="circular" width={30} height={30} />
                          <Skeleton variant="text" width={120} height={20} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={140} height={20} />
                        <Skeleton variant="text" width={90} height={16} />
                      </TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell><Skeleton variant="text" width={90} height={20} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: '12px' }} /></TableCell>
                      <TableCell align="center"><Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>No staff found</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((staffMember, index) => (
                    <TableRow key={staffMember.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {staffMember.staff_id || staffMember.user?.user_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {/* <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: '#e3f2fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconUsers size={18} color="#1976d2" />
                          </Box> */}
                          <Avatar
                            src={staffMember.user?.avatar}
                            alt={staffMember.user?.lname?.[0]}
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: '12px',
                              fontWeight: 700,
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          >
                            {/* {!(staffMember.user.avatar || agent.admin_avatar) && initials} */}
                          </Avatar>
                          <Typography variant="body2">{staffMember.user?.full_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{staffMember.user?.email || 'N/A'}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {staffMember.user?.phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {staffMember.class_teachers?.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 180 }}>
                            {staffMember.class_teachers.map((ct) => (
                              <Chip
                                key={ct.id}
                                size="small"
                                label={[
                                  ct.class_arm?.programme_class?.class?.class_name,
                                  ct.class_arm?.class_arm_names,
                                ]
                                  .filter(Boolean)
                                  .join(' ') || 'N/A'}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {staffMember.subject_teachers?.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 220 }}>
                            {staffMember.subject_teachers.map((st) => (
                              <Chip
                                key={st.id}
                                size="small"
                                color="primary"
                                variant="outlined"
                                label={
                                  [
                                    st.subject?.subject_name,
                                    [
                                      st.class_arm?.programme_class?.class?.class_name,
                                      st.class_arm?.class_arm_names,
                                    ]
                                      .filter(Boolean)
                                      .join(' '),
                                  ]
                                    .filter(Boolean)
                                    .join(' — ') || 'N/A'
                                }
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {staffMember.date_of_first_appointment
                            ? new Date(staffMember.date_of_first_appointment).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel(staffMember.staff_status)}
                          color={getStatusColor(staffMember.staff_status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, staffMember)}>
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
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
