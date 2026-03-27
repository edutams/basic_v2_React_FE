import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import { IconDotsVertical } from '@tabler/icons-react';

const SetUpClassesTab = ({ onSaveAndContinue }) => {
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = () => {
    setHasChanges(true);
  };
  return (
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
          {['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'].map((item, index) => {
            const highlight = item === 'JSS 3';
            const cellBg = highlight ? '#fbe4e4' : '#f6f7f9';

            return (
              <TableRow key={index}>
                {/* Classes + cancel icon together */}
                <TableCell
                  sx={{
                    bgcolor: cellBg,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <IconButton size="small" color="error">
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
                  }}
                >
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      defaultValue={item}
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
      </Table>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box>
    </TableContainer>
  );
};

export default SetUpClassesTab;
