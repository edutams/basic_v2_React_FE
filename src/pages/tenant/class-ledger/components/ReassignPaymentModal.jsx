import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  fetchStuckPayments,
  searchTargetSchedules,
  reassignPayment,
} from '@/api/tenant/bursary/paymentReassignment';
import { useNotification } from '@/hooks/useNotification';
import dayjs from 'dayjs';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const StuckItemCard = ({ item, userId, availableTerms, onReassigned }) => {
  const notify = useNotification();

  const [selectedIds, setSelectedIds] = useState([]);
  const [targetTermId, setTargetTermId] = useState('');
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [targetSchedule, setTargetSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!targetTermId) {
      setOptions([]);
      return;
    }
    setLoadingOptions(true);
    const handle = setTimeout(() => {
      searchTargetSchedules({ userId, sessionTermId: targetTermId, search })
        .then((res) => setOptions(res?.status ? res.data : []))
        .catch(() => notify.error('Failed to load target fees'))
        .finally(() => setLoadingOptions(false));
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTermId, search]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedTotal = item.transactions
    .filter((t) => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await reassignPayment({
        userId,
        transactionIds: selectedIds,
        targetScheduleId: targetSchedule.bursary_schedule_id,
      });
      if (res?.status) {
        notify.success('Payment reassigned successfully');
        setSelectedIds([]);
        setTargetSchedule(null);
        onReassigned?.();
      } else {
        notify.error(res?.message || 'Failed to reassign payment');
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to reassign payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {item.payment_name} — {item.term_label}
          </Typography>
          <Chip
            size="small"
            label={
              item.reason === 'category_change'
                ? `From: ${item.category_name || 'a previous category'}`
                : 'Overpaid'
            }
            color={item.reason === 'category_change' ? 'default' : 'warning'}
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Typography variant="body2" color="error.main" fontWeight={700}>
          {naira(item.stuck_amount)} stuck
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Select which payment(s) to move:
      </Typography>
      {item.transactions.map((t) => (
        <FormControlLabel
          key={t.id}
          sx={{ display: 'flex', ml: 0 }}
          control={
            <Checkbox
              size="small"
              checked={selectedIds.includes(t.id)}
              onChange={() => toggleSelected(t.id)}
            />
          }
          label={
            <Typography variant="body2">
              {naira(t.amount_paid)} — {dayjs(t.trans_date).format('MMM D, YYYY')} ({t.payment_type})
            </Typography>
          }
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Move to:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Term</InputLabel>
          <Select
            label="Term"
            value={targetTermId}
            onChange={(e) => {
              setTargetTermId(e.target.value);
              setTargetSchedule(null);
            }}
          >
            {availableTerms.map((t) => (
              <MenuItem key={t.session_term_id} value={t.session_term_id}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          size="small"
          sx={{ minWidth: 280, flex: 1 }}
          options={options}
          loading={loadingOptions}
          disabled={!targetTermId}
          value={targetSchedule}
          onChange={(_e, value) => setTargetSchedule(value)}
          onInputChange={(_e, value) => setSearch(value)}
          getOptionLabel={(o) => (o ? `${o.payment_name} (${o.category_name}) — ${naira(o.amount)}` : '')}
          isOptionEqualToValue={(a, b) => a.bursary_schedule_id === b.bursary_schedule_id}
          renderInput={(params) => <TextField {...params} label="Target fee" placeholder="Search fees…" />}
        />
      </Box>

      {targetSchedule && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Currently on this fee: paid {naira(targetSchedule.current_paid_amount)}, balance{' '}
          {naira(targetSchedule.current_balance)}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {selectedIds.length > 0
            ? `Moving ${naira(selectedTotal)} from ${selectedIds.length} payment(s)`
            : 'No payments selected'}
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled={selectedIds.length === 0 || !targetSchedule || submitting}
          onClick={handleConfirm}
        >
          {submitting ? <CircularProgress size={16} color="inherit" /> : 'Reassign'}
        </Button>
      </Box>
    </Paper>
  );
};

const ReassignPaymentModal = ({ open, target, onClose, onSuccess }) => {
  const notify = useNotification();

  const [items, setItems] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStuckPayments = useCallback(() => {
    if (!target?.userId) return;
    setLoading(true);
    fetchStuckPayments({ userId: target.userId })
      .then((res) => {
        if (res?.status) {
          setItems(res.data.items || []);
          setAvailableTerms(res.data.available_terms || []);
        }
      })
      .catch(() => notify.error('Failed to load stuck payments'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.userId]);

  useEffect(() => {
    if (open) {
      loadStuckPayments();
    } else {
      setItems([]);
      setAvailableTerms([]);
    }
  }, [open, loadStuckPayments]);

  const handleReassigned = () => {
    loadStuckPayments();
    onSuccess?.();
  };

  if (!target) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reassign a Payment — {target.fullName}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          These are payments that either belong to a category this student has left, or paid more
          than a fee actually costs. Move any of them onto a different fee — the payment's term
          moves with it.
        </Alert>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="success">No stuck payments found for this student.</Alert>
        ) : (
          items.map((item) => (
            <StuckItemCard
              key={`${item.bursary_schedule_id}-${item.session_term_id}`}
              item={item}
              userId={target.userId}
              availableTerms={availableTerms}
              onReassigned={handleReassigned}
            />
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReassignPaymentModal;
