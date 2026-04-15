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
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  getClassesWithDivisions,
  saveClasses,
} from '../../../context/TenantContext/services/tenant.service';

const SetUpClassesTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Default arm letters generator
  const generateDefaultArmNames = (count) => {
    const letters = [];
    for (let i = 0; i < count; i++) {
      // Generate A, B, C, ... Z, AA, AB, etc.
      let letter = '';
      let num = i;
      while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
      }
      letters.push(letter);
    }
    return letters;
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClassesWithDivisions();
        // Transform API data to include local state for arms
        const transformed = (data || []).map((cls) => ({
          ...cls,
          no_of_arms: cls.arms?.length || cls.no_of_arms || 0,
          arm_names: cls.arms?.map((a) => a.arm_name) || cls.arm_names || [],
          arms: cls.arms || [],
          status: cls.status || 'active',
        }));
        setClasses(transformed);
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

  const handleToggleClassStatus = (classId) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          const newStatus = cls.status === 'active' ? 'inactive' : 'active';
          return { ...cls, status: newStatus };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleNoOfArmsChange = (classId, value) => {
    const numArms = parseInt(value) || 0;
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          return { ...cls, no_of_arms: numArms };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleGenerateArms = (classId) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          const defaultArms = generateDefaultArmNames(cls.no_of_arms || 0);
          return { ...cls, arm_names: defaultArms };
        }
        return cls;
      }),
    );
    setHasChanges(true);
    setNotification({
      open: true,
      message: 'Class arm names generated successfully!',
      severity: 'success',
    });
  };

  const handleArmNameChange = (classId, armIndex, value) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          const newArmNames = [...cls.arm_names];
          newArmNames[armIndex] = value;
          return { ...cls, arm_names: newArmNames };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      // Transform classes data for API
      const classesData = classes.map((cls) => ({
        class_id: cls.id,
        class_name: cls.class_name,
        status: cls.status,
        no_of_arms: cls.no_of_arms || 0,
        arm_names: cls.arm_names || [],
      }));

      await saveClasses(classesData);

      // Check if any class was deactivated or reactivated
      const hasDeactivated = classes.some((cls) => cls.status === 'inactive');
      const hadActiveClasses = classes.some((cls) => cls.status === 'active');

      let message = 'Classes saved successfully!';
      if (hasDeactivated && hadActiveClasses) {
        message = 'Classes updated - some classes deactivated!';
      } else if (hasDeactivated) {
        message = 'Classes deactivated successfully!';
      } else if (hadActiveClasses) {
        message = 'Classes activated successfully!';
      }

      setNotification({ open: true, message, severity: 'success' });

      // Move to next tab
      if (onSaveAndContinue) {
        onSaveAndContinue();
      }
    } catch (error) {
      console.error('Failed to save classes:', error);
      alert('Failed to save classes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filter classes by search term
  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const className = classItem.class_name || '';
      return className.toLowerCase().includes(searchTerm.toLowerCase());
    });
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

              <TableCell sx={{ fontWeight: 600, width: '25%' }}>No. of Arms</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '50%' }}>Class Arm Names</TableCell>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {paginatedClasses.map((classItem, index) => {
              const isInactive = classItem.status === 'inactive';
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isInactive ? '#e0e0e0' : isHighlighted ? '#fbe4e4' : '#f6f7f9';
              const className = classItem.class_name || '';

              return (
                <TableRow key={classItem.id || index}>
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                      verticalAlign: 'top',
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
                        color={isInactive ? 'success' : 'error'}
                        onMouseEnter={() => setIconHovered(index)}
                        onMouseLeave={() => setIconHovered(null)}
                        onClick={() => handleToggleClassStatus(classItem.id)}
                      >
                        {isInactive ? '✓' : '✕'}
                      </IconButton>

                      <TextField
                        size="small"
                        fullWidth
                        disabled={isInactive}
                        defaultValue={className}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isInactive ? '#e0e0e0' : '#fff',
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

                  {/* Arms column */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                      verticalAlign: 'top',
                    }}
                  >
                    <Box
                      display="flex"
                      gap={1}
                      justifyContent="center"
                      alignItems="center"
                      width="100%"
                    >
                      <TextField
                        size="small"
                        type="number"
                        disabled={isInactive}
                        value={classItem.no_of_arms || 0}
                        onChange={(e) => handleNoOfArmsChange(classItem.id, e.target.value)}
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

                      <Button
                        variant="contained"
                        size="small"
                        disabled={isInactive}
                        onClick={() => handleGenerateArms(classItem.id)}
                      >
                        Generate
                      </Button>
                    </Box>
                  </TableCell>

                  {/* Arm names */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
                      verticalAlign: 'top',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {classItem.arm_names && classItem.arm_names.length > 0 ? (
                        classItem.arm_names.map((armName, i) => (
                          <TextField
                            key={i}
                            size="small"
                            disabled={isInactive}
                            value={armName}
                            onChange={(e) => handleArmNameChange(classItem.id, i, e.target.value)}
                            sx={{
                              width: 90,

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
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                          Click Generate to create arms
                        </Typography>
                      )}
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
        <Button
          variant="contained"
          onClick={handleSaveAndContinue}
          disabled={!hasChanges || saving}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default SetUpClassesTab;
