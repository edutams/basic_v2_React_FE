import { useState, useRef } from 'react';
import { Box, Tabs, Tab, Stack, Button } from '@mui/material';
import {
  PriceChange as PriceChangeIcon,
  ArrowForward as ArrowForwardIcon,
  FileDownload as ExportIcon,
  Payment as PaymentIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ManageSubscriptions from './manage-subcription';
import SubscriptionHistory from './subscription-history';
import PricingPlansModal from '@/components/shared/subcription/PricingPlansModal';
import HowSubscriptionsWorkModal from '@/components/shared/subcription/HowSubscriptionsWorkModal';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Subscriptions' }];

const SubscriptionIndex = () => {
  const [value, setValue] = useState(0);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const historyRef = useRef(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Subscriptions" description="Manage your subscriptions and history">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        {value === 0 ? (
          <Breadcrumb
            title="Subscriptions"
            subtitle="Manage your school's platform subscription, make payments and keep track of your subscription history."
            items={BCrumb}
          />
        ) : (
          <Breadcrumb
            title="Subscription Payments"
            subtitle="View, track and manage all subscription payment transactions."
            items={BCrumb}
          />
        )}

        {value === 0 ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PriceChangeIcon fontSize="small" />}
            endIcon={<ArrowForwardIcon fontSize="small" />}
            onClick={() => setPricingModalOpen(true)}
          >
            View Pricing Plans
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon fontSize="small" />}
              onClick={() => historyRef.current?.exportCsv()}
            >
              Export Report
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PaymentIcon fontSize="small" />}
              onClick={() => setValue(0)}
              sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
            >
              Make a Payment
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HelpOutlineIcon fontSize="small" />}
              onClick={() => setHowItWorksOpen(true)}
            >
              How it works?
            </Button>
          </Stack>
        )}
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="subscription tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Manage Subscription" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Subscription History" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Box>

      <Box>
        <Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" hidden={value !== 0}>
          <ManageSubscriptions />
        </Box>
        <Box role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" hidden={value !== 1}>
          <SubscriptionHistory ref={historyRef} />
        </Box>
      </Box>

      <PricingPlansModal open={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />
      <HowSubscriptionsWorkModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </PageContainer>
  );
};

export default SubscriptionIndex;
