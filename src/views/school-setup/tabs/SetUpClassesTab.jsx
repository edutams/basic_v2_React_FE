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

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClassesWithDivisions();
        // Transform API data to include local state for arms
        const transformed = (data || []).map((cls) => ({
          ...cls,
          no_of_arms: cls.no_of_arms || 0,
          arm_names: cls.arm_names || [],
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
          const updatedArms = cls.arms.map((arm) => {
            const generated = generateDefaultArmNames(arm.no_of_arms || 0);
            return {
              ...arm,
              arm_names: JSON.stringify(generated),
            };
          });

          return { ...cls, arms: updatedArms };
        }
        return cls;
      }),
    );

    setHasChanges(true);
  };

  const handleArmNameChange = (classId, armIndex, nameIndex, value) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          const updatedArms = [...cls.arms];

          let parsed = [];
          try {
            parsed = JSON.parse(updatedArms[armIndex].arm_names);
          } catch {}

          parsed[nameIndex] = value;

          updatedArms[armIndex].arm_names = JSON.stringify(parsed);

          return { ...cls, arms: updatedArms };
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
        is_active: true,
        no_of_arms: cls.no_of_arms || 0,
        arm_names: cls.arm_names || [],
      }));

      await saveClasses(classesData);

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
              <TableCell sx={{ fontWeight: 600 }}>Classes</TableCell>

              <TableCell sx={{ fontWeight: 600 }}>No. of Arms</TableCell>

              <TableCell sx={{ fontWeight: 600 }}>Class Arm Names</TableCell>
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {paginatedClasses.map((classItem, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted ? '#fbe4e4' : '#f6f7f9';
              const className = classItem.class_name || '';

              return (
                <TableRow key={classItem.id || index}>
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
                        fullWidth
                        defaultValue={className}
                        onChange={handleChange}
                        sx={{
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

                  {/* Arms column */}
                  <TableCell
                    sx={{
                      bgcolor: cellBg,
                      borderRadius: 2,
                      p: 1,
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
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {classItem.arms && classItem.arms.length > 0 ? (
                        classItem.arms.map((arm, armIndex) => {
                          let parsedArmNames = [];

                          try {
                            parsedArmNames = JSON.parse(arm.arm_names);
                          } catch {
                            parsedArmNames = [];
                          }

                          return (
                            <Box key={arm.id || armIndex} sx={{ display: 'flex', gap: 1 }}>
                              {parsedArmNames.map((name, i) => (
                                <TextField
                                  key={i}
                                  size="small"
                                  value={name}
                                  onChange={(e) =>
                                    handleArmNameChange(classItem.id, armIndex, i, e.target.value)
                                  }
                                  sx={{ width: 90 }}
                                />
                              ))}
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                          No arms available
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
    </Box>
  );
};

export default SetUpClassesTab;
