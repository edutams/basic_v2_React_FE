import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TextField,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';
import { getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';
import AddTeacherModal from './AddTeacherModal';

const UploadTeachersTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');

  const handleAddNewTeacher = (className) => {
    setSelectedClass(className);
    setModalOpen(true);
  };

  const handleSaveTeacher = (data) => {
    console.log('Saving teacher:', { ...data, class_name: selectedClass });
    // TODO: Call API to save teacher
  };

  // Fetch active classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClassesWithDivisions();
        // Filter only active classes
        const activeClasses = (data || [])
          .filter((cls) => cls.status === 'active')
          .map((cls) => cls.class_name);
        setClasses(activeClasses);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = () => {
    setHasChanges(true);
  };

  // Filter classes by search term
  const filteredClasses = useMemo(() => {
    return classes.filter((className) =>
      className.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [classes, searchTerm]);

  // Paginate the filtered data
  const paginatedClasses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredClasses.slice(start, start + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Search classes..."
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
      </Box>

      <TableContainer>
        <Table
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '12px 10px',
          }}
        >
          {/* Header */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Classes</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '15%' }}>No. Uploaded</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '20%' }}>Upload Using Forms</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Upload Using Excel File </TableCell>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {paginatedClasses.map((item, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted ? '#fbe4e4' : '#f6f7f9';

              return (
                <TableRow key={index}>
                  {/* Classes + cancel icon together */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onMouseEnter={() => setIconHovered(index)}
                        onMouseLeave={() => setIconHovered(null)}
                        onClick={() => setIconClicked(iconClicked === index ? null : index)}
                      >
                        ✕
                      </IconButton>

                      <TextField
                        size="small"
                        defaultValue={item}
                        onChange={handleChange}
                        sx={{
                          // width: 70,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '8px',

                            '& fieldset': {
                              borderColor: '#e5e7eb',
                            },

                            '&:hover fieldset': {
                              borderColor: '#cbd5e1',
                            },

                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  {/* No. Uploaded */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <TextField
                      size="small"
                      defaultValue="0"
                      sx={{
                        width: 70,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          borderRadius: '8px',

                          '& fieldset': {
                            borderColor: '#e5e7eb',
                          },

                          '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                          },

                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />
                  </TableCell>

                  {/* Upload Using Forms */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddNewTeacher(item)}
                      sx={{
                        bgcolor: '#EDF3FF',
                        color: '#000000',
                      }}
                    >
                      Add Teacher
                    </Button>
                  </TableCell>

                  {/* Upload Using Excel File */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                    }}
                    align="center"
                  >
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button variant="outlined" size="small" startIcon={<span>↓</span>}>
                        Download Template
                      </Button>
                      <Button variant="contained" size="small" startIcon={<span>↑</span>}>
                        Upload Template
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {/* Footer with Pagination */}
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filteredClasses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box>

      <AddTeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTeacher}
        className={selectedClass}
      />
    </Box>
  );
};

export default UploadTeachersTab;
