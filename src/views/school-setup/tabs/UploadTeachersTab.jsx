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
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';

const UploadTeachersTab = ({ onSaveAndContinue }) => {
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

            <TableCell sx={{ fontWeight: 600 }}>No. Uploaded</TableCell>

            <TableCell sx={{ fontWeight: 600 }}>Upload Using Forms</TableCell>

            <TableCell sx={{ fontWeight: 600 }}>Upload Using Excel File </TableCell>
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
                      defaultValue={item}
                      onChange={handleChange}
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
                  </Box>
                </TableCell>

                {/* No. Uploaded */}
                <TableCell
                  sx={{
                    bgcolor: cellBg,
                    borderRadius: 2,
                  }}
                  align="center"
                >
                  <TextField
                    size="small"
                    defaultValue="8"
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
                  }}
                  align="center"
                >
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: '#EDF3FF',
                      color: '#000000',
                    }}
                  >
                    Add New Teacher
                  </Button>
                </TableCell>

                {/* Upload Using Excel File */}
                <TableCell
                  sx={{
                    bgcolor: cellBg,
                    borderRadius: 2,
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
      </Table>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onSaveAndContinue} disabled={!hasChanges}>
          Save & Continue
        </Button>
      </Box>
    </TableContainer>
  );
};

export default UploadTeachersTab;
