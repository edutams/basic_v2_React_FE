import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Skeleton,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';
import { saveBankService, fetchBankServices } from '@/api/landlord/bank-service/bankService';

const ManageBankService = ({ open, onClose, agent, onSave }) => {
  const [bankServices, setBankServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBankServices();
    setSelectedService(agent?.bank_service_id || '');
    setError('');
  }, [agent]);

  const loadBankServices = async () => {
    setServicesLoading(true);
    try {
      const res = await fetchBankServices();
      setBankServices(res.data?.data || []);
    } catch {
      setError('Failed to load bank services');
    } finally {
      setServicesLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      setError('Please select a bank service');
      return;
    }

    const service = bankServices.find((s) => s.id === selectedService);
    if (!service) return;

    setLoading(true);
    try {
      await saveBankService({
        agent_id: agent?.id,
        service: { id: service.id, name: service.name },
      });
      onSave?.();
      onClose();
    } catch {
      setError('Failed to save bank service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Manage Bank Services"
      size="small"
      showCloseButton
      showDivider
    >
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="info" sx={{ fontSize: 12 }}>
          Select the bank service provider that handles payment processing for this organization.
        </Alert>

        {/* Current service indicator */}
        {agent?.bank_service_id && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Current Bank Service
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {bankServices.find((s) => s.id === agent.bank_service_id)?.name || '—'}
            </Typography>
          </Box>
        )}

        <TextField
          select
          label="Select Bank Service"
          fullWidth
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value);
            setError('');
          }}
          disabled={servicesLoading}
          error={!!error && !selectedService}
        >
          {servicesLoading ? (
            <MenuItem disabled>
              <Skeleton variant="text" width={120} />
            </MenuItem>
          ) : bankServices.length === 0 ? (
            <MenuItem disabled>No bank services available</MenuItem>
          ) : (
            bankServices.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" size="small" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSubmit} disabled={loading || servicesLoading || !selectedService} sx={{ fontWeight: 600 }}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

ManageBankService.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  agent: PropTypes.object,
  onSave: PropTypes.func,
};

export default ManageBankService;
