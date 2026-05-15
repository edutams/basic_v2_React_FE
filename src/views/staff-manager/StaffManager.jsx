import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
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
  IconUser,
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
import TeachingStaffTab from './components/TeachingStaffTab';
import NonTeachingStaffTab from './components/NonTeachingStaffTab';
import UploadStaffModal from './components/UploadStaffModal';
import dayjs from 'dayjs';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import { useNavigate } from 'react-router-dom';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  { title: 'Staff Manager' },
];

const StaffManager = () => {
  const { impersonateStaff } = useContext(TenantAuthContext);

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

  const navigate = useNavigate();

  const [impersonateConfirmOpen, setImpersonateConfirmOpen] = useState(false);
  const [staffToImpersonate, setStaffToImpersonate] = useState(null);
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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

  const confirmImpersonateStaff = (staffMember) => {
    // console.log('Staff member object:', staffMember);
    setStaffToImpersonate(staffMember);
    setImpersonateConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmedImpersonateStaff = async () => {
    if (!staffToImpersonate) return;
    const result = await impersonateStaff(staffToImpersonate?.user?.id);
    if (result.success) {
      notify.success(
        `Now logged in as ${staffToImpersonate.user?.fname} ${staffToImpersonate.user?.lname}`,
      );
      // Navigate to the staff dashboard or reload — adjust route as needed
      navigate('/dashboard');
    } else {
      notify.error(result.error);
    }
    setImpersonateConfirmOpen(false);
    setStaffToImpersonate(null);
  };

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

  const handleDownloadTemplate = async () => {
    handleBulkMenuClose();
    try {
      const res = await staffApi.downloadTemplate(activeTab); // Pass 'teaching' or 'non-teaching'
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename =
        activeTab === 'teaching'
          ? 'teaching_staff_template.xlsx'
          : 'non_teaching_staff_template.xlsx';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Template downloaded');
    } catch (error) {
      notify.error('Failed to download template');
      console.error(error);
    }
  };

  const handleUploadStaff = () => {
    setUploadModalOpen(true);
    handleBulkMenuClose();
  };

  const handleUploadTemplate = async (file) => {
    const res = await staffApi.uploadTemplate(file);
    const message = res?.message || 'Upload complete';
    fetchStaff();
    return message;
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

  const handleEditStaff = async () => {
    if (selectedStaff) {
      console.log('=== EDIT STAFF DEBUG ===');
      console.log('Selected Staff Data from list:', selectedStaff);

      try {
        // Fetch the individual staff data with all relationships
        // console.log('Fetching individual staff data for ID:', selectedStaff.user_id);
        const staffResponse = await staffApi.getSingle(selectedStaff.user_id);
        // console.log('Individual staff response:', staffResponse);

        const staffData = staffResponse.data;
        // console.log('Individual staff data:', staffData);
        // console.log('Class Teachers:', staffData.classTeachers);
        // console.log('Subject Teachers:', staffData.subjectTeachers);

        // Transform class teachers to classAllocations array
        const classAllocations =
          staffData.classAllocations ||
          (staffData.classTeachers && staffData.classTeachers.length > 0
            ? staffData.classTeachers.map((classTeacher) => {
                // console.log('Processing class teacher:', classTeacher);
                return {
                  session_term_id: classTeacher.session_term_id || '',
                  programme_id: classTeacher.classArm?.programmeClass?.programme_id || '',
                  class_id: classTeacher.classArm?.programmeClass?.class_id || '',
                  class_arm_id: classTeacher.class_arm_id || '',
                };
              })
            : [
                {
                  session_term_id: '',
                  programme_id: '',
                  class_id: '',
                  class_arm_id: '',
                },
              ]);

        // Transform subject teachers to subjectAllocations array
        const subjectAllocations =
          staffData.subjectAllocations ||
          (staffData.subjectTeachers && staffData.subjectTeachers.length > 0
            ? staffData.subjectTeachers.map((subjectTeacher) => {
                // console.log('Processing subject teacher:', subjectTeacher);
                return {
                  session_term_id: subjectTeacher.session_term_id || '',
                  programme_id: subjectTeacher.classArm?.programmeClass?.programme_id || '',
                  class_id: subjectTeacher.classArm?.programmeClass?.class_id || '',
                  class_arm_id: subjectTeacher.class_arm_id || '',
                  curriculum_id: subjectTeacher.subject?.curriculum_id || '',
                  subject_id: subjectTeacher.subject_id || '',
                };
              })
            : [
                {
                  session_term_id: '',
                  programme_id: '',
                  class_id: '',
                  class_arm_id: '',
                  curriculum_id: '',
                  subject_id: '',
                },
              ]);

        // console.log('Transformed class allocations:', classAllocations);
        // console.log('Transformed subject allocations:', subjectAllocations);

        const formDataForEdit = {
          staff_id: staffData.staff_id || '',
          surname: staffData.surname || '',
          first_name: staffData.first_name || '',
          phone_number: staffData.phone_number || '',
          gender: staffData.gender || '',
          email: staffData.email || '',
          date_of_appointment: staffData.date_of_appointment
            ? dayjs(staffData.date_of_appointment)
            : null,
          status: staffData.status || 'active',
          role: activeTab === 'non-teaching' ? staffData.role || '' : undefined,

          // New allocation arrays
          classAllocations: classAllocations,
          subjectAllocations: subjectAllocations,

          // Legacy allocation fields (for backward compatibility)
          class_session_term_id: selectedStaff.class_teacher?.session_term_id || '',
          class_programme_id:
            selectedStaff.class_teacher?.class_arm?.programme_class?.programme_id || '',
          class_id: selectedStaff.class_teacher?.class_arm?.programme_class?.class_id || '',
          class_arm_id: selectedStaff.class_teacher?.class_arm_id || '',
          // Allocation fields from subject_teacher
          subject_session_term_id: selectedStaff.subject_teacher?.session_term_id || '',
          subject_programme_id:
            selectedStaff.subject_teacher?.subject?.programme_subject?.[0]?.programme_id || '',
          subject_class_id:
            selectedStaff.subject_teacher?.class_arm?.programme_class?.class_id || '',
          subject_class_arm_id: selectedStaff.subject_teacher?.class_arm_id || '',
          subject_curriculum_id: selectedStaff.subject_teacher?.subject?.curriculum_id || '',
          subject_id: selectedStaff.subject_teacher?.subject_id || '',
        };

        // console.log('Final form data for edit:', formDataForEdit);
        // console.log('Class allocations being passed to form:', formDataForEdit.classAllocations);
        // console.log('Subject allocations being passed to form:', formDataForEdit.subjectAllocations);

        setFormData(formDataForEdit);
        setEditModalOpen(true);
      } catch (error) {
        console.error('Error fetching individual staff data:', error);
        notify.error('Failed to load staff details for editing');
      }
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
      // console.log('Values received in handleSaveStaff:', values);

      // Map form values to API format - include allocation arrays
      const apiData = {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: values.middle_name || '',
        email: values.email,
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender?.toLowerCase() || 'male',
        staff_type: activeTab === 'teaching' ? 'teaching' : 'non-teaching',
        date_of_first_appointment: values.date_of_first_appointment
          ? typeof values.date_of_first_appointment === 'string'
            ? values.date_of_first_appointment
            : values.date_of_first_appointment.format('YYYY-MM-DD')
          : null,
        status: values.status,

        // Include new bulk allocation arrays
        classAllocations: values.classAllocations || [],
        subjectAllocations: values.subjectAllocations || [],

        // Legacy single allocation fields for backward compatibility
        class_session_term_id: values.class_session_term_id,
        class_programme_id: values.class_programme_id,
        class_id: values.class_id,
        class_arm_id: values.class_arm_id,
        subject_session_term_id: values.subject_session_term_id,
        subject_programme_id: values.subject_programme_id,
        subject_class_id: values.subject_class_id,
        subject_curriculum_id: values.subject_curriculum_id,
        subject_id: values.subject_id,
        subject_class_arm_id: values.subject_class_arm_id,
      };

      // Add role for non-teaching staff
      if (activeTab === 'non-teaching') {
        apiData.role = values.role;
      }

      // console.log('API Data being sent:', apiData);

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
      // console.log('Values received in handleUpdateStaff:', values);

      // Map form values to API format - include allocation arrays
      const apiData = {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: values.middle_name || '',
        email: values.email,
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender?.toLowerCase() || 'male',
        staff_type: selectedStaff.staff_type,
        date_of_first_appointment: values.date_of_appointment
          ? typeof values.date_of_first_appointment === 'string'
            ? values.date_of_first_appointment
            : values.date_of_appointment.format('YYYY-MM-DD')
          : null,
        status: values.status,

        // Include new bulk allocation arrays
        classAllocations: values.classAllocations || [],
        subjectAllocations: values.subjectAllocations || [],

        // Legacy single allocation fields for backward compatibility
        class_session_term_id: values.class_session_term_id,
        class_programme_id: values.class_programme_id,
        class_id: values.class_id,
        class_arm_id: values.class_arm_id,
        subject_session_term_id: values.subject_session_term_id,
        subject_programme_id: values.subject_programme_id,
        subject_class_id: values.subject_class_id,
        subject_class_arm_id: values.subject_class_arm_id,
        subject_curriculum_id: values.subject_curriculum_id,
        subject_id: values.subject_id,
      };

      // Add role for non-teaching staff
      if (activeTab === 'non-teaching') {
        apiData.role = values.role;
      }

      // console.log('API Data being sent for update:', apiData);

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
      icon: <IconUsers size={24} />,
      bgColor: 'primary.light',
      iconColor: 'primary.main',
    },
    {
      title: 'Teaching Staff',
      value: stats.teaching,
      icon: <IconUserCheck size={24} />,
      bgColor: 'success.light',
      iconColor: 'success.main',
    },
    {
      title: 'Non-Teaching Staff',
      value: stats.nonTeaching,
      icon: <IconUserX size={24} />,
      bgColor: 'info.light',
      iconColor: 'info.main',
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      icon: <IconCalendarOff size={24} />,
      bgColor: 'warning.light',
      iconColor: 'warning.main',
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
                    color: stat.iconColor,
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
        {/* Content Area */}
        <Box>
          {activeTab === 'teaching' && (
            <TeachingStaffTab
              loading={loading}
              staff={staff}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              allocationSubTab={allocationSubTab}
              setAllocationSubTab={setAllocationSubTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              page={page}
              rowsPerPage={rowsPerPage}
              total={total}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleAddStaff={handleAddStaff}
              handleBulkMenuOpen={handleBulkMenuOpen}
              handleUploadStaff={handleUploadStaff}
              handleMenuOpen={handleMenuOpen}
              getStatusColor={getStatusColor}
            />
          )}

          {activeTab === 'non-teaching' && (
            <NonTeachingStaffTab
              loading={loading}
              staff={staff}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              page={page}
              rowsPerPage={rowsPerPage}
              total={total}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              handleAddStaff={handleAddStaff}
              handleBulkMenuOpen={handleBulkMenuOpen}
              handleUploadStaff={handleUploadStaff}
              handleMenuOpen={handleMenuOpen}
              getStatusColor={getStatusColor}
            />
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
        <MenuItem onClick={() => confirmImpersonateStaff(selectedStaff)}>
          <IconUser size={18} style={{ marginRight: 8 }} />
          Login As Staff
        </MenuItem>
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

      <Dialog
        open={impersonateConfirmOpen}
        onClose={() => {
          setImpersonateConfirmOpen(false);
          setStaffToImpersonate(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Login as Staff</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to login as{' '}
            <strong>
              {staffToImpersonate?.user?.fname} {staffToImpersonate?.user?.lname}
            </strong>
            ? You can return to your account at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setImpersonateConfirmOpen(false);
              setStaffToImpersonate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={handleConfirmedImpersonateStaff}
            sx={{ bgcolor: '#593196', '&:hover': { bgcolor: '#4a2880' }, color: '#ffffff' }}
          >
            Yes, Login As
          </Button>
        </DialogActions>
      </Dialog>

      <UploadStaffModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadTemplate}
        onDownloadTemplate={handleDownloadTemplate}
      />

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
