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
  CircularProgress,
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
  createStaff,
  deleteStaff,
} from '../../../context/TenantContext/services/tenant.service';

const UploadTeachersTab = ({ onSaveAndContinue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch teachers from API
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

      // Transform API response to match component structure
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
      }));

      setTeachers(transformedTeachers);
      setTotalTeachers(response.total || 0);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  // Initial fetch
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
    setModalOpen(true);
  };

  const handleEditTeacher = (teacher) => {
    console.log('Edit teacher:', teacher);
    handleMenuClose();
  };

  const handleDeleteTeacher = async (teacher) => {
    handleMenuClose();
    try {
      setIsLoading(true);
      await deleteStaff(teacher.id);
      // Refresh the list after deletion
      fetchTeachers(page, rowsPerPage, searchTerm);
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError(err.message || 'Failed to delete teacher');
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
    { id: 'arm', label: 'Arm' },
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
        onSave={async (data) => {
          try {
            setIsLoading(true);
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
            // Refresh the list after creating
            fetchTeachers(page, rowsPerPage, searchTerm);
            setModalOpen(false);
          } catch (err) {
            console.error('Error creating teacher:', err);
            setError(err.message || 'Failed to create teacher');
            throw err;
          } finally {
            setIsLoading(false);
          }
        }}
        className="General"
        isLoading={isLoading}
      />
    </Box>
  );
};

export default UploadTeachersTab;
