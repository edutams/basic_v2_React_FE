import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import { IconSettings, IconExchange } from '@tabler/icons-react';
import useAuth from 'src/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { updateCommission, updateCommissionType } from '@/api/landlord/commission/commissionApi';

export const SetCommissionModal = ({ open, onClose, agent, onSaved }) => {
  const { user: currentUser } = useAuth();
  const notify = useNotification();
  const referrerCommission = Number(currentUser?.organization?.commission ?? 0);

  const [value, setValue] = useState('0');
  const [saving, setSaving] = useState(false);

  // Reset to this organization's current commission whenever a different
  // row is opened, rather than carrying over whatever was typed last time.
  useEffect(() => {
    if (open) {
      setValue(String(agent?.commission ?? 0));
    }
  }, [open, agent]);

  const handleSave = async () => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      notify.error('Enter a commission between 0 and 100.');
      return;
    }
    setSaving(true);
    try {
      await updateCommission(agent.id, numeric);
      notify.success('Commission updated successfully.');
      onSaved?.();
      onClose();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update commission');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={`Set Commission for ${agent?.agentName || 'Agent'}`}
      icon={IconSettings}
      maxWidth="sm"
      actions={
        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
          <Button variant="contained" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      }
    >
      <Box sx={{ bgcolor: '#E0F2FE', p: 2, borderRadius: 2, mb: 3 }}>
        <Typography variant="body2" color="#0369A1">
          For every school you or agent(s) under you register, you are allotted {referrerCommission}% as
          commission. Whatever percentage you set as commission for the agent(s) under you, will be
          deducted from the total percentage allotted to you.
        </Typography>
      </Box>

      <TextField
        margin="normal"
        fullWidth
        label="Referrer Name"
        value={currentUser?.organization?.organization_name || ''}
        InputProps={{ readOnly: true }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Referrer Commission %"
        value={referrerCommission}
        InputProps={{ readOnly: true }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Set Commission %"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        InputProps={{
          endAdornment: <InputAdornment position="end">of {referrerCommission}%</InputAdornment>,
        }}
      />
    </StandardModal>
  );
};

export const ChangeCommissionTypeModal = ({ open, onClose, agent, onSaved }) => {
  const notify = useNotification();
  const [type, setType] = useState('subscription');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setType(agent?.commissionTypeRaw || 'subscription');
    }
  }, [open, agent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCommissionType(agent.id, type);
      notify.success('Commission type updated successfully.');
      onSaved?.();
      onClose();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to update commission type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Change Commission Type"
      icon={IconExchange}
      maxWidth="xs"
      actions={
        <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
          <Button variant="contained" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      }
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Changing type for <strong>{agent?.agentName}</strong>
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="comm-type-label">Commission Type</InputLabel>
        <Select
          labelId="comm-type-label"
          value={type}
          label="Commission Type"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value="subscription">Commission by Subscription</MenuItem>
          <MenuItem value="transaction">Commission by Transaction</MenuItem>
        </Select>
      </FormControl>
    </StandardModal>
  );
};
