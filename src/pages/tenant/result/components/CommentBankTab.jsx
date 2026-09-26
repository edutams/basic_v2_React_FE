import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  useTheme, TextField, Button, CircularProgress, Tooltip, Chip, Snackbar, Alert,
} from '@mui/material';
import { IconHelp } from '@tabler/icons-react';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';

// The four attendance/affective/psychomotor average bands (the post-alter
// comment_banks columns — see basic_v2_be 2026_09_22 create migration).
const BANDS = [
  { field: 'comment1', label: '0 - 1' },
  { field: 'comment2', label: '1.1 - 1.9' },
  { field: 'comment3', label: '2.0 - 3.9' },
  { field: 'comment4', label: '4.0 - 5.0' },
];

// Comment bank is self-contained: it fetches its own rows from
// GET /result-sheet/comment-bank and persists cell edits through
// POST /result-sheet/comment-bank.
const CommentBankTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCell, setEditingCell] = useState({ rowIdx: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const loadCommentBank = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await resultSheetApi.getCommentBank();
      setRows(res?.data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch comment bank:', err);
      setError(err?.response?.data?.message || 'Failed to load comment bank. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommentBank();
  }, [loadCommentBank]);

  const handleDoubleClick = (rowIdx, field, currentValue) => {
    setEditingCell({ rowIdx, field });
    setEditValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingCell({ rowIdx: null, field: null });
    setEditValue('');
  };

  const handleSave = async (rowIdx) => {
    const row = rows[rowIdx];
    const field = editingCell.field;
    if (!row || !field) return;

    const value = editValue.trim() || null;
    setSaving(true);
    try {
      await resultSheetApi.saveCommentBank({
        comment_grade_id: row.comment_grade_id,
        field,
        value,
      });
      setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r)));
      showSnackbar('Comment saved successfully');
      cancelEdit();
    } catch (err) {
      console.error('Failed to save comment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to save comment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderEditableCell = (rowIdx, field, value) => {
    const isEditing = editingCell.rowIdx === rowIdx && editingCell.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <TextField
            size="small" multiline minRows={2} maxRows={5} fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #000' } }}
            autoFocus
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
            <Button variant="contained" size="small" onClick={() => handleSave(rowIdx)} disabled={saving}
              sx={{ fontSize: 10, minWidth: 0, px: 1 }}>
              {saving ? <CircularProgress size={12} /> : 'Save'}
            </Button>
            <Button variant="outlined" size="small" color="error" onClick={cancelEdit}
              sx={{ fontSize: 10, minWidth: 0, px: 1 }}>
              Clear
            </Button>
          </Box>
        </Box>
      );
    }

    return (
      <Box
        onDoubleClick={() => handleDoubleClick(rowIdx, field, value)}
        sx={{
          width: 250, minHeight: 24, cursor: 'pointer', wordWrap: 'break-word', overflowWrap: 'break-word',
          color: value ? 'text.primary' : 'text.secondary',
          fontStyle: value ? 'normal' : 'italic',
          '&:hover': { bgcolor: 'action.hover', borderRadius: 1, px: 0.5 },
        }}
      >
        {value || 'Double click to start editing'}
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor, mt: 2 }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="h6" fontWeight={700}>Comment Bank</Typography>
        <Tooltip title="Double-click any cell to add or edit a result comment for that score range and domain average band." arrow>
          <Chip icon={<IconHelp size={14} />} label="?" size="small" color="info"
            sx={{ height: 22, fontSize: 11, cursor: 'help', '& .MuiChip-icon': { ml: 0.3 } }} />
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={loadCommentBank} disabled={loading}>
          {loading ? <CircularProgress size={14} color="inherit" /> : 'Refresh'}
        </Button>
      </Box>

      {/* ── States ──────────────────────────────────────────── */}
      {error && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <Box sx={{ p: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading comment bank...</Typography>
          </Box>
        ) : rows.length === 0 && !error ? (
          <Alert severity="info">
            No comment grades found. Run the CommentGradeSeeder (database/seeders/Tenant/CommentGradeSeeder) to
            populate the score ranges.
          </Alert>
        ) : (
          <Table size="small" sx={{ minWidth: 1200, '& .MuiTableCell-root': { py: 1.5, px: 1.5, borderRight: `1px solid ${borderColor}` } }}>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ fontWeight: 700, width: '12%', textAlign: 'center', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                  Score Range
                </TableCell>
                <TableCell colSpan={BANDS.length} sx={{ fontWeight: 700, textAlign: 'center', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                  Attendance Affectives and Psychomotor Domain average
                </TableCell>
              </TableRow>
              <TableRow>
                {BANDS.map((band) => (
                  <TableCell key={band.field} sx={{ fontWeight: 700, textAlign: 'center', width: '22%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                    {band.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.comment_grade_id || i}>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {row.grade_score}
                  </TableCell>
                  {BANDS.map((band) => (
                    <TableCell key={band.field}>
                      {renderEditableCell(i, band.field, row[band.field])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default CommentBankTab;
