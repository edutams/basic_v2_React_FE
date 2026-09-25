import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { fetchRemapPreview, applyCategoryRemap } from '@/api/tenant/bursary/paymentCategory';
import { useNotification } from '@/hooks/useNotification';

const UNMAPPED = '__unmapped__';

const CategoryRemapModal = ({ open, target, sessionTermId, categories, onClose, onSuccess }) => {
  const notify = useNotification();

  const [newCategoryId, setNewCategoryId] = useState('');
  const [oldItems, setOldItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [mapping, setMapping] = useState({}); // { old_schedule_id: new_schedule_id | UNMAPPED }
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const targetCategories = useMemo(
    () => categories.filter((c) => c.id !== target?.currentCategoryId),
    [categories, target],
  );

  useEffect(() => {
    if (!open) {
      setNewCategoryId('');
      setOldItems([]);
      setNewItems([]);
      setMapping({});
    }
  }, [open]);

  useEffect(() => {
    if (!open || !newCategoryId || !target) return;

    setLoadingPreview(true);
    fetchRemapPreview({ userId: target.userId, sessionTermId, newCategoryId })
      .then((res) => {
        if (res?.status) {
          setOldItems(res.data.old_items || []);
          setNewItems(res.data.new_items || []);
          const initial = {};
          (res.data.suggested_matches || []).forEach((m) => {
            initial[m.old_schedule_id] = m.new_schedule_id;
          });
          setMapping(initial);
        }
      })
      .catch(() => notify.error('Failed to load remap preview'))
      .finally(() => setLoadingPreview(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, newCategoryId, target, sessionTermId]);

  const handleSubmit = async () => {
    const mappings = Object.entries(mapping)
      .filter(([, newScheduleId]) => newScheduleId && newScheduleId !== UNMAPPED)
      .map(([oldScheduleId, newScheduleId]) => ({
        old_schedule_id: Number(oldScheduleId),
        new_schedule_id: Number(newScheduleId),
      }));

    setSaving(true);
    try {
      const res = await applyCategoryRemap({
        userId: target.userId,
        sessionTermId,
        newCategoryId,
        mappings,
      });
      if (res?.status) {
        notify.success('Pay category changed successfully');
        onSuccess?.();
      } else {
        notify.error(res?.message || 'Failed to change pay category');
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to change pay category');
    } finally {
      setSaving(false);
    }
  };

  if (!target) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Change Pay Category — {target.fullName}
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          This student has already paid against some items in their current category.
          Match each paid item on the left to its equivalent under the new category so
          the payment follows them. Anything you leave unmapped stays exactly as it is —
          still visible on their payment history, untouched.
        </Alert>

        <FormControl size="small" sx={{ minWidth: 260, mb: 2 }}>
          <InputLabel>New Pay Category</InputLabel>
          <Select
            value={newCategoryId}
            label="New Pay Category"
            onChange={(e) => setNewCategoryId(e.target.value)}
          >
            <MenuItem value="">-- Select New Category --</MenuItem>
            {targetCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loadingPreview && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loadingPreview && newCategoryId && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Current item (paid)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount / Paid</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Map to</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {oldItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      No invoiced items found for this student's current category.
                    </TableCell>
                  </TableRow>
                ) : (
                  oldItems.map((item) => (
                    <TableRow key={item.bursary_schedule_id}>
                      <TableCell>{item.payment_name}</TableCell>
                      <TableCell>
                        ₦{item.schedule_amount.toLocaleString()} / ₦{item.paid_amount.toLocaleString()}
                        {item.paid_amount === 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            (nothing paid — no need to map)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth sx={{ minWidth: 220 }}>
                          <Select
                            value={mapping[item.bursary_schedule_id] || UNMAPPED}
                            onChange={(e) =>
                              setMapping((prev) => ({
                                ...prev,
                                [item.bursary_schedule_id]: e.target.value,
                              }))
                            }
                          >
                            <MenuItem value={UNMAPPED}>Leave unmapped (stays as-is)</MenuItem>
                            {newItems.map((n) => (
                              <MenuItem key={n.bursary_schedule_id} value={n.bursary_schedule_id}>
                                {n.payment_name} (₦{n.amount.toLocaleString()})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loadingPreview && newCategoryId && newItems.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            The target category has no payment schedule configured for this student's
            class/term yet — everything will be left unmapped (untouched).
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!newCategoryId || saving || loadingPreview}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : 'Confirm Change'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryRemapModal;
