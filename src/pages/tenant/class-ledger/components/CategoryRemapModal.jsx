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

  const currentCategoryName = useMemo(
    () => categories.find((c) => c.id === target?.currentCategoryId)?.name || 'their current category',
    [categories, target],
  );

  const newCategoryName = useMemo(
    () => categories.find((c) => String(c.id) === String(newCategoryId))?.name || 'the new category',
    [categories, newCategoryId],
  );

  const mappedCount = Object.values(mapping).filter((v) => v && v !== UNMAPPED).length;
  const payableOldItems = oldItems.filter((item) => item.paid_amount > 0);

  useEffect(() => {
    if (open) {
      // A radio click on a specific category column pre-fills that target
      // category so the admin doesn't have to reselect it here — they can
      // still change it via the dropdown below before previewing.
      setNewCategoryId(target?.newCategoryId ? String(target.newCategoryId) : '');
    } else {
      setNewCategoryId('');
      setOldItems([]);
      setNewItems([]);
      setMapping({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Typography variant="body2" fontWeight={700} gutterBottom>
            What moving {target.fullName?.split(' ')[0] || 'this student'} from{' '}
            <strong>{currentCategoryName}</strong> to <strong>{newCategoryName || 'a new category'}</strong> actually
            does:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
            <li>
              <Typography variant="body2">
                Below is every fee this student has a payment against in <strong>{currentCategoryName}</strong>.
                For each one, you decide: should that payment count toward a fee in{' '}
                <strong>{newCategoryName || 'the new category'}</strong> instead?
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Pick a fee in "Map to"</strong> — the payment moves there: the old fee is cleared
                (no longer owed, no longer shown), and the matching new fee shows as paid by that same amount.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Leave it "unmapped"</strong> — nothing happens to that payment. It stays exactly where
                it is, still visible in the student's payment history, but it will no longer count toward
                anything they currently owe (because they're no longer in that category). No refund, no
                transfer — it just stops being part of their active bill.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Fees with nothing paid need no decision — they're simply dropped once the category changes.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                After you confirm: the student's category changes, and any other fee required by{' '}
                <strong>{newCategoryName || 'the new category'}</strong> that you didn't map from anything above
                gets added to their bill automatically (same as a brand-new student in that category).
              </Typography>
            </li>
          </Box>
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
                  <TableCell sx={{ fontWeight: 600 }}>
                    Fee under {currentCategoryName}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fee amount / Amount paid</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    Move this payment to which fee in {newCategoryName || 'the new category'}?
                  </TableCell>
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
                            <MenuItem value={UNMAPPED}>
                              Don't move it — leave this payment in their history, untouched
                            </MenuItem>
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
            {newCategoryName || 'The target category'} has no payment schedule configured for this student's
            class/term yet — there's nothing to map to, so every paid item above will be left untouched in
            their history, and no new fees will be added until a schedule is set for this category.
          </Alert>
        )}

        {!loadingPreview && newCategoryId && oldItems.length > 0 && (
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            On confirm: <strong>{mappedCount}</strong> of <strong>{payableOldItems.length}</strong> paid
            item(s) will move to {newCategoryName || 'the new category'}
            {payableOldItems.length - mappedCount > 0 && (
              <>
                , and <strong>{payableOldItems.length - mappedCount}</strong> will stay in {currentCategoryName}'s
                history untouched
              </>
            )}
            .
          </Typography>
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
