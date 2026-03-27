import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Avatar,
  TextField,
  Stack,
  Divider,
  MenuItem,
  Card,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  IconSchool,
  IconVideo,
  IconArrowRight,
  IconArrowLeft,
  IconUsers,
  IconBooks,
  IconCalendar,
  IconUserPlus,
  IconPlus,
  IconDotsVertical,
} from '@tabler/icons-react';
import ParentCard from 'src/components/shared/ParentCard';

const CompleteSetup = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize={20}>
            School Administration
          </Typography>

          <Typography fontSize={13} color="#8A8D91">
            Manage classes, learners, teachers and calendar
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13} fontWeight={500}>
            Complete your setup to proceed
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* ACADEMIC SESSION SETUP */}
      <Card sx={{ p: 0, mb: 1, borderRadius: 0 }}>
        {/* HEADER */}
        <Box sx={{ px: 3, py: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography fontWeight={600}>Class Details </Typography>
        </Box>

        {/* BODY */}
        <Box sx={{ px: 2, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3}>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  6
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Classes
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  16
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Arms
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  209
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Learners
                </Typography>
              </Box>
            </Paper>
            <Paper
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                width: { xs: '100%', sm: 320 },
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#E3E8F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={22} color="#3B5BDB" />
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography fontSize={26} fontWeight={700}>
                  36
                </Typography>
                <Typography fontSize={14} color="#6B7280">
                  Teachers
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Box>
      </Card>

      {/* TABS SECTION */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab
            icon={<IconBooks size={18} />}
            iconPosition="start"
            label="Set-Up Classes"
            onClick={() => setActiveTab(0)}
          />
          <Tab
            icon={<IconUserPlus size={18} />}
            iconPosition="start"
            label="Upload Learners"
            onClick={() => setActiveTab(1)}
          />
          <Tab
            icon={<IconUsers size={18} />}
            iconPosition="start"
            label="Upload Teachers"
            onClick={() => setActiveTab(2)}
          />
          <Tab
            icon={<IconCalendar size={18} />}
            iconPosition="start"
            label="Set Calendar"
            onClick={() => setActiveTab(3)}
          />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      <ParentCard sx={{ p: 0 }}>
        {activeTab === 0 && (
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

                          {/* <TextField size="small" fullWidth defaultValue={item} /> */}
                          <TextField
                            size="small"
                            fullWidth
                            defaultValue={item}
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
                                  borderColor: '#7CB518',
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
                          {/* <TextField size="small" defaultValue="2" sx={{ width: 70 }} /> */}
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
                                  borderColor: '#7CB518',
                                  borderWidth: '2px',
                                },
                              },
                            }}
                          />

                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: '#7CB518',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: '#6aa314',
                              },
                            }}
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
                                    borderColor: '#7CB518',
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
          </TableContainer>
        )}
        {activeTab === 1 && (
          <Typography sx={{ p: 2 }}>Upload Learners content goes here</Typography>
        )}
        {activeTab === 2 && (
          <Typography sx={{ p: 2 }}>Upload Teachers content goes here</Typography>
        )}
        {activeTab === 3 && <Typography sx={{ p: 2 }}>Set Calendar content goes here</Typography>}
      </ParentCard>
      {/* </Card> */}
    </Box>
  );
};

export default CompleteSetup;
