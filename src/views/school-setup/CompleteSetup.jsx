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
  IconDownload,
  IconUpload,
  IconRefresh,
} from '@tabler/icons-react';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
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
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }} mb={1}>
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
                                  borderColor: '#1976d2',
                                  borderWidth: '2px',
                                },
                              },
                            }}
                          />

                          <Button
                            variant="contained"
                            // sx={{
                            //   bgcolor: '#7CB518',
                            //   textTransform: 'none',
                            //   '&:hover': {
                            //     bgcolor: '#6aa314',
                            //   },
                            // }}
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
          </TableContainer>
        )}
        {activeTab === 1 && (
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

                          {/* <TextField size="small" fullWidth defaultValue={item} /> */}
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

                      {/* Arms column */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <TextField
                            size="small"
                            defaultValue="40"
                            sx={{
                              width: 80,
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Arm names */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'center', // horizontal center
                          alignItems: 'center',
                        }}
                      >
                        <Button
                          startIcon={<IconPlus size={18} />}
                          variant="contained"
                          sx={{
                            background: '#E9F0FF',
                            color: '#222',
                            boxShadow: 'none',
                            textTransform: 'none',
                          }}
                        >
                          Add New Learner
                        </Button>
                      </TableCell>

                      {/* Arms column */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Button
                            startIcon={<IconDownload size={18} />}
                            variant="outlined"
                            sx={{
                              textTransform: 'none',
                            }}
                          >
                            Download Template
                          </Button>

                          <Button
                            startIcon={<IconUpload size={18} />}
                            variant="contained"
                            // sx={{
                            //   bgcolor: '#7CB518',
                            //   textTransform: 'none',
                            //   '&:hover': {
                            //     bgcolor: '#6aa314',
                            //   },
                            // }}
                          >
                            Upload Template
                          </Button>
                        </Box>
                      </TableCell>

                      {/* <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                        }}
                      >
                      
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {activeTab === 2 && (
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

                          {/* <TextField size="small" fullWidth defaultValue={item} /> */}
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

                      {/* Arms column */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <TextField
                            size="small"
                            defaultValue="40"
                            sx={{
                              width: 80,
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Arm names */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'center', // horizontal center
                          alignItems: 'center',
                        }}
                      >
                        <Button
                          startIcon={<IconPlus size={18} />}
                          variant="contained"
                          sx={{
                            background: '#E9F0FF',
                            color: '#222',
                            boxShadow: 'none',
                            textTransform: 'none',
                          }}
                        >
                          Add New Teacher
                        </Button>
                      </TableCell>

                      {/* Arms column */}
                      <TableCell
                        sx={{
                          bgcolor: cellBg,
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Button
                            startIcon={<IconDownload size={18} />}
                            variant="outlined"
                            sx={{
                              textTransform: 'none',
                            }}
                          >
                            Download Template
                          </Button>

                          <Button
                            startIcon={<IconUpload size={18} />}
                            variant="contained"
                            // sx={{
                            //   bgcolor: '#7CB518',
                            //   textTransform: 'none',
                            //   '&:hover': {
                            //     bgcolor: '#6aa314',
                            //   },
                            // }}
                          >
                            Upload Template
                          </Button>
                        </Box>
                      </TableCell>

                      {/* <TableCell
                       sx={{
                         bgcolor: cellBg,
                         borderRadius: 2,
                       }}
                     >
                     
                     </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {activeTab === 3 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* LEFT COLUMN — Academic Terms */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Academic Terms</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => onPackageAction('create')}
                      >
                        Add Term
                      </Button>
                    </Box>
                  }
                >
                  <Paper variant="outlined">
                    {/* Table */}
                    <TableContainer>
                      <Table sx={{ whiteSpace: 'nowrap' }}>
                        <TableHead>
                          <TableRow>
                            {/* <TableRow sx={{ bgcolor: '#e5e7eb' }}> */}
                            <TableCell />
                            <TableCell sx={{ fontWeight: 'bold' }}>Term</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {[
                            {
                              term: 'First Term',
                              start: '2026-01-12',
                              end: '2026-03-21',
                              active: true,
                            },
                            {
                              term: 'Second Term',
                              start: '2026-01-12',
                              end: '2026-03-21',
                              active: false,
                            },
                            {
                              term: 'Third Term',
                              start: '2026-01-12',
                              end: '2026-03-21',
                              active: false,
                            },
                          ].map((item, i) => (
                            <TableRow key={i} hover>
                              {/* Active selector */}
                              <TableCell>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    border: '2px solid #cbd5e1',
                                    bgcolor: item.active ? '#2e7d32' : '#fff',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: 14,
                                  }}
                                >
                                  {item.active && '✓'}
                                </Box>
                              </TableCell>

                              <TableCell sx={{ fontWeight: 500 }}>{item.term}</TableCell>

                              <TableCell>{item.start}</TableCell>

                              <TableCell>{item.end}</TableCell>

                              <TableCell align="center">
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.4,
                                    borderRadius: '999px',
                                    bgcolor: item.active ? '#2e7d32' : '#f97316',
                                    color: '#fff',
                                    display: 'inline-block',
                                    fontSize: 13,
                                    fontWeight: 500,
                                  }}
                                >
                                  {item.active ? 'Active' : 'inactive'}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>
              </Grid>

              {/* RIGHT COLUMN — Generate Week */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Generate Week</Typography>
                      <Box
                        sx={{
                          border: '1px solid #7CB518',
                          px: 2,
                          py: 0.5,
                          borderRadius: '999px',
                          fontSize: 13,
                          color: '#7CB518',
                          fontWeight: 500,
                        }}
                      >
                        13 Weeks · 65 school days
                      </Box>
                    </Box>
                  }
                >
                  {/* Controls */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      size="small"
                      label="No. of Weeks"
                      defaultValue="2"
                      sx={{ width: 140 }}
                    />

                    <TextField
                      size="small"
                      label="Start Date"
                      placeholder="DD/MM/YYYY"
                      sx={{ width: 180 }}
                    />

                    {/* <Button
                      variant="contained"
                      startIcon={<IconRefresh size={18} />}
                      sx={{
                        bgcolor: '#7CB518',
                        textTransform: 'none',
                        height: 40, 
                      }}
                    >
                      Generate Week
                    </Button> */}

                    <Button
                      variant="contained"
                      startIcon={<IconRefresh size={15} />}
                      onClick={() => onPackageAction('create')}
                      sx={{ height: 40 }}
                    >
                      Generate
                    </Button>
                  </Box>

                  {/* Week Table */}
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table sx={{ whiteSpace: 'nowrap' }}>
                        <TableHead>
                          <TableRow>
                            {/* <TableRow sx={{ bgcolor: '#d4d4d8' }}> */}
                            <TableCell sx={{ fontWeight: 600 }}>Week</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {[1, 2, 3, 4, 5, 6, 7].map((week) => (
                            <TableRow key={week} hover>
                              <TableCell>{week}</TableCell>

                              <TableCell>2026-03-20</TableCell>

                              <TableCell>2026-06-20</TableCell>

                              <TableCell>
                                <Box
                                  sx={{
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '999px',
                                    border: '1px solid #6b8e23',
                                    color: '#6b8e23',
                                    display: 'inline-block',
                                    fontSize: 13,
                                    fontWeight: 500,
                                  }}
                                >
                                  Completed
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>
              </Grid>
            </Grid>
          </Box>
        )}
      </ParentCard>
      {/* </Card> */}
    </Box>
  );
};

export default CompleteSetup;
