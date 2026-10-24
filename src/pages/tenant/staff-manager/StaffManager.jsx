import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Stack,
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
  Avatar,
  Alert,
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
  IconHistory,
  IconSchool,
  IconBook,
  IconClipboardList,
  IconCamera,
  IconKey,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import ArrowHint from '@/components/shared/ArrowHint';
import staffApi from '@/api/tenant/staffs/staffApi';
import subjectRegistrationApi from '@/api/tenant/subject-registration/subjectRegistrationApi';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import { useNotification } from '@/hooks/useNotification';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import StaffModal from './StaffModal';
import AddNonTeachingStaffModal from './AddNonTeachingStaffModal';
import TeachingStaffTab from './components/TeachingStaffTab';
import NonTeachingStaffTab from './components/NonTeachingStaffTab';
import TeacherOverviewPanel from './TeacherOverviewPanel';
import BulkAssignModal from './components/BulkAssignModal';
import UploadStaffModal from './components/UploadStaffModal';
import StaffStatusModal from './components/StaffStatusModal';
import dayjs from 'dayjs';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StatCard from 'src/components/shared/StatCard';

const StaffManager = () => {
  const { impersonateStaff } = useContext(TenantAuthContext);

  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'teaching');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [roleOptions, setRoleOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Teaching Staff tab: row selection + detail panel
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [detailPanelStaff, setDetailPanelStaff] = useState(null);

  // One-time onboarding hint: "click a row" -> "panel updates" -> done.
  // Never reverts to 'row' once the user has opened the panel once, even
  // if they close it again — this is a one-shot tour for this page visit,
  // not a nag that reappears every time the panel closes.
  const [tourStep, setTourStep] = useState('row');
  useEffect(() => {
    if (detailPanelStaff && tourStep === 'row') {
      setTourStep('panel');
      const timer = setTimeout(() => setTourStep('done'), 5200);
      return () => clearTimeout(timer);
    }
  }, [detailPanelStaff, tourStep]);
  const [bulkActivateConfirmOpen, setBulkActivateConfirmOpen] = useState(false);
  const [bulkDeactivateConfirmOpen, setBulkDeactivateConfirmOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkAssignMode, setBulkAssignMode] = useState(null); // null | 'classes' | 'subjects'

  const navigate = useNavigate();

  const [impersonateConfirmOpen, setImpersonateConfirmOpen] = useState(false);
  const [staffToImpersonate, setStaffToImpersonate] = useState(null);
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    teaching: 0,
    nonTeaching: 0,
    onLeave: 0,
    activeTeaching: 0,
    inactiveTeaching: 0,
    teachingLoad: 0,
    classesCovered: 0,
    classesTotal: 0,
    activeNonTeaching: 0,
    inactiveNonTeaching: 0,
    supportFunctions: 0,
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
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [updatePhotoOpen, setUpdatePhotoOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [updatePhotoLoading, setUpdatePhotoLoading] = useState(false);
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
  }, [
    activeTab,
    page,
    rowsPerPage,
    searchQuery,
    statusFilter,
    subjectFilter,
    classFilter,
    roleFilter,
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'teaching') return;
    subjectRegistrationApi
      .getSubjects({ per_page: 200 })
      .then((res) => setSubjectOptions(res.data?.data || res.data || []))
      .catch(() => {});
    timetableApi
      .getClassArms()
      .then((res) => setClassOptions(res.data?.data || []))
      .catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'non-teaching') return;
    staffApi
      .getNonTeachingRoles()
      .then((res) => setRoleOptions(res.data || []))
      .catch(() => {});
  }, [activeTab]);

  const confirmImpersonateStaff = (staffMember) => {
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
    if (activeTab !== 'teaching' && activeTab !== 'non-teaching') return;

    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
        staff_type: activeTab,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (activeTab === 'teaching') {
        if (subjectFilter !== 'all') {
          params.subject_id = subjectFilter;
        }
        if (classFilter !== 'all') {
          params.class_arm_id = classFilter;
        }
      }

      if (activeTab === 'non-teaching' && roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const response = await staffApi.getAll(params);

      if (response.status) {
        // Filtering (by staff_type, status) and pagination both happen
        // server-side now — response.data is already exactly this tab's page.
        setStaff(response.data || []);
        setTotal(response.total_staff ?? 0);
      }
    } catch (error) {
      notify.error('Failed to fetch staff');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // School-wide counts for the stat cards — independent of the current
  // tab/page/filter, so "Teaching Staff" doesn't read 0 just because the
  // Non-Teaching tab happens to be open.
  const fetchStats = async () => {
    try {
      const response = await staffApi.getCounts();
      if (response.status) {
        const {
          total,
          teaching,
          non_teaching: nonTeaching,
          on_leave: onLeave,
          active_teaching: activeTeaching,
          inactive_teaching: inactiveTeaching,
          teaching_load: teachingLoad,
          classes_covered: classesCovered,
          classes_total: classesTotal,
          active_non_teaching: activeNonTeaching,
          inactive_non_teaching: inactiveNonTeaching,
          support_functions: supportFunctions,
        } = response.data;
        setStats({
          total,
          teaching,
          nonTeaching,
          onLeave,
          activeTeaching,
          inactiveTeaching,
          teachingLoad,
          classesCovered,
          classesTotal,
          activeNonTeaching,
          inactiveNonTeaching,
          supportFunctions,
        });
      }
    } catch (error) {
      console.error(error);
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
    fetchStats();
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
      try {
        // Fetch the individual staff data with all relationships
        const staffResponse = await staffApi.getSingle(selectedStaff.user_id);

        const staffData = staffResponse.data;
        // Transform class teachers to classAllocations array
        const classAllocations =
          staffData.classAllocations ||
          (staffData.classTeachers && staffData.classTeachers.length > 0
            ? staffData.classTeachers.map((classTeacher) => {
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

  const handleUpdateStatusClick = () => {
    setStatusModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleOpenResetPassword = () => {
    setResetPasswordOpen(true);
    handleMenuClose();
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedStaff) return;
    try {
      setResetPasswordLoading(true);
      const res = await staffApi.resetPassword(selectedStaff.user_id);
      notify.success(`Password reset to "${res?.data?.password}"`);
      setResetPasswordOpen(false);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleOpenUpdatePhoto = () => {
    setPhotoPreview(selectedStaff?.user?.avatar || null);
    setPhotoFile(null);
    setUpdatePhotoOpen(true);
    handleMenuClose();
  };

  const handlePhotoFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleConfirmUpdatePhoto = async () => {
    if (!selectedStaff || !photoFile) return;
    try {
      setUpdatePhotoLoading(true);
      await staffApi.updatePhoto(selectedStaff.user_id, photoFile);
      notify.success('Photo updated successfully');
      setUpdatePhotoOpen(false);
      setPhotoFile(null);
      fetchStaff();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update photo');
    } finally {
      setUpdatePhotoLoading(false);
    }
  };

  const handleSaveStaff = async (values) => {
    setModalLoading(true);
    try {
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

      const response = await staffApi.create(apiData);
      if (response.status) {
        notify.success('Staff added successfully');
        setAddModalOpen(false);
        fetchStaff();
        fetchStats();
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

      const response = await staffApi.update(selectedStaff.user_id, apiData);
      if (response.status) {
        notify.success('Staff updated successfully');
        setEditModalOpen(false);
        fetchStaff();
        fetchStats();
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
        fetchStats();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to delete staff');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setClassFilter('all');
    setRoleFilter('all');
    setPage(0);
  };

  const handleRowClick = (staffMember) => {
    setDetailPanelStaff((prev) => (prev?.user_id === staffMember.user_id ? null : staffMember));
  };

  // Bulk actions loop the existing single-staff endpoints — the selection
  // is always small (one page of rows), and this reuses the same
  // guards/side-effects a single action already has, rather than adding a
  // parallel bulk endpoint.
  const runBulkStatusChange = async (status) => {
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => staffApi.updateStatus(id, { status })));
      notify.success(
        `${ids.length} teacher(s) ${status === 'active' ? 'activated' : 'deactivated'}`,
      );
      setSelectedIds(new Set());
      fetchStaff();
      fetchStats();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Some updates failed');
    } finally {
      setBulkActionLoading(false);
      setBulkActivateConfirmOpen(false);
      setBulkDeactivateConfirmOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map((id) => staffApi.delete(id)));
      notify.success(`${ids.length} teacher(s) deleted`);
      setSelectedIds(new Set());
      setBulkDeleteConfirmOpen(false);
      fetchStaff();
      fetchStats();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Some deletions failed');
    } finally {
      setBulkActionLoading(false);
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
      case 'leave':
        return 'warning';
      case 'inactive':
      case 'suspended':
        return 'error';
      case 'retired':
      case 'transferred':
        return 'info';
      case 'dead':
      default:
        return 'default';
    }
  };

  const teachingStatCards = [
    {
      title: 'Total Teachers',
      value: stats.teaching,
      icon: IconUsers,
      subtitle: 'All teaching staff in the school',
      tooltip: 'Every staff member with staff_type = teaching, regardless of status.',
    },
    {
      title: 'Active Teachers',
      value: stats.activeTeaching,
      icon: IconUserCheck,
      subtitle: 'Currently active',
      tooltip: 'Teaching staff whose status is Active.',
    },
    {
      title: 'Inactive Teachers',
      value: stats.inactiveTeaching,
      icon: IconUserX,
      subtitle: 'Not active / on leave',
      tooltip:
        'Teaching staff whose status is Inactive or On Leave. Retired/transferred/suspended staff aren’t counted in either this or Active.',
    },
    {
      title: 'Teaching Load',
      value: stats.teachingLoad,
      icon: IconBook,
      subtitle: 'Assigned subjects/classes',
      tooltip:
        'Total active class-teacher + subject-teacher allocations this term — a sum of assignments, not a count of teachers.',
    },
    {
      title: 'Classes Covered',
      value: `${stats.classesCovered}/${stats.classesTotal}`,
      icon: IconSchool,
      subtitle: 'Classes with a teacher',
      tooltip:
        'Active class arms that have a class teacher assigned, out of all active class arms.',
    },
  ];

  const nonTeachingStatCards = [
    {
      title: 'Total Non-Teaching Staff',
      value: stats.nonTeaching,
      icon: IconUsers,
      subtitle: 'All non-teaching staff in the school',
      tooltip: 'Every staff member with staff_type = non-teaching, regardless of status.',
    },
    {
      title: 'Active Staff',
      value: stats.activeNonTeaching,
      icon: IconUserCheck,
      subtitle: 'Currently active',
      tooltip: 'Non-teaching staff whose status is Active.',
    },
    {
      title: 'Inactive Staff',
      value: stats.inactiveNonTeaching,
      icon: IconUserX,
      subtitle: 'Deactivated or deceased',
      tooltip: 'Non-teaching staff whose status is Inactive or Deceased.',
    },
    {
      title: 'Support Functions',
      value: stats.supportFunctions,
      icon: IconClipboardList,
      subtitle: 'Key non-teaching roles',
      tooltip:
        'Distinct role titles currently assigned to non-teaching staff (e.g. Librarian, Accounts Assistant) — not a headcount.',
    },
  ];

  const statCards =
    activeTab === 'non-teaching'
      ? nonTeachingStatCards
      : activeTab === 'teaching'
        ? teachingStatCards
        : [];

  const statCardsLoading = loading;

  return (
    <PageContainer title="Staff Manager" description="Manage Teaching & Non Teaching Staff">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Staff Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage teaching and non-teaching staff, allocations and timetables.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconUpload size={16} />}
            onClick={handleUploadStaff}
          >
            {activeTab === 'non-teaching' ? 'Import Staff' : 'Import Teachers'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconDownload size={16} />}
            onClick={handleDownloadTemplate}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<IconPlus size={16} />}
            onClick={handleAddStaff}
          >
            {activeTab === 'non-teaching' ? 'Add Non-Teaching Staff' : 'Add Teacher'}
          </Button>
        </Box>
      </Stack>

      {/* Stat Cards */}
      {statCards.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 1 }}>
          {statCards.map((stat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 12 / statCards.length }} key={i}>
              <StatCard
                align="left"
                count={stat.value}
                label={stat.title}
                icon={stat.icon}
                subtitle={stat.subtitle}
                tooltip={stat.tooltip}
                colorIndex={i}
                loading={statCardsLoading}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(0);
            setSelectedIds(new Set());
            setDetailPanelStaff(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
        >
          <Tab label={`Teaching Staff (${stats.teaching})`} value="teaching" />
          <Tab label={`Non-Teaching Staff (${stats.nonTeaching})`} value="non-teaching" />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box>
        {activeTab === 'teaching' && (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <ArrowHint
                show={tourStep === 'row' && staff.length > 0}
                label="🚀 1. Click on a teacher's row — the row is highlighted to show it is selected."
                direction="down-left"
                mode="persistent"
                delay="0.3s"
                maxWidth={240}
                position={{ position: 'absolute', top: 70, right: 24, zIndex: 20 }}
              />
              <TeachingStaffTab
                loading={loading}
                staff={staff}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                subjectFilter={subjectFilter}
                setSubjectFilter={setSubjectFilter}
                classFilter={classFilter}
                setClassFilter={setClassFilter}
                subjectOptions={subjectOptions}
                classOptions={classOptions}
                onResetFilters={handleResetFilters}
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
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onBulkActivate={() => setBulkActivateConfirmOpen(true)}
                onBulkDeactivate={() => setBulkDeactivateConfirmOpen(true)}
                onBulkAssignSubjects={() => setBulkAssignMode('subjects')}
                onBulkAssignClasses={() => setBulkAssignMode('classes')}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
                onRowClick={handleRowClick}
                selectedStaffId={detailPanelStaff?.user_id}
              />
            </Box>
            {detailPanelStaff && (
              <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0, position: 'relative' }}>
                <ArrowHint
                  show={tourStep === 'panel'}
                  label="🚀 2. The overview panel updates automatically with the selected staff member's information."
                  direction="down-left"
                  mode="timed"
                  delay="0.2s"
                  maxWidth={260}
                  position={{ position: 'absolute', top: -56, right: 8, zIndex: 20 }}
                />
                <TeacherOverviewPanel
                  staffRow={detailPanelStaff}
                  onClose={() => setDetailPanelStaff(null)}
                  onEdit={(s) => {
                    setSelectedStaff(s);
                    handleEditStaff();
                  }}
                  onSendMessage={() => notify.info('Messaging from here is coming soon')}
                  onImpersonate={(s) => confirmImpersonateStaff(s)}
                  onUpdatePhoto={(s) => {
                    setSelectedStaff(s);
                    setPhotoPreview(s?.user?.avatar || null);
                    setPhotoFile(null);
                    setUpdatePhotoOpen(true);
                  }}
                  onResetPassword={(s) => {
                    setSelectedStaff(s);
                    setResetPasswordOpen(true);
                  }}
                  onUpdateStatus={(s) => {
                    setSelectedStaff(s);
                    setStatusModalOpen(true);
                  }}
                  onDelete={(s) => {
                    setSelectedStaff(s);
                    setDeleteModalOpen(true);
                  }}
                />
              </Box>
            )}
          </Stack>
        )}

        {activeTab === 'non-teaching' && (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <ArrowHint
                show={tourStep === 'row' && staff.length > 0}
                label="🚀 1. Click on a staff member's row — the row is highlighted to show it is selected."
                direction="down-left"
                mode="persistent"
                delay="0.3s"
                maxWidth={240}
                position={{ position: 'absolute', top: 70, right: 24, zIndex: 20 }}
              />
              <NonTeachingStaffTab
                loading={loading}
                staff={staff}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                totalCount={stats.nonTeaching}
                activeCount={stats.activeNonTeaching}
                inactiveCount={stats.inactiveNonTeaching}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                roleOptions={roleOptions}
                onResetFilters={handleResetFilters}
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
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onBulkActivate={() => setBulkActivateConfirmOpen(true)}
                onBulkDeactivate={() => setBulkDeactivateConfirmOpen(true)}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
                onRowClick={handleRowClick}
                selectedStaffId={detailPanelStaff?.user_id}
              />
            </Box>
            {detailPanelStaff && (
              <Box sx={{ width: { xs: '100%', lg: 380 }, flexShrink: 0, position: 'relative' }}>
                <ArrowHint
                  show={tourStep === 'panel'}
                  label="🚀 2. The overview panel updates automatically with the selected staff member's information."
                  direction="down-left"
                  mode="timed"
                  delay="0.2s"
                  maxWidth={260}
                  position={{ position: 'absolute', top: -56, right: 8, zIndex: 20 }}
                />
                <TeacherOverviewPanel
                  staffRow={detailPanelStaff}
                  onClose={() => setDetailPanelStaff(null)}
                  onEdit={(s) => {
                    setSelectedStaff(s);
                    handleEditStaff();
                  }}
                  onSendMessage={() => notify.info('Messaging from here is coming soon')}
                  onImpersonate={(s) => confirmImpersonateStaff(s)}
                  onUpdatePhoto={(s) => {
                    setSelectedStaff(s);
                    setPhotoPreview(s?.user?.avatar || null);
                    setPhotoFile(null);
                    setUpdatePhotoOpen(true);
                  }}
                  onResetPassword={(s) => {
                    setSelectedStaff(s);
                    setResetPasswordOpen(true);
                  }}
                  onUpdateStatus={(s) => {
                    setSelectedStaff(s);
                    setStatusModalOpen(true);
                  }}
                  onDelete={(s) => {
                    setSelectedStaff(s);
                    setDeleteModalOpen(true);
                  }}
                />
              </Box>
            )}
          </Stack>
        )}
      </Box>

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
          <IconUser size={18} color="#2563EB" style={{ marginRight: 8 }} />
          Login As Staff
        </MenuItem>
        <MenuItem onClick={handleEditStaff}>
          <IconEdit size={18} color="#7C3AED" style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenUpdatePhoto}>
          <IconCamera size={18} color="#0D9488" style={{ marginRight: 8 }} />
          Update Photo
        </MenuItem>
        <MenuItem onClick={handleOpenResetPassword}>
          <IconKey size={18} color="#0891B2" style={{ marginRight: 8 }} />
          Reset Password
        </MenuItem>
        <MenuItem onClick={handleUpdateStatusClick}>
          <IconHistory size={18} color="#D97706" style={{ marginRight: 8 }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <IconTrash size={18} color="#DC2626" style={{ marginRight: 8 }} />
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
          Upload Filled Template
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
                    {selectedStaff.user?.user_id || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedStaff.staff_status || 'Active'}
                      color={getStatusColor(selectedStaff.staff_status)}
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
            size="small"
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
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => {
              setImpersonateConfirmOpen(false);
              setStaffToImpersonate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="small"
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

      <StaffStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        staff={selectedStaff}
        getStatusColor={getStatusColor}
        onStatusChanged={() => {
          fetchStaff();
          fetchStats();
        }}
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

      <Dialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>
            Reset the password for{' '}
            <strong>
              {selectedStaff?.user
                ? `${selectedStaff.user.fname} ${selectedStaff.user.lname}`
                : 'this staff member'}
            </strong>
            ?
          </Typography>
          <Alert severity="info">
            The password will be reset to their surname, lowercase:{' '}
            <strong>{selectedStaff?.user?.lname?.toLowerCase() || '—'}</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            onClick={() => setResetPasswordOpen(false)}
            disabled={resetPasswordLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmResetPassword}
            disabled={resetPasswordLoading}
            autoFocus
          >
            {resetPasswordLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={updatePhotoOpen}
        onClose={() => setUpdatePhotoOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Photo</DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}
          >
            <Avatar src={photoPreview || undefined} sx={{ width: 96, height: 96 }}>
              <IconUser size={40} />
            </Avatar>
            <Button component="label" variant="outlined" size="small">
              Choose Photo
              <input type="file" accept="image/*" hidden onChange={handlePhotoFileSelected} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            onClick={() => setUpdatePhotoOpen(false)}
            disabled={updatePhotoLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmUpdatePhoto}
            disabled={updatePhotoLoading || !photoFile}
            autoFocus
          >
            {updatePhotoLoading ? 'Uploading...' : 'Save Photo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Activate Confirmation */}
      <ConfirmationDialog
        open={bulkActivateConfirmOpen}
        onClose={() => setBulkActivateConfirmOpen(false)}
        onConfirm={() => runBulkStatusChange('active')}
        title="Activate Teachers"
        message={`Activate ${selectedIds.size} selected teacher(s)? They'll regain login access immediately.`}
        severity="info"
      />

      {/* Bulk Deactivate Confirmation */}
      <ConfirmationDialog
        open={bulkDeactivateConfirmOpen}
        onClose={() => setBulkDeactivateConfirmOpen(false)}
        onConfirm={() => runBulkStatusChange('inactive')}
        title="Deactivate Teachers"
        message={`Deactivate ${selectedIds.size} selected teacher(s)? They'll lose login access immediately.`}
        severity="warning"
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Teachers"
        message={`Delete ${selectedIds.size} selected teacher(s)? This action cannot be undone.`}
        severity="error"
      />

      {/* Bulk Assign Subjects/Classes */}
      <BulkAssignModal
        open={Boolean(bulkAssignMode)}
        mode={bulkAssignMode}
        onClose={() => setBulkAssignMode(null)}
        teachers={staff.filter((s) => selectedIds.has(s.user_id))}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
        onSuccess={() => {
          setSelectedIds(new Set());
          fetchStaff();
          fetchStats();
        }}
      />
    </PageContainer>
  );
};

export default StaffManager;
