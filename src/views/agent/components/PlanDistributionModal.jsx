import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Button,
  Card,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Chart from 'react-apexcharts';

const PlanDistributionModal = ({ open, onClose }) => {
  const plans = [
    { label: 'Freemium', value: '7,000,234.00', color: '#1a3353', bg: 'white', border: '#1a3353' },
    { label: 'Basic', value: '7,000,234.00', color: '#4a3aff', bg: 'white', border: '#4a3aff' },
    { label: 'Basic +', value: '7,000,234.00', color: '#ff4081', bg: 'white', border: '#fcc5d8' },
    { label: 'Basic ++', value: '7,000,234.00', color: '#9c27b0', bg: 'white', border: '#e1bee7' },
  ];

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 0
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: ['Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo', 'Olasegun Obasanjo'],
      labels: {
        rotate: -45,
        style: { fontSize: '10px', fontWeight: 600 }
      },
      title: { 
        text: 'Agent',
        style: { fontWeight: 700, fontSize: '12px' },
        offsetY: 85
      },
      axisBorder: { show: true, color: '#e0e0e0' },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { 
        text: 'NO of Schools',
        style: { fontWeight: 700, fontSize: '12px' }
      },
      min: 0,
      max: 100,
      tickAmount: 10,
    },
    fill: { opacity: 1 },
    colors: ['#3949ab', '#2196f3', '#ff4081', '#9c27b0'],
    legend: { 
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 700,
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 0,
    }
  };

  const chartSeries = [
    { name: 'Freemium', data: [55, 10, 8, 12, 25, 10, 10, 45, 12, 12] },
    { name: 'Basic', data: [38, 40, 15, 40, 30, 15, 12, 32, 32, 32] },
    { name: 'Basic +', data: [30, 82, 32, 35, 28, 28, 5, 32, 32, 72] },
    { name: 'Basic ++', data: [48, 15, 12, 18, 50, 32, 8, 32, 55, 52] },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 0 } }}>
      <DialogContent sx={{ p: 4, bgcolor: '#f8fafc', position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'red' }}>
          <CloseIcon fontSize="large" />
        </IconButton>

        <Grid container spacing={2} mb={4} mt={2}>
          {plans.map((plan, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ 
                p: 2, 
                border: `1.5px solid ${plan.border}`, 
                boxShadow: 'none', 
                borderRadius: '4px',
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="h5" fontWeight="700" sx={{ color: plan.color, fontSize: '22px' }}>
                  # {plan.value}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: plan.color }} />
                  <Typography variant="caption" fontWeight="700" sx={{ color: '#444' }}>{plan.label}</Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ borderRadius: '8px', overflow: 'hidden', bgcolor: 'white', p: 0, border: '1px solid #e2e8f0' }}>
         <Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    p: 1,
    bgcolor: "#f2fdf5"
  }}
>
  {/* Spacer */}
  <Box />

  {/* Filters */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ddd",
        borderRadius: "4px",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 0.5,
          bgcolor: "#e0f7fa",
          borderRight: "1px solid #ddd"
        }}
      >
        <Typography variant="body2" fontWeight="500">
          Year
        </Typography>
      </Box>

      <Select
        size="small"
        value="2026"
        sx={{
          border: "none",
          "& fieldset": { border: "none" },
          ".MuiSelect-select": {
            py: 0.5,
            fontWeight: 600,
            minWidth: "60px"
          }
        }}
      >
        <MenuItem value="2026">2026</MenuItem>
      </Select>
    </Box>

    <Button
      variant="contained"
      sx={{
        bgcolor: "#2ca87f",
        "&:hover": { bgcolor: "#238a68" },
        textTransform: "none",
        px: 3,
        fontWeight: 600,
        height: "32px"
      }}
    >
      Filter
    </Button>
  </Box>

  {/* Right Title */}
  {/* <Typography
    variant="h6"
    fontWeight="700"
    sx={{ color: "#444", fontSize: "16px" }}
  >
    Plan per School
  </Typography> */}
</Box>

          <Box sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ display: 'flex' }}>
              <Grid size={{ xs: 12, md: 9 }}>
                <Box sx={{ p: 1, position: 'relative' }}>
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={450} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
                <Stack spacing={2} sx={{ width: '100%', height: '450px', justifyContent: 'space-between' }}>
                  {plans.map((plan, index) => (
                    <Card key={index} sx={{ 
                      p: 2, 
                      border: `1.5px solid ${plan.border}`, 
                      boxShadow: 'none',
                      borderRadius: '4px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                       <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: plan.color }} />
                          <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#1a3353' }}>{plan.label}</Typography>
                       </Stack>
                       <Typography variant="h3" fontWeight="800" sx={{ color: plan.color, mb: 0.5, fontSize: '28px' }}>
                          {index === 1 ? '400' : index === 2 ? '30' : index === 3 ? '800' : '300'}
                       </Typography>
                       <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>School</Typography>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PlanDistributionModal;
