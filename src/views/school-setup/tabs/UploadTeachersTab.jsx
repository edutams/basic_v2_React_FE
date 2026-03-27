import React from 'react';
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

const UploadTeachersTab = () => {
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
                >
                  <Button variant="outlined" size="small">
                    Add
                  </Button>
                </TableCell>

                {/* Upload Using Excel File */}
                <TableCell
                  sx={{
                    bgcolor: cellBg,
                    borderRadius: 2,
                  }}
                >
                  <Button variant="outlined" size="small">
                    Upload
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UploadTeachersTab;
