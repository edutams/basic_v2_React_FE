import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Card,
  Divider,
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconSchool, IconChartBar } from '@tabler/icons-react';

const TotalSchoolModal = ({ open, onClose }) => {
  const [tabValue, setTabValue] = React.useState('1');
  const [year, setYear] = React.useState('2026');
  const [agent, setAgent] = React.useState('All');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const chartOptions = {
    chart: {
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
      fontFamily: 'inherit',
      foreColor: '#64748B',
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    colors: ['#00ACFF'],
    xaxis: {
      categories:
        tabValue === '1'
          ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          : [
              'Olusegun Obasanjo',
              'Micheal Olusegun',
              'Micheal Olusegun',
              'Micheal Olusegun',
              'Micheal Olusegun',
              'Micheal Olusegun',
              'Micheal Olusegun',
              'Micheal Olusegun',
            ],
      labels: {
        rotate: tabValue === '1' ? 0 : -45,
        style: { fontSize: '12px' },
      },
    },
    yaxis: {
      title: { text: 'Number of School', style: { color: '#64748B', fontWeight: 500 } },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    tooltip: { theme: 'light' },
  };

  const chartSeries = [
    {
      name: 'Schools',
      data:
        tabValue === '1'
          ? [30, 35, 35, 35, 35, 35, 35, 35, 30, 0, 0, 0]
          : [30, 38, 38, 38, 38, 38, 38, 38],
    },
  ];

<<<<<<< HEAD
  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total School"
      maxWidth="lg"
      padding={3}
      dividers={false}
      headerBg="#F8FAFC"
    >
      {/* Top Cards Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={5} md={4.5}>
          <Card
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              border: '1px solid #FF00FF',
              boxShadow: 'none',
              height: '100%',
              bgcolor: 'white',
              borderRadius: '4px',
            }}
          >
            <Box sx={{ color: '#00ACFF', display: 'flex' }}>
              <IconSchool size={40} />
            </Box>
            <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="800" color="#1E293B" sx={{ lineHeight: 1 }}>
                700
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                fontWeight="600"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Total School
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={7} md={5.5}>
          <Card
            sx={{
              p: 2.5,
              border: '1px solid #FF00FF',
              boxShadow: 'none',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '4px',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight="600" color="#1E293B">
                Primary Sch -
              </Typography>
              <Typography variant="h5" fontWeight="700" color="#1E293B">
                34
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
              <Typography variant="body1" fontWeight="600" color="#1E293B">
                Senior Sec -
              </Typography>
              <Typography variant="h5" fontWeight="700" color="#1E293B">
                34
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 48,
              color: '#64748B',
              bgcolor: '#F1F5F9',
              borderRadius: '4px 4px 0 0',
              mr: 0.5,
              '&.Mui-selected': {
                color: '#1E293B',
                bgcolor: '#fff',
              },
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <IconChartBar size={18} /> <Typography variant="inherit">Overview</Typography>
              </Stack>
            }
            value="1"
          />
          <Tab
            label={
              <Stack direction="row" spacing={1}>
                <IconSchool size={18} />{' '}
                <Typography variant="inherit">Agent Performance</Typography>
              </Stack>
            }
            value="2"
          />
        </Tabs>
      </Box>
=======
    return (
        <StandardModal
            open={open}
            onClose={onClose}
            title="Total School"
            maxWidth="lg"
            padding={3}
            dividers={false}
            headerBg="#F8FAFC"
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Cancel</PrimaryButton>
                    <PrimaryButton variant="primary" onClick={onClose}>Save</PrimaryButton>
                </Stack>
            }
        >
            {/* Top Cards Section */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                    <Card sx={{ 
                        p: 2.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2.5, 
                        border: '1px solid #FF00FF', 
                        boxShadow: 'none',
                        height: '100%',
                        bgcolor: 'white',
                        borderRadius: '4px',
                        width: '100%'
                    }}>
                        <Box sx={{ color: '#00ACFF', display: 'flex' }}>
                            <IconSchool size={40} />
                        </Box>
                        <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <Typography variant="h3" fontWeight="800" color="#1E293B" sx={{ lineHeight: 1 }}>700</Typography>
                            <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>Total School</Typography>
                        </Box>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                    <Card sx={{ 
                        p: 2.5, 
                        border: '1px solid #FF00FF', 
                        boxShadow: 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        bgcolor: 'white',
                        borderRadius: '4px',
                        width: '100%'
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="600" color="#1E293B">Primary Sch -</Typography>
                            <Typography variant="h5" fontWeight="700" color="#1E293B">34</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
                            <Typography variant="body1" fontWeight="600" color="#1E293B">Senior Sec -</Typography>
                            <Typography variant="h5" fontWeight="700" color="#1E293B">34</Typography>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
>>>>>>> develop

      {/* Filters Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-end',
          gap: 2,
          mb: 4,
          p: 2,
          bgcolor: '#F0FDFA',
          borderRadius: '8px',
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        {tabValue === '2' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              bgcolor: 'white',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Box sx={{ px: 2, py: 1, bgcolor: '#E0F2FE', borderRight: '1px solid #E2E8F0' }}>
              <Typography variant="body2" fontWeight="600">
                Select Agent
              </Typography>
            </Box>
            <Select
              size="small"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              sx={{
                '& fieldset': { border: 'none' },
                minWidth: { xs: '100%', sm: 150 },
                flexGrow: 1,
              }}
            >
              <MenuItem value="All">All Agents</MenuItem>
              <MenuItem value="1">Agent 1</MenuItem>
            </Select>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #E2E8F0',
            borderRadius: '4px',
            bgcolor: 'white',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Box sx={{ px: 2, py: 1, bgcolor: '#E0F2FE', borderRight: '1px solid #E2E8F0' }}>
            <Typography variant="body2" fontWeight="600">
              Year
            </Typography>
          </Box>
          <Select
            size="small"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{
              '& fieldset': { border: 'none' },
              minWidth: { xs: '100%', sm: 120 },
              flexGrow: 1,
            }}
          >
            <MenuItem value="2026">2026</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
          </Select>
        </Box>
        {tabValue === '2' && (
          <PrimaryButton
            sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' }, height: '40px', px: 3 }}
          >
            Filter
          </PrimaryButton>
        )}
      </Box>

<<<<<<< HEAD
      {/* Chart Area */}
      <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </Box>
    </StandardModal>
  );
=======
            {/* Filters Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                gap: 2, 
                mb: 4, 
                p: { xs: 2, sm: 3 }, 
                bgcolor: '#F0FDFA', 
                borderRadius: '8px',
                alignItems: { xs: 'stretch', md: 'center' }
            }}>
                <Typography variant="subtitle1" fontWeight="700" color="#134E48" sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                    Filter Data
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 2,
                    flexGrow: 1,
                    justifyContent: 'flex-end',
                    alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                    {tabValue === '2' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
                            <Box sx={{ px: 2, py: 1, bgcolor: '#E0F2FE', borderRight: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" fontWeight="800" sx={{ textTransform: 'uppercase', color: '#0369A1' }}>Agent</Typography>
                            </Box>
                            <Select 
                                size="small" 
                                value={agent} 
                                onChange={(e) => setAgent(e.target.value)}
                                sx={{ '& fieldset': { border: 'none' }, minWidth: { xs: '100%', sm: 150 }, flexGrow: 1, fontSize: '13px', fontWeight: 600 }}
                            >
                                <MenuItem value="All">All Agents</MenuItem>
                                <MenuItem value="1">Agent 1</MenuItem>
                            </Select>
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '4px', bgcolor: 'white', overflow: 'hidden' }}>
                        <Box sx={{ px: 2, py: 1, bgcolor: '#E0F2FE', borderRight: '1px solid #E2E8F0' }}>
                            <Typography variant="caption" fontWeight="800" sx={{ textTransform: 'uppercase', color: '#0369A1' }}>Year</Typography>
                        </Box>
                        <Select 
                            size="small" 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)}
                            sx={{ '& fieldset': { border: 'none' }, minWidth: { xs: '100%', sm: 100 }, flexGrow: 1, fontSize: '13px', fontWeight: 600 }}
                        >
                            <MenuItem value="2026">2026</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                        </Select>
                    </Box>
                    {tabValue === '2' && (
                        <PrimaryButton sx={{ bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' }, height: '36px', px: 4, borderRadius: '4px' }}>Filter</PrimaryButton>
                    )}
                </Box>
            </Box>

            {/* Chart Area */}
            <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
            </Box>
        </StandardModal>
    );
>>>>>>> develop
};

export default TotalSchoolModal;
