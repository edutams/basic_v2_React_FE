import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  Select,
  MenuItem,
  IconButton,
  useTheme,
} from '@mui/material';
import { IconSchool, IconUsers, IconLayoutDashboard, IconX } from '@tabler/icons-react';
import ReusableModal from 'src/components/shared/ReusableModal';
import Chart from 'react-apexcharts';

const SchoolsOverviewModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [year, setYear] = useState(2026);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // === DUMMY DATA FOR CHART WITH NAMES ===
  const chartOptions = {
    chart: {
      id: 'schools-overview',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      zoom: { enabled: false },
      background: 'transparent',
    },
    xaxis: {
      categories: [
        'Adejoke Famakinwa',
        'Adejumoke Joy',
        'Habbeb Adejumobi',
        'Gorge Adetunmobi',
        'Iremide Johnson',
        'Frank Oluwajomoloju',
        'Grace Blessing',
        'Hannah Wisdom',
        'Ivy Ademola',
        'Ayomikun Ridiwan',
      ],
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
        },
      },
      axisBorder: { show: true, color: theme.palette.mode === 'dark' ? '#444' : '#eee' },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: 'Number of Schools',
        style: { colors: theme.palette.mode === 'dark' ? '#fff' : '#333' },
      },
    },
    dataLabels: { enabled: false },
    colors: [theme.palette.primary.main],
    grid: { borderColor: theme.palette.mode === 'dark' ? '#444' : '#eee' },
    theme: { mode: theme.palette.mode },
  };

  const chartSeries = [
    {
      name: 'Schools',
      data: [12, 19, 23, 30, 15, 28, 20, 25, 32, 18],
    },
  ];

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      size="extraLarge"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Total School
        </Typography>
      }
    >
      <Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3}>
          <Paper
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              width: { xs: '100%', sm: 320 },
              background: '#FFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
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

            <Box>
              <Typography fontSize={26} fontWeight={700}>
                700
              </Typography>
              <Typography fontSize={14} color="#6B7280">
                Total School
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              width: { xs: '100%', sm: 320 },
              background: '#FFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#FDE4E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconSchool size={22} color="#EF4444" />
            </Box>

            <Stack spacing={0.5} width="100%">
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Primary Sch -</Typography>
                <Typography variant="h5">34</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Senior Sec -</Typography>
                <Typography variant="h5">34</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          {/* TABS */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, minHeight: 42 }}
          >
            <Tab
              value={0}
              icon={<IconLayoutDashboard size={18} />}
              iconPosition="start"
              label="Overview"
              sx={{ textTransform: 'none', minHeight: 42 }}
            />
            <Tab
              value={1}
              icon={<IconUsers size={18} />}
              iconPosition="start"
              label="Agent Performance"
              sx={{ textTransform: 'none', minHeight: 42 }}
            />
          </Tabs>

          {/* TAB CONTENT */}
          {tab === 0 && (
            <Paper
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #eee',
                background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
              }}
            >
              {/* Header with Year Selector */}
              <Box
                sx={{
                  background: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9F9F9',
                  px: 3,
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box />
                <Stack direction="row" alignItems="center">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border:
                        theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      borderRadius: '0 !important',
                      overflow: 'hidden',
                    }}
                  >
                    {/* <Box
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#E7FAFF',
                        px: 2,
                        py: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        borderRight:
                          theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      }}
                    >
                      <Typography
                        fontSize={14}
                        sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                      >
                        Year
                      </Typography>
                    </Box> */}

                    <Select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      size="small"
                      variant="standard"
                      disableUnderline
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#333' : '#F5F5F5',
                        px: 1.2,
                        minWidth: 70,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        '& .MuiSelect-select': {
                          padding: '6px 20px 6px 6px !important',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                    >
                      <MenuItem value={2024}>Year 2024</MenuItem>
                      <MenuItem value={2025}>Year 2025</MenuItem>
                      <MenuItem value={2026}>Year 2026</MenuItem>
                    </Select>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 3,
                  background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                  height: 350,
                }}
              >
                <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
              </Box>
            </Paper>
          )}

          {tab === 1 && (
            <Paper
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #eee',
                background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
              }}
            >
              {/* Header with Year Selector */}
              <Box
                sx={{
                  background: theme.palette.mode === 'dark' ? '#2d2d2d' : '#F9F9F9',
                  px: 3,
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* Left side can be empty or title */}
                <Box />

                {/* Right side controls */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {/* Agent Selector */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border:
                        theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      borderRadius: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {/* <Box
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#E7FAFF',
                        px: 2,
                        py: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        borderRight:
                          theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      }}
                    >
                      <Typography
                        fontSize={14}
                        sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                      >
                        Agent
                      </Typography>
                    </Box> */}

                    <Select
                      value={'agent1'}
                      onChange={(e) => console.log('Selected agent:', e.target.value)}
                      size="small"
                      variant="standard"
                      disableUnderline
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#333' : '#F5F5F5',
                        px: 1.5,
                        py: 0.5,
                        fontSize: 14,
                        minWidth: 120,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        '& .MuiSelect-select': { paddingRight: '20px !important' },
                      }}
                    >
                      <MenuItem value="agent1">Agent 1</MenuItem>
                      <MenuItem value="agent2">Agent 2</MenuItem>
                      <MenuItem value="agent3">Agent 3</MenuItem>
                    </Select>
                  </Box>

                  {/* Year Selector */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border:
                        theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      borderRadius: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {/* <Box
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#E7FAFF',
                        px: 2,
                        py: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        borderRight:
                          theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #dcdcdc',
                      }}
                    >
                      <Typography
                        fontSize={14}
                        sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#333' }}
                      >
                        Year
                      </Typography>
                    </Box> */}

                    <Select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      size="small"
                      variant="standard"
                      disableUnderline
                      sx={{
                        background: theme.palette.mode === 'dark' ? '#333' : '#F5F5F5',
                        px: 1.5,
                        py: 0.5,
                        fontSize: 14,
                        minWidth: 70,
                        color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        '& .MuiSelect-select': { paddingRight: '20px !important' },
                      }}
                    >
                      <MenuItem value={2024}>Year 2024</MenuItem>
                      <MenuItem value={2025}>Year 2025</MenuItem>
                      <MenuItem value={2026}>Year 2026</MenuItem>
                    </Select>
                  </Box>

                  {/* Filter Button */}
                  <Box>
                    <button
                      style={{
                        backgroundColor: [theme.palette.primary.main],
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                      onClick={() => console.log('Filter applied')}
                    >
                      Filter
                    </button>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 3,
                  background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
                  height: 350,
                }}
              >
                <Chart
                  options={{
                    chart: {
                      id: 'agent-performance',
                      toolbar: {
                        show: true,
                        tools: {
                          download: true,
                          selection: false,
                          zoom: false,
                          zoomin: false,
                          zoomout: false,
                          pan: false,
                          reset: false,
                        },
                      },
                      zoom: { enabled: false },
                    },
                    xaxis: {
                      categories: [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                      ],
                      labels: {
                        style: {
                          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        },
                      },
                      axisBorder: {
                        show: true,
                        color: theme.palette.mode === 'dark' ? '#444' : '#eee',
                      },
                    },
                    yaxis: {
                      title: {
                        text: 'Number of Schools',
                        style: { colors: theme.palette.mode === 'dark' ? '#fff' : '#333' },
                      },
                      labels: {
                        style: {
                          colors: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        },
                      },
                    },
                    dataLabels: { enabled: false },
                    colors: [theme.palette.primary.main],
                    grid: { borderColor: theme.palette.mode === 'dark' ? '#444' : '#eee' },
                    theme: { mode: theme.palette.mode },
                  }}
                  series={[
                    { name: 'Agent 1', data: [12, 19, 23, 30, 15, 28, 20, 25, 32, 18, 22, 27] },
                    //   { name: 'Agent 2', data: [8, 17, 19, 25, 12, 20, 15, 22, 28, 14, 18, 21] },
                  ]}
                  type="bar"
                  height={300}
                />
              </Box>
            </Paper>
          )}
        </Paper>
      </Box>
    </ReusableModal>
  );
};

export default SchoolsOverviewModal;
