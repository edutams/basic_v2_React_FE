import { Box, Typography, Stack } from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  PaymentOutlined as PaymentIcon,
  UpgradeOutlined as UpgradeIcon,
  ReceiptLongOutlined as ReceiptIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';

const STEPS = [
  {
    icon: AddIcon,
    title: 'Subscribe per term or per session',
    description:
      'Pick a plan for a single term, or subscribe for an entire session at once — a session subscription creates one pending entry per term, payable together or one at a time.',
  },
  {
    icon: PaymentIcon,
    title: 'Pay to activate',
    description:
      'A new subscription starts out Pending. It becomes Active once payment is confirmed — use "Pay Now" for a single term or "Pay Full Session" to clear every pending term in that session in one payment.',
  },
  {
    icon: UpgradeIcon,
    title: 'Change plans anytime before paying',
    description:
      'A pending subscription can still be moved to a different plan ("Change Plan") or reverted back ("Revert Plan") — once it is Active, changing plans moves it back to Pending until the new payment is completed.',
  },
  {
    icon: ReceiptIcon,
    title: 'Invoices and receipts',
    description:
      'Every subscription has a downloadable invoice. Once a payment is confirmed, its receipt becomes available from Subscription History.',
  },
];

/** Static explainer — no subscription data of its own, just the mechanics
 * of how this page's actions fit together (mirrors the "How it works" info
 * button the CEO mockup calls for on the Subscriptions List). */
const HowSubscriptionsWorkModal = ({ open, onClose }) => (
  <ReusableModal
    open={open}
    onClose={onClose}
    title="How Subscriptions Work"
    size="medium"
    disableEnforceFocus
    disableAutoFocus
  >
    <Stack spacing={2}>
      {STEPS.map((step) => (
        <Box key={step.title} sx={{ display: 'flex', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <step.icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {step.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  </ReusableModal>
);

HowSubscriptionsWorkModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HowSubscriptionsWorkModal;
