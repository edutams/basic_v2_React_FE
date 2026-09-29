import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import staffApi from '@/api/tenant/staffs/staffApi';
import { useNotification } from '@/hooks/useNotification';

// Mirrors the `staff_status` enum on the `staff` table — the create/edit
// form only ever exposed active/inactive/leave, leaving the rest of the DB
// enum unreachable from the UI even though the "On Leave" stat card and
// this history already assume the full set is meaningful.
export const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'leave', label: 'On Leave' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'retired', label: 'Retired' },
  { value: 'dead', label: 'Deceased' },
];

export const statusLabel = (value) =>
  STAFF_STATUS_OPTIONS.find((o) => o.value === value)?.label || value || '—';

const formatDateTime = (value) => {
  if (!value) return '—';
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * "Update Status" action for a staff member — lets you record a new status
 * (with an optional reason) and, right below it, shows every status change
 * ever recorded for them: when it happened, what it changed from/to, who
 * did it, and why. Backed by the tenant `activity_log` table via
 * staffApi.getStatusHistory/updateStatus — not a bespoke history table.
 */
const StaffStatusModal = ({ open, onClose, staff, getStatusColor, onStatusChanged }) => {
  const notify = useNotification();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(5);

  const staffId = staff?.user_id;
  const staffName = staff ? `${staff.user?.fname || ''} ${staff.user?.lname || ''}`.trim() : '';
  const currentStatus = staff?.staff_status;

  const loadHistory = useCallback(async () => {
    if (!staffId) return;
    setLoadingHistory(true);
    try {
      const res = await staffApi.getStatusHistory(staffId);
      if (res.status) setHistory(res.data || []);
    } catch (error) {
      console.error('Failed to load status history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [staffId]);

  useEffect(() => {
    if (open && staffId) {
      setNewStatus('');
      setReason('');
      setHistoryPage(0);
      loadHistory();
    }
  }, [open, staffId, loadHistory]);

  const handleSubmit = async () => {
    if (!newStatus || !staffId) return;
    setSubmitting(true);
    try {
      const res = await staffApi.updateStatus(staffId, {
        status: newStatus,
        reason: reason.trim() || undefined,
      });
      if (res.status) {
        notify.success(res.message || 'Status updated successfully');
        setNewStatus('');
        setReason('');
        await loadHistory();
        onStatusChanged?.();
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const pagedHistory = history.slice(
    historyPage * historyRowsPerPage,
    historyPage * historyRowsPerPage + historyRowsPerPage,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Update Status
          </Typography>
          {staffName && (
            <Typography variant="body2" color="text.secondary">
              {staffName}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Current status:
            </Typography>
            <Chip
              size="small"
              label={statusLabel(currentStatus)}
              color={getStatusColor?.(currentStatus) || 'default'}
            />
          </Stack>

          <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STAFF_STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={!newStatus || submitting}
            sx={{ alignSelf: 'flex-start' }}
          >
            {submitting ? 'Saving...' : 'Save Status Change'}
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Status History
        </Typography>

        {loadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No status changes have been recorded yet.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 48 }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>To</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Changed By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedHistory.map((entry, i) => (
                    <TableRow key={entry.id}>
                      <TableCell>{historyPage * historyRowsPerPage + i + 1}</TableCell>
                      <TableCell>{formatDateTime(entry.changed_at)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(entry.previous_status)}
                          color={getStatusColor?.(entry.previous_status) || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={statusLabel(entry.new_status)}
                          color={getStatusColor?.(entry.new_status) || 'default'}
                        />
                      </TableCell>
                      <TableCell>{entry.changed_by || '—'}</TableCell>
                      <TableCell>{entry.reason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={history.length}
              page={historyPage}
              onPageChange={(_, newPage) => setHistoryPage(newPage)}
              rowsPerPage={historyRowsPerPage}
              onRowsPerPageChange={(e) => {
                setHistoryRowsPerPage(parseInt(e.target.value, 10));
                setHistoryPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffStatusModal;
