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

const SetUpClassesTab = ({ onSaveAndContinue, onClassArmsAdded }) => {
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

  const fetchClasses = async () => {
    try {
      const data = await getClassesWithDivisions();
      const flatClasses = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flatClasses.push({
              ...cls,
              unique_key: `${programme.id}_${cls.id}`,
              programme_id: programme.id,
              programme_code: programme.programme_code,
              division_name: division.division_name,
              programme_class_id: cls.pivot?.id ?? null,
              no_of_arms: cls.class_arms?.length || 0,
              arm_names: cls.class_arms?.map((a) => a.arm_names) || [],
              arms: cls.arms || [],
              status: cls.status || 'active',
            });
          });
        });
      });
      setClasses(flatClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClasses().finally(() => setLoading(false));
  }, []);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const classesData = classes.map((cls) => ({
        class_id: cls.id,
        programme_id: cls.programme_id,
        program_class_id: cls.programme_class_id,
        class_name: cls.class_name,
        status: cls.status,
        no_of_arms: cls.no_of_arms || 0,
        arm_names: cls.arm_names || [],
      }));

      await saveClasses(classesData);
      await fetchClasses();
      setHasChanges(false);

      onClassArmsAdded?.();
      setNotification({ open: true, message: 'Classes saved successfully!', severity: 'success' });
      if (onSaveAndContinue) onSaveAndContinue();
    } catch (error) {
      console.error('Failed to save classes:', error);
      alert('Failed to save classes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleToggleClassStatus = (uniqueKey) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          const newStatus = cls.status === 'active' ? 'inactive' : 'active';
          return { ...cls, status: newStatus };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleNoOfArmsChange = (uniqueKey, value) => {
    const numArms = parseInt(value) || 0;
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          return { ...cls, no_of_arms: numArms };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleGenerateArms = (uniqueKey) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
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

  const handleArmNameChange = (uniqueKey, armIndex, value) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          const newArmNames = [...cls.arm_names];
          newArmNames[armIndex] = value;
          return { ...cls, arm_names: newArmNames };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const className = classItem.class_name || '';
      return className.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [classes, searchTerm]);

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
      {/* <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
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
      </Box> */}

      <TableContainer>
        <Table
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '12px 10px',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>Classes</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '25%' }}>No. of Arms</TableCell>

              <TableCell sx={{ fontWeight: 600, width: '50%' }}>Class Arm Names</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedClasses.map((classItem, index) => {
              const isInactive = classItem.status === 'inactive';
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isInactive ? '#e0e0e0' : isHighlighted ? '#fbe4e4' : '#f6f7f9';
              const className = classItem.class_code || '';

              return (
                <TableRow key={classItem.unique_key || index}>
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
                        onClick={() => handleToggleClassStatus(classItem.unique_key)}
                      >
                        {isInactive ? '✓' : '✕'}
                      </IconButton>

                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        // defaultValue={classItem.class_code}
                        defaultValue={`${classItem.programme_code} - ${classItem.class_code}`}
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
                        onChange={(e) => handleNoOfArmsChange(classItem.unique_key, e.target.value)}
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
                        onClick={() => handleGenerateArms(classItem.unique_key)}
                      >
                        Generate
                      </Button>
                    </Box>
                  </TableCell>

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
                            onChange={(e) =>
                              handleArmNameChange(classItem.unique_key, i, e.target.value)
                            }
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
