import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';

const SetUpClassesTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sample data - in real app this would come from API
  const allClasses = [
    'JSS 1',
    'JSS 2',
    'JSS 3',
    'SSS 1',
    'SSS 2',
    'SSS 3',
    'Primary 1',
    'Primary 2',
    'Primary 3',
    'Primary 4',
    'Primary 5',
    'Primary 6',
  ];

  const handleChange = () => {
    setHasChanges(true);
  };

  // Filter classes by search term
  const filteredClasses = useMemo(() => {
    return allClasses.filter((className) =>
      className.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allClasses, searchTerm]);

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
            {paginatedClasses.map((item, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted ? '#fbe4e4' : '#f6f7f9';

              return (
                <TableRow key={index}>
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
                        defaultValue={item}
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
                        defaultValue={5}
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

                      <Button variant="contained">Generate</Button>
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
                      {['Alpha', 'Beta', 'Arm 3', 'Arm 4', 'Arm 5'].map((arm, i) => (
                        <TextField
                          key={i}
                          size="small"
                          defaultValue={arm}
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
                      ))}
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
    </Box>
  );
};

export default SetUpClassesTab;
