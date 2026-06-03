import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Button,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import CompulsoryScheduleTab from '@/components/tenant/bursary/payment-shedule/CompulsoryScheduleTab';
import OptionalPaymentTab from '@/components/tenant/bursary/payment-shedule/OptionalPaymentTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Payment Schedule' }];

const PaymentShedule = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSetSchedule = () => {
    showSnackbar('Schedule settings updated');
  };

  const handleGenerateInvoice = () => {
    showSnackbar('Invoices generated successfully');
  };

  const handleSendInvoice = () => {
    showSnackbar('Invoices sent successfully');
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

      {/* Action Buttons */}
      {/* <Box mb={3}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={handleSetSchedule}
            sx={{
              fontWeight: 600,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            startIcon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                1
              </Box>
            }
          >
            Set Schedule
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateInvoice}
            sx={{
              fontWeight: 600,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            startIcon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                2
              </Box>
            }
          >
            Generate Invoice
          </Button>
          <Button
            variant="contained"
            onClick={handleSendInvoice}
            sx={{
              fontWeight: 600,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            startIcon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                3
              </Box>
            }
          >
            Send Invoice
          </Button>
        </Stack>
      </Box> */}

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            label="Compulsory"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label="Optional Payment"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {/* {currentTab === 0 && <CompulsoryScheduleTab showSnackbar={showSnackbar} />} */}
      {/* {currentTab === 1 && <OptionalPaymentTab showSnackbar={showSnackbar} />} */}

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
