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
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  ButtonGroup,
  TablePagination,
  Avatar,

} from '@mui/material';
import {
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconChevronDown,
  IconUsers,
} from '@tabler/icons-react';
import ClassTeacherAllocation from '../ClassTeacherAllocation';
import SubjectTeacherAllocation from '../SubjectTeacherAllocation';

const TeachingStaffTab = ({
  loading,
  staff,
  activeSubTab,
  setActiveSubTab,
  allocationSubTab,
  setAllocationSubTab,
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
  handleMenuOpen,
  getStatusColor,
}) => {
  return (
    <Box>
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeSubTab}
          onChange={(e, newValue) => {
            setActiveSubTab(newValue);
          }}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '14px' },
          }}
        >
          <Tab label="Profiling" value="profiling" />
          <Tab label="Allocation" value="allocation" />
        </Tabs>
      </Box>

      {activeSubTab === 'profiling' && (
        <>
          {/* Toolbar */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />

              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 150 }}
                SelectProps={{ native: true }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="leave">On Leave</option>
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={handleAddStaff}
              >
                Add Single Staff
              </Button>
              <ButtonGroup variant="outlined">
                <Button startIcon={<IconPlus size={18} />} sx={{ textTransform: 'none' }}>
                  Excel
                </Button>
                <Button size="small" onClick={handleBulkMenuOpen} sx={{ px: 1 }}>
                  <IconChevronDown size={16} />
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Staff Id</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>FullName</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Appointment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Typography color="textSecondary">No staff found</Typography>
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
                            src={staffMember.user.avatar}
                            alt={staffMember.user.lname[0]}
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: '12px',
                              fontWeight: 700,
                              bgcolor: '#2196f3',
                              flexShrink: 0,
                            }}
                          >
                            {/* {!(staffMember.user.avatar || agent.admin_avatar) && initials} */}
                          </Avatar>
                          <Typography variant="body2">
                            {staffMember.user?.fname} {staffMember.user?.lname}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {staffMember.user?.email || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {staffMember.user?.phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {staffMember.date_of_appointment
                            ? new Date(staffMember.date_of_appointment).toLocaleDateString(
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
                          label={staffMember.status || 'active'}
                          color={getStatusColor(staffMember.status)}
                          size="small"
                          sx={{ textTransform: 'lowercase' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, staffMember)}
                        >
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
        </>
      )}

      {activeSubTab === 'allocation' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={allocationSubTab}
              onChange={(e, newValue) => setAllocationSubTab(newValue)}
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '14px' },
              }}
            >
              <Tab label="Class Teacher Allocation" value="class-teacher" />
              <Tab label="Subject Teacher" value="subject-teacher" />
            </Tabs>
          </Box>
          {allocationSubTab === 'class-teacher' && <ClassTeacherAllocation />}
          {allocationSubTab === 'subject-teacher' && <SubjectTeacherAllocation />}
        </Box>
      )}
    </Box>
  );
};

export default TeachingStaffTab;
