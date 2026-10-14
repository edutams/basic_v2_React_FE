import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconUsers } from '@tabler/icons-react';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import ReportCardTab from './ReportCardTab';

/**
 * Guardian-facing "View Wards' Result" page — lists the logged-in
 * guardian's wards, lets them pick one, then reuses ReportCardTab (the
 * same term-selector/publish-gate/template-render flow the learner's own
 * Report Card uses) scoped to that ward via the ward-* endpoints instead
 * of the "my" ones.
 */
const WardReportCardTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [loadingWards, setLoadingWards] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingWards(true);
      try {
        const res = await resultDossierApi.getMyWards();
        if (cancelled) return;
        const body = res?.data;
        if (body?.status) {
          const list = body.data || [];
          setWards(list);
          setSelectedWardId((prev) => prev || list[0]?.id || '');
        } else {
          setError(body?.message || 'Failed to load your wards.');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load wards:', err);
          setError(err?.response?.data?.message || 'Failed to load your wards.');
        }
      } finally {
        if (!cancelled) setLoadingWards(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRegistrations = useCallback(
    () => resultDossierApi.getWardRegistration({ student_user_id: selectedWardId }),
    [selectedWardId],
  );

  const fetchReport = useCallback(
    (sessionTermId) =>
      resultDossierApi.getWardReport({ student_user_id: selectedWardId, session_term_id: sessionTermId }),
    [selectedWardId],
  );

  const selectedWard = wards.find((w) => w.id === selectedWardId);

  if (loadingWards) {
    return (
      <Paper
        elevation={0}
        sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
      >
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your wards...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (wards.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
      >
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <IconUsers size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {error || 'No wards linked to your account yet.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please contact your school if you believe this is a mistake.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <ReportCardTab
      key={selectedWardId}
      fetchRegistrations={fetchRegistrations}
      fetchReport={fetchReport}
      title={selectedWard ? `${selectedWard.name}'s Report Card` : "Ward's Report Card"}
      emptyRegistrationsMessage="This ward has no registration on record yet."
      paymentRequiredMessage="You must clear this ward's outstanding fees before you can view their results for this term."
      skipLearnerGuard
      headerAccessory={
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Ward</InputLabel>
          <Select
            value={selectedWardId}
            label="Ward"
            onChange={(e) => setSelectedWardId(e.target.value)}
          >
            {wards.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={w.avatar || undefined} sx={{ width: 22, height: 22, fontSize: 11 }}>
                    {w.name?.[0] || 'W'}
                  </Avatar>
                  {w.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
    />
  );
};

export default WardReportCardTab;
