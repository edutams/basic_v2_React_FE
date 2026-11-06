import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Switch,
} from '@mui/material';
import { Payments as PaymentsIcon } from '@mui/icons-material';
import ParentCard from '@/components/shared/ParentCard';
import {
  fetchResultPaymentSettings,
  saveResultPaymentSettings,
} from '@/api/tenant/bursary/bursaryResultSettingsApi';
import useNotification from '@/hooks/useNotification';

/**
 * "Result viewing" settings — restored as its own tab (previously a card
 * nested inside Bursary Setup, disabled via `{false && (...)}` while result
 * access was simplified to a flat "any outstanding balance blocks viewing"
 * rule). Controls whether a school instead requires payment against
 * compulsory fees, optional fees, or both (each independently full or part)
 * before a student can view their result — enforced server-side by
 * resultPaymentGateStatus() in app/Helpers/helpers.php.
 */
const ResultPaymentSettingsTab = () => {
  const notify = useNotification();

  const [resultSettings, setResultSettings] = useState({
    pay_condition: 'no',
    pay_type: '',
    pay_method: '',
    compulsory_pay_method: '',
    optional_pay_method: '',
  });
  const [resultSettingsLoading, setResultSettingsLoading] = useState(true);
  const [savingResultSettings, setSavingResultSettings] = useState(false);

  const loadResultSettings = async () => {
    setResultSettingsLoading(true);
    try {
      const res = await fetchResultPaymentSettings();

      if (res.status) {
        setResultSettings({
          pay_condition: res.data.pay_condition || 'no',
          pay_type: res.data.pay_type || '',
          pay_method: res.data.pay_method || '',
          compulsory_pay_method: res.data.compulsory_pay_method || '',
          optional_pay_method: res.data.optional_pay_method || '',
        });
      } else {
        notify.info(res.message);
      }
    } catch (err) {
      notify.info(err?.response?.data?.message);
    } finally {
      setResultSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadResultSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveResultSettings = async (updatedSettings) => {
    setSavingResultSettings(true);
    try {
      const res = await saveResultPaymentSettings(updatedSettings);
      notify.success(res.message);
      loadResultSettings();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to save result settings');
    } finally {
      setSavingResultSettings(false);
    }
  };

  return (
    <ParentCard
      sx={{
        '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PaymentsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Result viewing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Control whether students can see results before paying.
          </Typography>
        </Box>
      </Box>

      {/* Main toggle */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: '#f6f6f6',
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Require payment before students can view results
          </Typography>
          <Typography variant="caption" color="textSecondary">
            When on, unpaid students will see a payment prompt instead of their results.
          </Typography>
        </Box>
        {resultSettingsLoading ? (
          <Skeleton variant="rounded" width={34} height={20} sx={{ borderRadius: 10 }} />
        ) : (
          <Switch
            checked={resultSettings.pay_condition === 'yes'}
            onChange={(e) => {
              const updated = {
                ...resultSettings,
                pay_condition: e.target.checked ? 'yes' : 'no',
                pay_type: '',
                pay_method: '',
                compulsory_pay_method: '',
                optional_pay_method: '',
              };
              setResultSettings(updated);
              // auto save when toggled off
              if (!e.target.checked) handleSaveResultSettings(updated);
            }}
            color="primary"
          />
        )}
      </Box>

      {/* Expanded options when switch is ON */}
      {resultSettings.pay_condition === 'yes' && (
        <Stack spacing={3} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {/* Pay Type */}
          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Payment Type
            </FormLabel>
            <TextField
              select
              size="small"
              value={resultSettings.pay_type}
              onChange={(e) =>
                setResultSettings((prev) => ({
                  ...prev,
                  pay_type: e.target.value,
                  pay_method: '',
                  compulsory_pay_method: '',
                  optional_pay_method: '',
                }))
              }
              sx={{ maxWidth: 300 }}
            >
              <MenuItem value="compulsory">Compulsory</MenuItem>
              <MenuItem value="optional">Optional</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </TextField>
          </FormControl>

          {/* Pay Method — shown when compulsory or optional */}
          {(resultSettings.pay_type === 'compulsory' || resultSettings.pay_type === 'optional') && (
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                Payment Method
              </FormLabel>
              <RadioGroup
                row
                value={resultSettings.pay_method}
                onChange={(e) => setResultSettings((prev) => ({ ...prev, pay_method: e.target.value }))}
              >
                <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
              </RadioGroup>
            </FormControl>
          )}

          {/* Split method — shown when "both" */}
          {resultSettings.pay_type === 'both' && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    Compulsory Payment Method
                  </Typography>
                  <RadioGroup
                    row
                    value={resultSettings.compulsory_pay_method}
                    onChange={(e) =>
                      setResultSettings((prev) => ({ ...prev, compulsory_pay_method: e.target.value }))
                    }
                  >
                    <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                    <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
                  </RadioGroup>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>
                    Optional Payment Method
                  </Typography>
                  <RadioGroup
                    row
                    value={resultSettings.optional_pay_method}
                    onChange={(e) =>
                      setResultSettings((prev) => ({ ...prev, optional_pay_method: e.target.value }))
                    }
                  >
                    <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
                    <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
                  </RadioGroup>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Save button */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              disabled={
                savingResultSettings ||
                !resultSettings.pay_type ||
                (resultSettings.pay_type !== 'both' && !resultSettings.pay_method) ||
                (resultSettings.pay_type === 'both' &&
                  (!resultSettings.compulsory_pay_method || !resultSettings.optional_pay_method))
              }
              onClick={() => handleSaveResultSettings(resultSettings)}
              sx={{ fontWeight: 600 }}
            >
              {savingResultSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Stack>
      )}
    </ParentCard>
  );
};

export default ResultPaymentSettingsTab;
