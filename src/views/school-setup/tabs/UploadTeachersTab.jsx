import React, { useState, useMemo } from 'react';
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

const UploadTeachersTab = ({ onSaveAndContinue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock teacher data - in real app this would come from API
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      staff_id: 'TEA001',
      surname: 'Okafor',
      first_name: 'Chukwuemeka',
      phone: '08012345678',
      gender: 'Male',
      email: 'c.okafor@school.com',
      arm: 'Science',
    },
    {
      id: 2,
      staff_id: 'TEA002',
      surname: 'Adeyemi',
      first_name: 'Fatima',
      phone: '08023456789',
      gender: 'Female',
      email: 'f.adeyemi@school.com',
      arm: 'Arts',
    },
    {
      id: 3,
      staff_id: 'TEA003',
      surname: 'Ibrahim',
      first_name: 'Mohammed',
      phone: '08034567890',
      gender: 'Male',
      email: 'm.ibrahim@school.com',
      arm: 'Commercial',
    },
    {
      id: 4,
      staff_id: 'TEA004',
      surname: 'Okonkwo',
      first_name: 'Chioma',
      phone: '08045678901',
      gender: 'Female',
      email: 'c.okonkwo@school.com',
      arm: 'Science',
    },
    {
      id: 5,
      staff_id: 'TEA005',
      surname: 'Williams',
      first_name: 'John',
      phone: '08056789012',
      gender: 'Male',
      email: 'j.williams@school.com',
      arm: 'Science',
    },
  ]);

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

  const handleSaveTeacher = (data) => {
    // Add new teacher to the list
    const newTeacher = {
      id: teachers.length + 1,
      staff_id: `TEA${String(teachers.length + 1).padStart(3, '0')}`,
      surname: data.surname,
      first_name: data.first_name,
      phone: data.phone,
      gender: data.gender,
      email: data.email,
      arm: data.arm || 'General',
    };
    setTeachers([...teachers, newTeacher]);
  };

  const handleEditTeacher = (teacher) => {
    console.log('Edit teacher:', teacher);
    handleMenuClose();
  };

  const handleDeleteTeacher = (teacher) => {
    // Remove teacher from the list
    setTeachers(teachers.filter((t) => t.id !== teacher.id));
    handleMenuClose();
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
