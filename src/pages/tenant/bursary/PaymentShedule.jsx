import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  FileUpload as UploadIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CompulsoryScheduleTab from '@/components/tenant/bursary/payment-shedule/CompulsoryScheduleTab';
import OptionalPaymentTab from '@/components/tenant/bursary/payment-shedule/OptionalPaymentTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment Schedule' }];

const PaymentShedule = () => {
  const [actionTab, setActionTab] = useState(0);
  const [scheduleTab, setScheduleTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedSession, setSelectedSession] = useState('2024/2025 - Second Term');
  const [selectedCategory, setSelectedCategory] = useState('New Student Category');
  const [enableFullSession, setEnableFullSession] = useState(false);

  const sessions = ['2024/2025 - First Term', '2024/2025 - Second Term', '2024/2025 - Third Term'];
  const categories = ['New Student Category', 'Returning Students', 'Scholarship'];

  const stats = {
    compulsorySchedule: {
      total: 2000,
      classes: 6,
    },
    paymentName: {
      withMinSchedule: 799,
      withMaxSchedule: 989,
      minLabel: 'School Fee',
      maxLabel: 'Acceptance Fee',
    },
    studentCategory: {
      withMinSchedule: 989,
      withMaxSchedule: 187,
      minLabel: 'Returning Student',
      maxLabel: 'Staff ward',
    },
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleActionTabChange = (event, newValue) => {
    setActionTab(newValue);
  };

  const handleScheduleTabChange = (event, newValue) => {
    setScheduleTab(newValue);
  };

  const handleImportSchedule = () => {
    showSnackbar('Import schedule for current term');
  };

  return (
    <PageContainer title="Payment Schedule" description="Configure fees and payment settings">
      <Breadcrumb
        title="Payment Schedule"
        subtitle="Configure how fees are collected for the current term"
        items={BCrumb}
      />

      {/* Top Stats Section */}
      <Grid container spacing={3} mb={3}>
        {/* Compulsory Schedule Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="body2" color="textSecondary" mb={3}>
              Compulsory Schedule
            </Typography>
            <Box display="flex" justifyContent= "space-between" alignItems= "center" gap={4}>
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  borderRadius: 1,
                  px: 3,
                  py: 2,
                  minWidth: 100,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h2" fontWeight={700} color='primary' sx={{ lineHeight: 1 }}>
                  {stats.compulsorySchedule.total}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stats.compulsorySchedule.classes}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Classes
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Payment Name Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box
                sx={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptIcon  color= 'primary' sx={{ fontSize: 14 }} />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Payment Name
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  With Minimum Schedule
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stats.paymentName.withMinSchedule}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats.paymentName.minLabel}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  With Maximum Schedule
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stats.paymentName.withMaxSchedule}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats.paymentName.maxLabel}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Student Category Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box
                sx={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ReceiptIcon color= 'primary' sx={{ fontSize: 14 }} />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Student Category
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  With Minimum Schedule
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stats.studentCategory.withMinSchedule}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats.studentCategory.minLabel}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  With Maximum Schedule
                </Typography>
                <Typography variant="h3" >
                  {stats.studentCategory.withMaxSchedule}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats.studentCategory.maxLabel}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={actionTab} onChange={handleActionTabChange}>
          <Tab label="1. Set Schedule" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="2. Generate Invoice" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="3. Send Invoice" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Main Content Card with Tabs Inside */}
      <Paper sx={{ borderRadius: 2 }}>
        {/* Header Section with Title and Filters on Same Row */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Left Side - Title and Description */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  ⚙️
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Payment Schedule
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Switch tabs to configure compulsory or optional items.
                </Typography>
              </Box>
            </Box>

            {/* Right Side - Filters Row */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Select Session</InputLabel>
                <Select
                  value={selectedSession}
                  label="Select Session"
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  {sessions.map((session) => (
                    <MenuItem key={session} value={session}>
                      {session}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Student Pay Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Student Pay Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={enableFullSession}
                    onChange={(e) => setEnableFullSession(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    Enable full-session payment
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>

        {/* Tabs and Import Button Row */}
        <Box
          sx={{
            px: 3,
            pt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Schedule Type Tabs - Left Side */}
          <Tabs
            value={scheduleTab}
            onChange={handleScheduleTabChange}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
              },
            }}
          >
            <Tab
              label="Compulsory"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: scheduleTab === 0 ? 'primary.main' : 'grey.300',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    mr: 1,
                  }}
                >
                  1
                </Box>
              }
              iconPosition="start"
            />
            <Tab
              label="Optional Payment"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: scheduleTab === 1 ? 'primary.main' : 'grey.300',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    mr: 1,
                  }}
                >
                  2
                </Box>
              }
              iconPosition="start"
            />
          </Tabs>

          {/* Import Button - Right Side */}
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleImportSchedule}
            size="medium"
            sx={{ fontWeight: 600 }}
          >
            Import schedule for current term
          </Button>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {scheduleTab === 0 && <CompulsoryScheduleTab showSnackbar={showSnackbar} />}
          {scheduleTab === 1 && <OptionalPaymentTab showSnackbar={showSnackbar} />}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default PaymentShedule;
