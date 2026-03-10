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
} from '@mui/material';
import { IconSchool, IconUsers, IconLayoutDashboard, IconX } from '@tabler/icons-react';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';

const SchoolsOverviewModal = ({ open, onClose }) => {
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
        },
      },
    },
    yaxis: {
      title: { text: 'Number of Schools' },
    },
    dataLabels: { enabled: false },
    colors: ['#1DA1F2'],
    grid: { borderColor: '#eee' },
  };

  const chartSeries = [
    {
      name: 'Schools',
      data: [12, 19, 23, 30, 15, 28, 20, 25, 32, 18],
    },
  ];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      padding={0}
      title={
        <Typography fontSize={24} fontWeight={700}>
          Total School
        </Typography>
      }
    >
      <Box p={3}>
        {/* STACKED PAPERS */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} mb={3}>
          <Paper
            sx={{
              border: '1px solid #f3a6ff',
              borderRadius: 2,
              px: 4,
              py: 3,
              width: { xs: '100%', sm: 320 },
              height: 95,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <IconSchool size={32} color="#1DA1F2" />
            <Box textAlign="right">
              <Typography fontSize={28} fontWeight={700}>
                700
              </Typography>
              <Typography color="text.secondary" fontSize={14}>
                Total School
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              border: '1px solid #f3a6ff',
              borderRadius: 2,
              px: 4,
              py: 3,
              width: { xs: '100%', sm: 320 },
              height: 95,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Stack spacing={1} width="100%">
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={15}>Primary Sch -</Typography>
                <Typography fontWeight={600}>34</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={15}>Senior Sec</Typography>
                <Typography fontWeight={600}>34</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        {/* TABS */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ borderBottom: '1px solid #e0e0e0', mb: 2, minHeight: 42 }}
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
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
            {/* Header with Year Selector */}
            <Box
              sx={{
                background: '#F2FFFA',
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
                    border: '1px solid #dcdcdc',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      background: '#E7FAFF',
                      px: 2,
                      py: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      borderRight: '1px solid #dcdcdc',
                    }}
                  >
                    <Typography fontSize={14}>Year</Typography>
                  </Box>

                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                      background: '#F5F5F5',
                      px: 1.5,
                      py: 0.5,
                      fontSize: 14,
                      minWidth: 70,
                      '& .MuiSelect-select': { paddingRight: '20px !important' },
                    }}
                  >
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2025}>2025</MenuItem>
                    <MenuItem value={2026}>2026</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 3, background: '#fff', height: 350 }}>
              <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
            </Box>
          </Paper>
        )}

        {tab === 1 && (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
            {/* Header with Year Selector */}
            <Box
              sx={{
                background: '#F2FFFA',
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
                    border: '1px solid #dcdcdc',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      background: '#E7FAFF',
                      px: 2,
                      py: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      borderRight: '1px solid #dcdcdc',
                    }}
                  >
                    <Typography fontSize={14}>Agent</Typography>
                  </Box>

                  <Select
                    value={'agent1'} // example value
                    onChange={(e) => console.log('Selected agent:', e.target.value)}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                      background: '#F5F5F5',
                      px: 1.5,
                      py: 0.5,
                      fontSize: 14,
                      minWidth: 120,
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
                    border: '1px solid #dcdcdc',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      background: '#E7FAFF',
                      px: 2,
                      py: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      borderRight: '1px solid #dcdcdc',
                    }}
                  >
                    <Typography fontSize={14}>Year</Typography>
                  </Box>

                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                      background: '#F5F5F5',
                      px: 1.5,
                      py: 0.5,
                      fontSize: 14,
                      minWidth: 70,
                      '& .MuiSelect-select': { paddingRight: '20px !important' },
                    }}
                  >
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2025}>2025</MenuItem>
                    <MenuItem value={2026}>2026</MenuItem>
                  </Select>
                </Box>

                {/* Filter Button */}
                <Box>
                  <button
                    style={{
                      background: '#1DA1F2',
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

            <Box sx={{ p: 3, background: '#fff', height: 350 }}>
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
                  },
                  yaxis: { title: { text: 'Number of Schools' } },
                  dataLabels: { enabled: false },
                  colors: ['#1DA1F2'],
                  grid: { borderColor: '#eee' },
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
      </Box>
    </StandardModal>
  );
};

export default SchoolsOverviewModal;
