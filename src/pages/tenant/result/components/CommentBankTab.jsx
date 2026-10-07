import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  TextField,
  Button,
  CircularProgress,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import {
  IconHelp,
  IconPencil,
  IconX,
  IconUserCheck,
  IconChecklist,
  IconProgress,
} from '@tabler/icons-react';
import resultSheetApi from '@/api/tenant/result-sheet/resultSheetApi';
import StatCard from '@/components/shared/StatCard';

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
// POST /result-sheet/comment-bank. The GET also returns `meta` — which of
// the two report-card fields (class teacher's / school admin's) this
// user's bank feeds, and how complete it is — so this tab can tell the
// user plainly what they're doing here instead of leaving them to guess.
const CommentBankTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCell, setEditingCell] = useState({ rowIdx: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [hoveredCell, setHoveredCell] = useState({ rowIdx: null, field: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const loadCommentBank = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await resultSheetApi.getCommentBank();
      setRows(res?.data?.data ?? []);
      setMeta(res?.data?.meta ?? null);
    } catch (err) {
      console.error('Failed to fetch comment bank:', err);
      setError(err?.response?.data?.message || 'Failed to load comment bank. Please try again.');
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommentBank();
  }, [loadCommentBank]);

  const startEdit = (rowIdx, field, currentValue) => {
    setEditingCell({ rowIdx, field });
    setEditValue(currentValue || '');
  };

  const cancelEdit = () => {
    setEditingCell({ rowIdx: null, field: null });
    setEditValue('');
  };

  const persistCell = async (rowIdx, field, value) => {
    const row = rows[rowIdx];
    if (!row) return;
    setSaving(true);
    try {
      await resultSheetApi.saveCommentBank({
        comment_grade_id: row.comment_grade_id,
        field,
        value,
      });
      setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [field]: value } : r)));
      showSnackbar(value ? 'Comment saved successfully' : 'Comment cleared');
    } catch (err) {
      console.error('Failed to save comment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to save comment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (rowIdx) => {
    const field = editingCell.field;
    if (!field) return;
    await persistCell(rowIdx, field, editValue.trim() || null);
    cancelEdit();
  };

  // One-click clear straight from the cell — no need to open the editor
  // first just to blank something out.
  const handleQuickClear = async (rowIdx, field, e) => {
    e.stopPropagation();
    await persistCell(rowIdx, field, null);
  };

  // ── Stats (shown up top, before the table, so the user knows where they
  // stand the moment the page loads) ──────────────────────────────────
  const { filledCells, totalCells, rowsComplete } = useMemo(() => {
    let filled = 0;
    let complete = 0;
    rows.forEach((row) => {
      const rowFilled = BANDS.filter((b) => row[b.field]).length;
      filled += rowFilled;
      if (rowFilled === BANDS.length) complete += 1;
    });
    return {
      filledCells: meta?.filled_cells ?? filled,
      totalCells: meta?.total_cells ?? rows.length * BANDS.length,
      rowsComplete: complete,
    };
  }, [rows, meta]);

  const completionPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  const roleBanner = useMemo(() => {
    if (!meta?.type) {
      return {
        severity: 'warning',
        text: "Your account role doesn't generate report-card comments from a bank — anything saved here won't be used by Generate Remarks.",
      };
    }
    if (meta.type === 'class_teacher') {
      return {
        severity: 'info',
        text: "You're filling this in as the Class Teacher. On the Broadsheet, clicking Generate Remarks turns these templates into each student's Class Teacher's Comment, based on their score range and affective/psychomotor average.",
      };
    }
    return {
      severity: 'info',
      text: "You're filling this in as the School Admin. On the Broadsheet, clicking Generate Remarks turns these templates into each student's Head of School Comment, based on their score range and affective/psychomotor average.",
    };
  }, [meta]);

  const renderEditableCell = (rowIdx, field, value) => {
    const isEditing = editingCell.rowIdx === rowIdx && editingCell.field === field;
    const isHovered = hoveredCell.rowIdx === rowIdx && hoveredCell.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <TextField
            size="small"
            multiline
            minRows={2}
            maxRows={5}
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEdit();
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
            autoFocus
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleSave(rowIdx)}
              disabled={saving}
              sx={{ fontSize: 10, minWidth: 0, px: 1 }}
            >
              {saving ? <CircularProgress size={12} color="inherit" /> : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={cancelEdit}
              disabled={saving}
              sx={{ fontSize: 10, minWidth: 0, px: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      );
    }

    return (
      <Box
        onClick={() => startEdit(rowIdx, field, value)}
        onMouseEnter={() => setHoveredCell({ rowIdx, field })}
        onMouseLeave={() => setHoveredCell({ rowIdx: null, field: null })}
        sx={{
          position: 'relative',
          minHeight: 44,
          width: 250,
          cursor: 'pointer',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: value ? 'transparent' : isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
          bgcolor: isHovered ? 'action.hover' : 'transparent',
          p: 0.75,
          pr: value ? 3.5 : 0.75,
          transition: 'background-color 120ms ease',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: value ? 'text.primary' : 'text.secondary',
            fontStyle: value ? 'normal' : 'italic',
            fontSize: 13,
          }}
        >
          {value || 'Click to add a comment'}
        </Typography>
        {isHovered && (
          <IconPencil
            size={14}
            style={{ position: 'absolute', top: 6, right: value ? 28 : 6, opacity: 0.6 }}
          />
        )}
        {value && isHovered && (
          <Tooltip title="Clear this comment" arrow>
            <Box
              component="span"
              onClick={(e) => handleQuickClear(rowIdx, field, e)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                color: 'error.main',
                '&:hover': { bgcolor: 'error.main', color: '#fff' },
              }}
            >
              <IconX size={13} />
            </Box>
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor, mt: 2 }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Comment Bank
        </Typography>
        <Tooltip
          title="Each score range (row) × domain-average band (column) is one reusable comment template. Click any cell to add or edit it — Generate Remarks on the Broadsheet picks the right cell for each student automatically."
          arrow
        >
          <Chip
            icon={<IconHelp size={14} />}
            label="?"
            size="small"
            color="info"
            sx={{ height: 22, fontSize: 11, cursor: 'help', '& .MuiChip-icon': { ml: 0.3 } }}
          />
        </Tooltip>
        {meta?.label && (
          <Chip
            icon={<IconUserCheck size={14} />}
            label={`Filling in as: ${meta.label}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={loadCommentBank} disabled={loading}>
          {loading ? <CircularProgress size={14} color="inherit" /> : 'Refresh'}
        </Button>
      </Box>

      {/* ── Body (tinted so the white cards/table below don't read flat) ── */}
      <Box sx={{ p: 2, bgcolor: isDark ? 'background.default' : '#F3F4F6', borderRadius: '0 0 14px 14px' }}>
        {/* ── Role / purpose guidance ───────────────────────── */}
        {!loading && !error && (
          <Alert severity={roleBanner.severity} sx={{ borderRadius: '10px', mb: 2 }}>
            {roleBanner.text}
          </Alert>
        )}

        {/* ── Stats ──────────────────────────────────────────── */}
        {!loading && !error && rows.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <StatCard
              count={`${filledCells}/${totalCells}`}
              label="Templates Filled"
              subtitle="Across every score range and band"
              icon={IconChecklist}
              colorIndex={0}
            />
            <StatCard
              count={`${completionPct}%`}
              label="Completion"
              subtitle={completionPct === 100 ? 'Fully covered' : 'Keep going'}
              icon={IconProgress}
              colorIndex={completionPct === 100 ? 1 : 3}
              progress={completionPct}
            />
            <StatCard
              count={`${rowsComplete}/${rows.length}`}
              label="Score Ranges Covered"
              subtitle="All 4 bands filled for the row"
              icon={IconUserCheck}
              colorIndex={1}
            />
          </Stack>
        )}

        {/* ── States ─────────────────────────────────────────── */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── Table ──────────────────────────────────────────── */}
        <Box
          sx={{
            p: 2,
            overflowX: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '14px',
            border: '1px solid',
            borderColor,
          }}
        >
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={30} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading comment bank...
              </Typography>
            </Box>
          ) : rows.length === 0 && !error ? (
            <Alert severity="info">
              No comment grades found. Run the CommentGradeSeeder (database/seeders/Tenant/CommentGradeSeeder) to
              populate the score ranges.
            </Alert>
          ) : (
            <Table
              size="small"
              sx={{
                minWidth: 1200,
                '& .MuiTableCell-root': { py: 1.5, px: 1.5, borderRight: `1px solid ${borderColor}` },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: 700,
                      width: '10%',
                      textAlign: 'center',
                      bgcolor: isDark ? 'grey.900' : 'grey.50',
                    }}
                  >
                    Score Range
                  </TableCell>
                  <TableCell colSpan={BANDS.length} sx={{ fontWeight: 700, textAlign: 'center', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                    Attendance Affectives and Psychomotor Domain average
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: 700,
                      width: '8%',
                      textAlign: 'center',
                      bgcolor: isDark ? 'grey.900' : 'grey.50',
                    }}
                  >
                    Row Status
                  </TableCell>
                </TableRow>
                <TableRow>
                  {BANDS.map((band) => (
                    <TableCell
                      key={band.field}
                      sx={{ fontWeight: 700, textAlign: 'center', width: '20%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}
                    >
                      {band.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => {
                  const rowFilled = BANDS.filter((b) => row[b.field]).length;
                  const rowDone = rowFilled === BANDS.length;
                  return (
                    <TableRow key={row.comment_grade_id || i}>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{row.grade_score}</TableCell>
                      {BANDS.map((band) => (
                        <TableCell key={band.field}>{renderEditableCell(i, band.field, row[band.field])}</TableCell>
                      ))}
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${rowFilled}/${BANDS.length}`}
                          color={rowDone ? 'success' : rowFilled > 0 ? 'warning' : 'default'}
                          variant={rowDone ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>

      {/* ── Snackbar ─────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CommentBankTab;
