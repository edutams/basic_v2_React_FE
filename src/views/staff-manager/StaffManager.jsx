import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  TablePagination,
  ButtonGroup,
} from '@mui/material';
import {
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconCalendarOff,
  IconSearch,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconChevronDown,
  IconDownload,
  IconUpload,
} from '@tabler/icons-react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import staffApi from '../../api/staffApi';
import useNotification from '../../hooks/useNotification';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import StaffModal from './StaffModal';
import AddNonTeachingStaffModal from './AddNonTeachingStaffModal';
import ClassTeacherAllocation from './ClassTeacherAllocation';
import SubjectTeacherAllocation from './SubjectTeacherAllocation';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  { title: 'Staff Manager' },
];

const StaffManager = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState('teaching');
  const [activeSubTab, setActiveSubTab] = useState('profiling'); // For Teaching Staff sub-tabs
  const [allocationSubTab, setAllocationSubTab] = useState('class-teacher'); // For Allocation sub-tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    teaching: 0,
    nonTeaching: 0,
    onLeave: 0,
  });

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form data - for staff modal
  const [formData, setFormData] = useState({
    staff_id: '',
    surname: '',
    first_name: '',
    phone_number: '',
    gender: '',
    email: '',
    date_of_appointment: null,
    status: 'active',
    role: '',
  });

  useEffect(() => {
    fetchStaff();
  }, [activeTab, page, rowsPerPage, searchQuery, statusFilter]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
      };

      const response = await staffApi.getAll(params);

      if (response.status) {
        const allStaff = response.data || [];

        // Filter by tab and status
        let filtered = allStaff.filter((s) => s.staff_type === activeTab);

        // Apply status filter
        if (statusFilter !== 'all') {
          filtered = filtered.filter((s) => (s.status || 'active').toLowerCase() === statusFilter);
        }

        setStaff(filtered);

        // Calculate stats
        const teaching = allStaff.filter((s) => s.staff_type === 'teaching').length;
        const nonTeaching = allStaff.filter((s) => s.staff_type === 'non-teaching').length;
        const onLeave = allStaff.filter((s) => s.status === 'leave').length;

        setStats({
          total: allStaff.length,
          teaching,
          nonTeaching,
          onLeave,
        });

        setTotal(response.total || filtered.length);
      }
    } catch (error) {
      notify.error('Failed to fetch staff');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, staffMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staffMember);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBulkMenuOpen = (event) => {
    setBulkMenuAnchorEl(event.currentTarget);
  };

  const handleBulkMenuClose = () => {
    setBulkMenuAnchorEl(null);
  };

  const handleDownloadTemplate = () => {
    // TODO: Implement download template functionality
    notify.info('Download template functionality coming soon');
    handleBulkMenuClose();
  };

  const handleUploadStaff = () => {
    // TODO: Implement upload staff functionality
    notify.info('Upload staff functionality coming soon');
    handleBulkMenuClose();
  };

  const handleAddStaff = () => {
    setFormData({
      staff_id: '',
      surname: '',
      first_name: '',
      phone_number: '',
      gender: '',
      email: '',
      date_of_appointment: null,
      status: 'active',
      role: activeTab === 'non-teaching' ? '' : undefined,
    });
    setAddModalOpen(true);
  };

  const handleEditStaff = () => {
    if (selectedStaff) {
      setFormData({
        staff_id: selectedStaff.staff_id || '',
        surname: selectedStaff.user?.lname || '',
        first_name: selectedStaff.user?.fname || '',
        phone_number: selectedStaff.user?.phone || '',
        gender: selectedStaff.user?.sex || '',
        email: selectedStaff.user?.email || '',
        date_of_appointment: selectedStaff.date_of_appointment || null,
        status: selectedStaff.status || 'active',
        role: activeTab === 'non-teaching' ? selectedStaff.role || '' : undefined,
      });
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleViewStaff = () => {
    setViewModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleSaveStaff = async (values) => {
    setModalLoading(true);
    try {
      // Map form values to API format
      const apiData = {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: '',
        email: values.email,
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender?.toLowerCase() || 'male',
        staff_type: activeTab === 'teaching' ? 'teaching' : 'non-teaching',
        date_of_appointment: values.date_of_appointment
          ? values.date_of_appointment.format('YYYY-MM-DD')
          : null,
        status: values.status,
      };

      // Add role for non-teaching staff
      if (activeTab === 'non-teaching') {
        apiData.role = values.role;
      }

      const response = await staffApi.create(apiData);
      if (response.status) {
        notify.success('Staff added successfully');
        setAddModalOpen(false);
        fetchStaff();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to add staff');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStaff = async (values) => {
    setModalLoading(true);
    try {
      // Map form values to API format
      const apiData = {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: '',
        email: values.email,
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender?.toLowerCase() || 'male',
        staff_type: selectedStaff.staff_type,
        date_of_appointment: values.date_of_appointment
          ? values.date_of_appointment.format('YYYY-MM-DD')
          : null,
        status: values.status,
      };

      // Add role for non-teaching staff
      if (activeTab === 'non-teaching') {
        apiData.role = values.role;
      }

      const response = await staffApi.update(selectedStaff.user_id, apiData);
      if (response.status) {
        notify.success('Staff updated successfully');
        setEditModalOpen(false);
        fetchStaff();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update staff');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    try {
      const response = await staffApi.delete(selectedStaff.user_id);
      if (response.status) {
        notify.success('Staff deleted successfully');
        setDeleteModalOpen(false);
        fetchStaff();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to delete staff');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  const statCards = [
    {
      title: 'Total Staff',
      value: stats.total,
      icon: <IconUsers size={24} color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
    {
      title: 'Teaching Staff',
      value: stats.teaching,
      icon: <IconUserCheck size={24} color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
    {
      title: 'Non-Teaching Staff',
      value: stats.nonTeaching,
      icon: <IconUserX size={24} color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      icon: <IconCalendarOff size={24} color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
  ];

  return (
    <PageContainer title="Staff Manager" description="Manage Teaching & Non Teaching Staff">
      <Breadcrumb title="Staff Manager" items={BCrumb} />

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #eee',
                px: 2,
                py: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(0);
            if (newValue === 'teaching') {
              setActiveSubTab('profiling');
            }
          }}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
        >
          <Tab label="Teaching Staff" value="teaching" />
          <Tab label="Non-Teaching Staff" value="non-teaching" />
        </Tabs>
      </Box>

      {/* Main Content Card */}
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden', p: 2 }}
      >
        {/* Sub-tabs for Teaching Staff */}
        {activeTab === 'teaching' && (
          <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeSubTab}
              onChange={(e, newValue) => {
                setActiveSubTab(newValue);
                setPage(0);
              }}
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '14px' },
              }}
            >
              <Tab label="Profiling" value="profiling" />
              <Tab label="Allocation" value="allocation" />
            </Tabs>
          </Box>
        )}

        {/* Content Area */}
        <Box>
          {/* Show Profiling Content for Teaching Staff */}
          {activeTab === 'teaching' && activeSubTab === 'profiling' && (
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
                              <Box
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
                              </Box>
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

          {/* Show Allocation Content for Teaching Staff */}
          {activeTab === 'teaching' && activeSubTab === 'allocation' && (
            <Box sx={{ p: 2 }}>
              {/* Allocation Sub-tabs */}
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

              {/* Allocation Content */}
              {allocationSubTab === 'class-teacher' && <ClassTeacherAllocation />}
              {allocationSubTab === 'subject-teacher' && <SubjectTeacherAllocation />}
            </Box>
          )}

          {/* Show Non-Teaching Staff Content */}
          {activeTab === 'non-teaching' && (
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
                      Add Multiple Staff
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
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
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
                              <Box
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
                              </Box>
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
                            <Chip
                              label={staffMember.role || 'N/A'}
                              size="small"
                              sx={{
                                bgcolor: '#f5f5f5',
                                color: '#666',
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={staffMember.status || 'Active'}
                              color={getStatusColor(staffMember.status)}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
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
        </Box>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* <MenuItem onClick={handleViewStaff}>
          <IconEye size={18} style={{ marginRight: 8 }} />
          View Details
        </MenuItem> */}
        <MenuItem onClick={handleEditStaff}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <IconTrash size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchorEl}
        open={Boolean(bulkMenuAnchorEl)}
        onClose={handleBulkMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDownloadTemplate}>
          <IconDownload size={18} style={{ marginRight: 8 }} />
          Download Template
        </MenuItem>
        <MenuItem onClick={handleUploadStaff}>
          <IconUpload size={18} style={{ marginRight: 8 }} />
          Upload Staff
        </MenuItem>
      </Menu>

      {/* Add Staff Modal - Teaching */}
      {activeTab === 'teaching' && (
        <StaffModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSaveStaff}
          isLoading={modalLoading}
          mode="create"
          initialValues={formData}
        />
      )}

      {/* Add Staff Modal - Non-Teaching */}
      {activeTab === 'non-teaching' && (
        <AddNonTeachingStaffModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSaveStaff}
          isLoading={modalLoading}
          mode="create"
          initialValues={formData}
        />
      )}

      {/* Edit Staff Modal - Teaching */}
      {activeTab === 'teaching' && (
        <StaffModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdateStaff}
          isLoading={modalLoading}
          mode="edit"
          initialValues={formData}
        />
      )}

      {/* Edit Staff Modal - Non-Teaching */}
      {activeTab === 'non-teaching' && (
        <AddNonTeachingStaffModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdateStaff}
          isLoading={modalLoading}
          mode="edit"
          initialValues={formData}
        />
      )}

      {/* View Staff Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Staff Details</DialogTitle>
        <DialogContent dividers>
          {selectedStaff && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Staff ID
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedStaff.staff_id || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedStaff.status || 'Active'}
                      color={getStatusColor(selectedStaff.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedStaff.user?.fname} {selectedStaff.user?.mname}{' '}
                    {selectedStaff.user?.lname}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedStaff.user?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{selectedStaff.user?.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedStaff.user?.sex || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Staff Type
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedStaff.staff_type || 'N/A'}
                  </Typography>
                </Grid>
                {activeTab === 'non-teaching' && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      Role
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {selectedStaff.role || 'N/A'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setViewModalOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff"
        message={`Are you sure you want to delete ${selectedStaff?.user?.fname} ${selectedStaff?.user?.lname}? This action cannot be undone.`}
        severity="error"
      />
    </PageContainer>
  );
};

export default StaffManager;
