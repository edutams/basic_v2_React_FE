import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Button,
  Paper,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import AddTeacherModal from './AddTeacherModal';
import useNotification from 'src/hooks/useNotification';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  downloadTeacherTemplate,
  uploadTeachers,
} from '../../../context/TenantContext/services/tenant.service';

const UploadTeachersTab = ({ onSaveAndContinue, onTeacherAdded }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, teacher: null });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      await downloadTeacherTemplate();

      setNotification({
        open: true,
        message: 'Learner upload template downloaded. Fill and upload to continue.',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to download template',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      const result = await uploadTeachers(file);

      fetchTeachers(page, rowsPerPage, searchTerm);

      const { inserted, skipped, logs } = result.data || {};

      let message = result.message;

      const failedCount = logs?.filter((l) => l.status === 'failed').length || 0;

      if (failedCount > 0) {
        message += ` (${failedCount} failed)`;
      }

      setNotification({
        open: true,
        message,
        severity: failedCount > 0 ? 'warning' : 'success',
      });
    } catch (err) {
      console.error('Error uploading teachers:', err);

      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to upload teachers',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchTeachers = async (pageNum = 0, perPage = 10, search = '') => {
    setTeachersLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum + 1,
        per_page: perPage,
        search: search,
      };
      const response = await getAllStaff(params);

      const transformedTeachers = (response.data || []).map((teacher) => ({
        id: teacher.id,
        staff_id: teacher.staff_id || teacher.user?.user_id,
        surname: teacher.user?.lname || '',
        first_name: teacher.user?.fname || '',
        phone: teacher.user?.phone || '',
        gender: teacher.user?.sex || '',
        email: teacher.user?.email || '',
        arm: teacher.classArm?.arm_name || teacher.staff_type || 'General',
        user_id: teacher.user_id,
        class_arm_id: teacher.class_arm_id,
        class_id: teacher.class_id || '',
        staff_type: teacher.staff_type || 'teaching',
      }));

      setTeachers(transformedTeachers);
      onTeacherAdded?.();
      setTotalTeachers(response.total || 0);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(page, rowsPerPage, searchTerm);
  }, []);

  const handleMenuOpen = (event, teacher) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeacher(teacher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeacher(null);
  };

  const handleAddNewTeacher = () => {
    setModalMode('create');
    setSelectedTeacher(null);
    setModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    handleMenuClose();
    const initialValues = {
      id: teacher.id,
      staff_id: teacher.staff_id || '',
      surname: teacher.surname || '',
      first_name: teacher.first_name || '',
      phone_number: teacher.phone || '',
      gender: teacher.gender
        ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)
        : '',
      email: teacher.email || '',
      is_class_teacher: !!teacher.class_arm_id,
      class_id: teacher.class_id || '',
      class_arm_id: teacher.class_arm_id || '',
      staff_type:
        teacher.staff_type === 'non-teaching'
          ? 'Non-Teaching'
          : teacher.staff_type === 'teaching'
            ? 'Teaching'
            : teacher.staff_type,
      middle_name: teacher.user?.mname || '',
    };
    setSelectedTeacher({ ...teacher, initialValues });

    setModalMode('edit');
    setModalOpen(true);
  };

  const handleUpdateTeacher = async (values) => {
    try {
      setIsLoading(true);

      await updateStaff(values.id, {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: values.middle_name,
        email: values.email,
        phone: values.phone_number,
        gender: values.gender,
        staff_type: values.staff_type,
        class_arm_id: values.class_arm_id,
        userId: values.staff_id,
      });

      setNotification({
        open: true,
        message: 'Staff updated successfully',
        severity: 'success',
      });

      setModalOpen(false);

      fetchTeachers(page, rowsPerPage, searchTerm);
      onTeacherAdded?.();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to update staff',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    const teacher = confirmDialog.teacher;
    setConfirmDialog({ open: false, teacher: null });
    handleMenuClose();
    try {
      setIsLoading(true);
      await deleteStaff(teacher.id);

      setNotification({
        open: true,
        message: 'Staff deleted successfully',
        severity: 'success',
      });

      // Refresh the list after deletion
      fetchTeachers(page, rowsPerPage, searchTerm);
      // Call the callback function to notify parent component
      onTeacherAdded?.();
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to delete teacher',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (teacher) => {
    setConfirmDialog({
      open: true,
      teacher,
    });
  };

  const handleConfirmClose = () => {
    setConfirmDialog({ open: false, teacher: null });
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (teacher) =>
        teacher.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [teachers, searchTerm]);

  const paginatedTeachers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTeachers.slice(start, start + rowsPerPage);
  }, [filteredTeachers, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchTeachers(newPage, rowsPerPage, searchTerm);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchTeachers(0, newRowsPerPage, searchTerm);
  };

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchTeachers(0, rowsPerPage, value);
  };

  const columns = [
    { id: 'staff_id', label: 'Staff ID' },
    { id: 'surname', label: 'Surname' },
    { id: 'first_name', label: 'First Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'gender', label: 'Gender' },
    { id: 'email', label: 'Email' },
    { id: 'staff_type', label: 'Staff Type' },
  ];

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={handleSearch}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8, color: theme.palette.text.disabled }} />,
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
          >
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewTeacher}>
            Add New Teacher
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.id} sx={{ fontWeight: 600 }}>
                    {column.label}
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {teachersLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedTeachers.length > 0 ? (
                paginatedTeachers.map((teacher, index) => (
                  <TableRow key={teacher.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{teacher.staff_id}</TableCell>
                    <TableCell>{teacher.surname}</TableCell>
                    <TableCell>{teacher.first_name}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>{teacher.gender}</TableCell>
                    <TableCell sx={{ color: 'primary.main' }}>{teacher.email}</TableCell>
                    <TableCell>{teacher.arm}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, teacher)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedTeacher?.id === teacher.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleEditTeacher(teacher)}>
                          <IconEdit size={16} style={{ marginRight: 8 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleDeleteClick(teacher)}
                          sx={{ color: 'error.main' }}
                        >
                          <IconTrash size={16} style={{ marginRight: 8 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {error || 'No teachers found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalTeachers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue}>
          Save
        </Button>
      </Box>

      <AddTeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialValues={modalMode === 'edit' ? selectedTeacher?.initialValues : undefined}
        onSave={async (data) => {
          try {
            setIsLoading(true);
            if (modalMode === 'edit' && selectedTeacher) {
              // Update existing teacher
              await updateStaff(selectedTeacher.id, {
                first_name: data.first_name,
                last_name: data.surname,
                email: data.email,
                phone: data.phone_number,
                gender: data.gender,
                staff_type: data.staff_type || 'teaching',
                class_arm_id: data.is_class_teacher ? data.class_arm_id : null,
                userId: data.staff_id,
              });

              setNotification({
                open: true,
                message: 'Staff updated successfully',
                severity: 'success',
              });
            } else {
              // Create new teacher
              await createStaff({
                first_name: data.first_name,
                last_name: data.surname,
                middle_name: data.middle_name || '',
                email: data.email,
                phone: data.phone_number,
                gender: data.gender,
                staff_type: data.staff_type || 'teaching',
                is_class_teacher: data.is_class_teacher || false,
                class_arm_id: data.class_arm_id || null,
                userId: data.staff_id,
              });
              setNotification({
                open: true,
                message: 'Staff created successfully',
                severity: 'success',
              });
            }
            // Refresh the list after save
            fetchTeachers(page, rowsPerPage, searchTerm);
            setModalOpen(false);
          } catch (err) {
            // console.error('Error saving teacher:', err);
            setNotification({
              open: true,
              message: err.response?.data?.message || 'Failed to save teacher',
              severity: 'error',
            });
            setError(err.message || 'Failed to save teacher');
            throw err;
          } finally {
            setIsLoading(false);
          }
        }}
        className="General"
        isLoading={isLoading}
      />

      <Dialog open={confirmDialog.open} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Teacher</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{confirmDialog.teacher?.surname}{' '}
            {confirmDialog.teacher?.first_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteTeacher}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadTeachersTab;
