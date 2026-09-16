import React from 'react';
import { Box, Typography, Chip, Stack, Button } from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import { IconCoins } from '@tabler/icons-react';

const formatNaira = (value) =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Row = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700}>
      {value}
    </Typography>
  </Box>
);

/**
 * "View Commissions" — a read-only summary of one agent's own commission
 * setup and earnings so far. Commission Management has no edit path
 * anymore (commission%/commission_type are set once at agent-creation
 * time, see add-agent's AgentFormFields.jsx), so this only ever reports
 * what's already computed server-side in CommissionController::
 * getOrganizations() — no separate fetch needed, `agent` already carries
 * everything this shows.
 */
const CommissionSummaryModal = ({ open, onClose, agent }) => (
  <StandardModal
    open={open}
    onClose={onClose}
    title={`Commissions — ${agent?.agentName || 'Agent'}`}
    icon={IconCoins}
    maxWidth="xs"
    actions={
      <Stack direction="row" justifyContent="flex-end" width="100%">
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </Stack>
    }
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Chip
        label={agent?.commissionType || 'Subscription'}
        size="small"
        sx={{ fontWeight: 600, borderRadius: '8px' }}
      />
      <Chip
        label={agent?.status || 'inactive'}
        size="small"
        color={agent?.status === 'active' ? 'success' : 'default'}
        sx={{ fontWeight: 600, borderRadius: '8px', textTransform: 'capitalize' }}
      />
    </Box>

    <Row label="Commission Percentage" value={`${agent?.commission ?? 0}%`} />
    <Row label="Schools Managed" value={agent?.schools ?? 0} />
    <Row
      label={
        agent?.commissionTypeRaw === 'transaction'
          ? 'Earnings (SkoolPay wallet)'
          : 'Earnings (subscription commission)'
      }
      value={formatNaira(agent?.earningsRaw ?? 0)}
    />
  </StandardModal>
);

export default CommissionSummaryModal;
