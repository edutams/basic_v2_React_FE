import React, { useState, useMemo, useEffect } from 'react';
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
import {
  getAllStaff,
  deleteStaff,
  createStaff,
} from '../../../context/TenantContext/services/tenant.service';

const UploadTeachersTab = ({ onSaveAndContinue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      setStaffLoading(true);
      try {
        const response = await getAllStaff();
        if (response.status && response.data) {
          // Transform API response to match component's expected format
          const transformedStaff = response.data.map((staff) => ({
            id: staff.id,
            staff_id: staff.user?.user_id || staff.staff_id,
            surname: staff.user?.lname || '',
            first_name: staff.user?.fname || '',
            phone: staff.user?.phone || '',
            gender: staff.user?.sex || '',
            email: staff.user?.email || '',
            class_arm_id: staff.class_arm_id,
            class_arm: staff.classArm?.arm_name || '',
            is_class_teacher: !!staff.class_arm_id,
            staff_type: staff.staff_type,
          }));
          setTeachers(transformedStaff);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
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
    setModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    console.log('Edit teacher:', teacher);
    handleMenuClose();
  };

  const handleDeleteTeacher = async (teacher) => {
    try {
      await deleteStaff(teacher.id);
      setTeachers(teachers.filter((t) => t.id !== teacher.id));
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
    handleMenuClose();
  };

  const handleSaveTeacher = async (values) => {
    setIsLoading(true);
    try {
      // Transform form values to match API expectations
      const staffData = {
        first_name: values.first_name,
        last_name: values.surname,
        middle_name: values.middle_name || '',
        phone: values.phone_number,
        userId: values.staff_id,
        gender: values.gender === 'Male' ? 'male' : 'female',
        email: values.email,
        staff_type: values.is_class_teacher ? 'teaching' : values.staff_type,
        is_class_teacher: values.is_class_teacher || false,
        class_arm_id: values.class_arm_id || null,
      };

      await createStaff(staffData);

      // Refresh the staff list
      const response = await getAllStaff();
      if (response.status && response.data) {
        const transformedStaff = response.data.map((staff) => ({
          id: staff.id,
          staff_id: staff.user?.user_id || staff.staff_id,
          surname: staff.user?.lname || '',
          first_name: staff.user?.fname || '',
          phone: staff.user?.phone || '',
          gender: staff.user?.sex || '',
          email: staff.user?.email || '',
          class_arm_id: staff.class_arm_id,
          class_arm: staff.classArm?.arm_name || '',
          is_class_teacher: !!staff.class_arm_id,
          staff_type: staff.staff_type,
        }));
        setTeachers(transformedStaff);
      }

      setModalOpen(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member');
    } finally {
      setIsLoading(false);
    }
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
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { id: 'staff_id', label: 'Staff ID' },
    { id: 'surname', label: 'Surname' },
    { id: 'first_name', label: 'First Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'gender', label: 'Gender' },
    { id: 'email', label: 'Email' },
    { id: 'arm', label: 'Arm' },
  ];

  return (
    <Box>
      {/* Header with Search and Action Buttons */}
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8, color: '#9e9e9e' }} />,
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                bgcolor: 'primary',
                color: '#fffff',
              },
            }}
          >
            Download Template
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                bgcolor: 'primary',
                color: '#fffff',
              },
            }}
          >
            Upload
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewTeacher}>
            Add New Teacher
          </Button>
        </Box>
      </Box>

      {/* Teachers Table */}
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
              {paginatedTeachers.length > 0 ? (
                paginatedTeachers.map((teacher, index) => (
                  <TableRow key={teacher.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{teacher.staff_id}</TableCell>
                    <TableCell>{teacher.surname}</TableCell>
                    <TableCell>{teacher.first_name}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>{teacher.gender}</TableCell>
                    <TableCell sx={{ color: '#1976d2' }}>{teacher.email}</TableCell>
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
                          onClick={() => handleDeleteTeacher(teacher)}
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
                      No teachers found
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
          count={filteredTeachers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Save & Continue Button */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue}>
          Save
        </Button>
      </Box>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTeacher}
        className="General"
        isLoading={isLoading}
      />
    </Box>
  );
};

export default UploadTeachersTab;
