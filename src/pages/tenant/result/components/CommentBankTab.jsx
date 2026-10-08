import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  TextField,
  Button,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Skeleton,
  IconButton,
  Select,
} from '@mui/material';
import {
  IconInfoCircle,
  IconUpload,
  IconDownload,
  IconPlus,
  IconSchool,
  IconFileText,
  IconEye,
  IconChevronDown,
  IconSparkles,
  IconWand,
  IconQuote,
  IconCopy,
  IconTrash,
  IconRefresh,
  IconPencil,
  IconX,
  IconMoodSad,
  IconMoodNeutral,
  IconMoodSmile,
  IconStarFilled,
} from '@tabler/icons-react';
import commentBankApi from '@/api/tenant/comment-bank/commentBankApi';

// The four attendance/affective/psychomotor average bands — physical
// columns on comment_banks (see basic_v2_be's CommentBank::BAND_COLUMNS).
const BANDS = [
  { field: 'comment1', label: '0 – 1.0', title: 'Needs Improvement', Icon: IconMoodSad, color: '#b91c1c', bg: '#fca5a5' },
  { field: 'comment2', label: '1.1 – 1.9', title: 'Fair', Icon: IconMoodNeutral, color: '#b45309', bg: '#fcd34d' },
  { field: 'comment3', label: '2.0 – 3.9', title: 'Good', Icon: IconMoodSmile, color: '#15803d', bg: '#86efac' },
  { field: 'comment4', label: '4.0 – 5.0', title: 'Excellent', Icon: IconStarFilled, color: '#1d4ed8', bg: '#93c5fd' },
];

const TONES = ['Balanced', 'Encouraging', 'Formal', 'Concise'];

const cellKey = (gradeId, field) => `${gradeId}:${field}`;

// Small CSV helpers — no new dependency for a 9x4 (36-cell) round trip.
const toCsvField = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
};

const panelTitleSx = { fontWeight: 800, fontSize: 15, color: '#0f172a' };
const cardSx = {
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  bgcolor: '#ffffff',
  p: 2,
};

// Comment Bank: the Academic Performance + Psychomotor matrix (one reusable
// comment template per score-range x domain-band cell — Generate Remarks on
// the Broadsheet picks the right cell automatically) and a freeform General
// Comments list. Backed by @/api/tenant/comment-bank/commentBankApi.
const CommentBankTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [mainTab, setMainTab] = useState('matrix'); // 'matrix' | 'general'
  const [scoreRangeType, setScoreRangeType] = useState('percentage'); // 'percentage' | 'grade'

  const [rows, setRows] = useState([]);
  const [completion, setCompletion] = useState({ filled: 0, remaining: 0, total: 0, percent: 0 });
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCell, setEditingCell] = useState({ gradeId: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [hoveredCell, setHoveredCell] = useState({ gradeId: null, field: null });
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [previewCell, setPreviewCell] = useState(null); // { row, band }
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [tone, setTone] = useState('Balanced');
  const [aiLoading, setAiLoading] = useState(null); // 'auto-fill' | 'improve' | null
  const [quickActionLoading, setQuickActionLoading] = useState(null);

  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [exampleOpen, setExampleOpen] = useState(false);
  const [addDialog, setAddDialog] = useState({ open: false, gradeId: '', field: '', category: '', comment: '' });
  const importInputRef = useRef(null);

  // General comments
  const [generalComments, setGeneralComments] = useState([]);
  const [generalLoading, setGeneralLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await commentBankApi.getMatrix();
      setRows(res?.data?.data ?? []);
      setCompletion(res?.data?.completion ?? { filled: 0, remaining: 0, total: 0, percent: 0 });
      setMeta(res?.data?.meta ?? null);
    } catch (err) {
      console.error('Failed to fetch comment bank:', err);
      setError(err?.response?.data?.message || 'Failed to load comment bank. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGeneralComments = useCallback(async () => {
    setGeneralLoading(true);
    try {
      const res = await commentBankApi.getGeneralComments();
      setGeneralComments(res?.data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch general comments:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to load general comments', 'error');
    } finally {
      setGeneralLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  useEffect(() => {
    if (mainTab === 'general' && generalComments.length === 0) loadGeneralComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab]);

  // Completion is always derived live from `rows` — never frozen at
  // whatever the last full-page load happened to return.
  const liveCompletion = useMemo(() => {
    let filled = 0;
    rows.forEach((row) => {
      filled += BANDS.filter((b) => row[b.field]).length;
    });
    const total = rows.length * BANDS.length;
    return {
      filled,
      remaining: total - filled,
      total,
      percent: total > 0 ? Math.round((filled / total) * 100) : 0,
    };
  }, [rows]);

  useEffect(() => {
    setCompletion((prev) => ({ ...prev, ...liveCompletion }));
  }, [liveCompletion]);

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
        text: "You're filling this in as the Class Teacher — Generate Remarks on the Broadsheet turns these into each student's Class Teacher's Comment.",
      };
    }
    return {
      severity: 'info',
      text: "You're filling this in as the School Admin — Generate Remarks on the Broadsheet turns these into each student's Head of School Comment.",
    };
  }, [meta]);

  /* ── Cell edit ──────────────────────────────────────────────── */

  const startEdit = (gradeId, field, currentValue) => {
    setEditingCell({ gradeId, field });
    setEditValue(currentValue || '');
  };
  const cancelEdit = () => setEditingCell({ gradeId: null, field: null });

  const persistCell = async (gradeId, field, value) => {
    setSaving(true);
    try {
      await commentBankApi.saveCell({ comment_grade_id: gradeId, field, value });
      setRows((prev) => prev.map((r) => (r.comment_grade_id === gradeId ? { ...r, [field]: value } : r)));
      showSnackbar(value ? 'Comment saved' : 'Comment cleared');
    } catch (err) {
      console.error('Failed to save comment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to save comment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (gradeId) => {
    if (!editingCell.field) return;
    await persistCell(gradeId, editingCell.field, editValue.trim() || null);
    cancelEdit();
  };

  const handleQuickClear = async (e, gradeId, field) => {
    e.stopPropagation();
    await persistCell(gradeId, field, null);
  };

  /* ── Selection + preview ───────────────────────────────────── */

  const toggleSelected = (e, gradeId, field) => {
    e.stopPropagation();
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const key = cellKey(gradeId, field);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openPreview = (row, band) => setPreviewCell({ row, band });

  const selectedCellsPayload = () =>
    Array.from(selectedKeys).map((key) => {
      const [gradeId, field] = key.split(':');
      return { comment_grade_id: Number(gradeId), field };
    });

  /* ── AI Comment Assistant + Quick Actions ──────────────────── */

  const runAction = async (fn, { loadingSetter, loadingValue, successMessage, requireSelection } = {}) => {
    if (requireSelection && selectedKeys.size === 0) {
      showSnackbar('Select at least one cell first', 'error');
      return;
    }
    loadingSetter?.(loadingValue ?? true);
    try {
      const res = await fn();
      await loadMatrix();
      showSnackbar(res?.data?.message || successMessage || 'Done');
    } catch (err) {
      console.error('Comment bank action failed:', err);
      showSnackbar(err?.response?.data?.message || 'Action failed', 'error');
    } finally {
      loadingSetter?.(null);
    }
  };

  const handleAutoFill = (scopeToSelection = false) =>
    runAction(() => commentBankApi.autoFill({ cells: scopeToSelection ? selectedCellsPayload() : undefined, tone }), {
      loadingSetter: setAiLoading,
      loadingValue: 'auto-fill',
      requireSelection: scopeToSelection,
    });

  const handleImprove = (scopeToSelection = false) =>
    runAction(() => commentBankApi.improve({ cells: scopeToSelection ? selectedCellsPayload() : undefined, tone }), {
      loadingSetter: setAiLoading,
      loadingValue: 'improve',
      requireSelection: scopeToSelection,
    });

  const handleCopyFromHigher = () =>
    runAction(() => commentBankApi.copyFromHigher({ cells: selectedCellsPayload() }), {
      loadingSetter: setQuickActionLoading,
      loadingValue: 'copy',
      requireSelection: true,
    });

  const handleClearSelected = () =>
    runAction(() => commentBankApi.clear({ cells: selectedCellsPayload() }), {
      loadingSetter: setQuickActionLoading,
      loadingValue: 'clear',
      requireSelection: true,
    }).then(() => setSelectedKeys(new Set()));

  const handleResetDefault = () =>
    runAction(() => commentBankApi.resetDefault({}), {
      loadingSetter: setQuickActionLoading,
      loadingValue: 'reset',
      successMessage: 'Restored the system default comments',
    });

  /* ── Bulk Actions menu ──────────────────────────────────────── */

  const selectAll = () => {
    const all = new Set();
    rows.forEach((row) => BANDS.forEach((b) => all.add(cellKey(row.comment_grade_id, b.field))));
    setSelectedKeys(all);
    setBulkMenuAnchor(null);
  };
  const clearSelection = () => {
    setSelectedKeys(new Set());
    setBulkMenuAnchor(null);
  };

  /* ── Import / Export ───────────────────────────────────────── */

  const handleExportCsv = () => {
    const header = ['Score Range', 'Remark', 'Grade', ...BANDS.map((b) => `${b.label} (${b.title})`)];
    const lines = [header.map(toCsvField).join(',')];
    rows.forEach((row) => {
      const line = [row.grade_score, row.remark, row.grade, ...BANDS.map((b) => row[b.field] || '')];
      lines.push(line.map(toCsvField).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comment-bank.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuAnchor(null);
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    const table = parseCsv(text);
    if (table.length < 2) {
      showSnackbar('That file has no data rows to import', 'error');
      return;
    }

    const [, ...dataRows] = table;
    const cells = [];
    dataRows.forEach((cols) => {
      const [scoreRange, , , ...bandValues] = cols;
      const matchedRow = rows.find((r) => r.grade_score === scoreRange);
      if (!matchedRow) return;
      BANDS.forEach((b, i) => {
        if (bandValues[i] !== undefined && bandValues[i] !== '') {
          cells.push({ comment_grade_id: matchedRow.comment_grade_id, field: b.field, value: bandValues[i] });
        }
      });
    });

    if (cells.length === 0) {
      showSnackbar("Couldn't match any rows in that file to the current score ranges", 'error');
      return;
    }

    try {
      const res = await commentBankApi.importCells({ cells });
      await loadMatrix();
      showSnackbar(res?.data?.message || 'Imported successfully');
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Import failed', 'error');
    }
  };

  /* ── Add Custom Comment dialog ─────────────────────────────── */

  const openAddDialog = () =>
    setAddDialog({
      open: true,
      gradeId: mainTab === 'matrix' ? rows[0]?.comment_grade_id ?? '' : '',
      field: mainTab === 'matrix' ? BANDS[0].field : '',
      category: '',
      comment: '',
    });

  const closeAddDialog = () => setAddDialog((d) => ({ ...d, open: false }));

  const submitAddDialog = async () => {
    if (!addDialog.comment.trim()) return;
    try {
      if (mainTab === 'matrix') {
        await persistCell(Number(addDialog.gradeId), addDialog.field, addDialog.comment.trim());
      } else {
        await commentBankApi.createGeneralComment({
          category: addDialog.category.trim() || null,
          comment: addDialog.comment.trim(),
        });
        await loadGeneralComments();
        showSnackbar('Comment added');
      }
      closeAddDialog();
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to add comment', 'error');
    }
  };

  /* ── General comments: delete ───────────────────────────────── */

  const handleDeleteGeneral = async (id) => {
    try {
      await commentBankApi.deleteGeneralComment(id);
      setGeneralComments((prev) => prev.filter((c) => c.id !== id));
      showSnackbar('Comment deleted');
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  /* ── Render helpers ─────────────────────────────────────────── */

  const renderCell = (row, band) => {
    const { field } = band;
    const value = row[field];
    const gradeId = row.comment_grade_id;
    const isEditing = editingCell.gradeId === gradeId && editingCell.field === field;
    const isHovered = hoveredCell.gradeId === gradeId && hoveredCell.field === field;
    const isSelected = selectedKeys.has(cellKey(gradeId, field));
    const isPreviewed = previewCell?.row?.comment_grade_id === gradeId && previewCell?.band?.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, minWidth: 220 }}>
          <TextField
            size="small"
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEdit();
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 12.5 } }}
            autoFocus
          />
          <Stack spacing={0.5} flexShrink={0}>
            <Button variant="contained" size="small" onClick={() => handleSave(gradeId)} disabled={saving} sx={{ fontSize: 10, minWidth: 0, px: 1 }}>
              {saving ? <Skeleton variant="text" width={28} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.6)' }} /> : 'Save'}
            </Button>
            <Button variant="outlined" size="small" onClick={cancelEdit} disabled={saving} sx={{ fontSize: 10, minWidth: 0, px: 1 }}>
              Cancel
            </Button>
          </Stack>
        </Box>
      );
    }

    return (
      <Box
        onClick={() => openPreview(row, band)}
        onMouseEnter={() => setHoveredCell({ gradeId, field })}
        onMouseLeave={() => setHoveredCell({ gradeId: null, field: null })}
        sx={{
          position: 'relative',
          minHeight: 64,
          minWidth: 210,
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isPreviewed ? '#2563eb' : 'transparent',
          bgcolor: isHovered ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.03)') : 'transparent',
          p: 1,
          pl: 3.25,
          pr: 3,
          transition: 'background-color 120ms ease, border-color 120ms ease',
        }}
      >
        <Checkbox
          size="small"
          checked={isSelected}
          onClick={(e) => toggleSelected(e, gradeId, field)}
          sx={{ position: 'absolute', top: 2, left: 0, p: 0.4 }}
        />
        <Typography sx={{ fontSize: 12.5, color: value ? '#334155' : '#94a3b8', fontStyle: value ? 'normal' : 'italic', lineHeight: 1.4 }}>
          {value || 'Click to add a comment'}
        </Typography>
        {isHovered && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              startEdit(gradeId, field, value);
            }}
            sx={{ position: 'absolute', top: 2, right: value ? 26 : 2, p: 0.4 }}
          >
            <IconPencil size={13} />
          </IconButton>
        )}
        {value && isHovered && (
          <Tooltip title="Clear this comment" arrow>
            <IconButton size="small" onClick={(e) => handleQuickClear(e, gradeId, field)} sx={{ position: 'absolute', top: 2, right: 2, p: 0.4, color: '#dc2626' }}>
              <IconX size={13} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  /* ── JSX ────────────────────────────────────────────────────── */

  return (
    <Box sx={{ bgcolor: isDark ? 'transparent' : '#f1f5f9', borderRadius: '18px', p: { xs: 1.5, sm: 2.5 } }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="h5" fontWeight={800}>
              Comment Bank
            </Typography>
            <Tooltip title="Each score range (row) x psychomotor/behaviour band (column) is one reusable comment template. Generate Remarks on the Broadsheet picks the right cell for each student automatically." arrow>
              <IconInfoCircle size={18} color="#94a3b8" style={{ cursor: 'help' }} />
            </Tooltip>
          </Stack>
          <Typography sx={{ fontSize: 13, color: '#64748b', mt: 0.25 }}>
            Create and manage generic comments based on academic performance and psychomotor (behaviour/affective) ratings.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <input ref={importInputRef} type="file" accept=".csv" hidden onChange={handleImportFile} />
          <Button variant="outlined" size="small" startIcon={<IconUpload size={15} />} onClick={handleImportClick} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Import
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconDownload size={15} />}
            endIcon={<IconChevronDown size={14} />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Export
          </Button>
          <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
            <MenuItem onClick={handleExportCsv}>Export as CSV</MenuItem>
          </Menu>
          <Button variant="contained" size="small" startIcon={<IconPlus size={15} />} onClick={openAddDialog} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Add Custom Comment
          </Button>
        </Stack>
      </Stack>

      {/* ── Main tabs (left) + Score Range Type (right, matrix only) ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          {[
            { key: 'matrix', label: 'Academic Performance + Psychomotor', Icon: IconSchool },
            { key: 'general', label: 'General Comments', Icon: IconFileText },
          ].map(({ key, label, Icon }) => (
            <Box
              key={key}
              onClick={() => setMainTab(key)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.75,
                py: 1,
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: mainTab === key ? '#2563eb' : '#e2e8f0',
                bgcolor: mainTab === key ? '#2563eb' : '#f1f5f9',
                color: mainTab === key ? '#fff' : '#334155',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              <Icon size={16} />
              {label}
            </Box>
          ))}
        </Stack>

        {mainTab === 'matrix' && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Score Range Type</Typography>
              <Tooltip title="Switch the row header between a raw percentage range and its equivalent WAEC-style letter grade. The underlying templates don't change — this only changes how the row is labeled." arrow>
                <IconInfoCircle size={14} color="#94a3b8" style={{ cursor: 'help' }} />
              </Tooltip>
            </Stack>
            <Stack direction="row" sx={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              {[
                { key: 'percentage', label: 'Percentage (0 – 100)' },
                { key: 'grade', label: 'Grade (A – F)' },
              ].map((opt) => (
                <Box
                  key={opt.key}
                  onClick={() => setScoreRangeType(opt.key)}
                  sx={{
                    px: 1.5,
                    py: 0.6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: scoreRangeType === opt.key ? '#2563eb' : '#f1f5f9',
                    color: scoreRangeType === opt.key ? '#fff' : '#475569',
                    transition: 'all 120ms ease',
                  }}
                >
                  {opt.label}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>

      {mainTab === 'matrix' && (
        <>
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}
          {!loading && !error && (
            <Alert severity={roleBanner.severity} sx={{ mb: 2, borderRadius: '10px' }}>
              {roleBanner.text}
            </Alert>
          )}

          {/* ── Main grid: Matrix (left) + sidebar (right) ──────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' }, gap: 2, alignItems: 'start' }}>
            {/* Comment Matrix */}
            <Box sx={{ ...cardSx, borderTop: '3px solid #2563eb' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Box>
                  <Typography sx={panelTitleSx}>Comment Matrix</Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#64748b' }}>
                    Enter a generic comment for each combination of academic score range and psychomotor/behaviour rating.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexShrink={0}>
                  <Button variant="outlined" size="small" startIcon={<IconEye size={14} />} onClick={() => setExampleOpen(true)} sx={{ textTransform: 'none', fontSize: 12 }}>
                    View Example
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<IconChevronDown size={14} />}
                    onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    sx={{ textTransform: 'none', fontSize: 12 }}
                  >
                    Bulk Actions
                  </Button>
                  <Menu anchorEl={bulkMenuAnchor} open={Boolean(bulkMenuAnchor)} onClose={() => setBulkMenuAnchor(null)}>
                    <MenuItem onClick={selectAll}>Select all cells</MenuItem>
                    <MenuItem onClick={clearSelection} disabled={selectedKeys.size === 0}>
                      Clear selection ({selectedKeys.size})
                    </MenuItem>
                  </Menu>
                </Stack>
              </Stack>

              <Box sx={{ overflowX: 'auto' }}>
                {loading ? (
                  <Stack spacing={0.75} sx={{ mt: 1 }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: '8px' }} />
                    ))}
                  </Stack>
                ) : rows.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    No comment grades found.
                  </Alert>
                ) : (
                  <Table size="small" sx={{ minWidth: 980, '& .MuiTableCell-root': { p: 0.75, verticalAlign: 'top' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: 11.5, color: '#64748b', width: 150 }}>
                          Academic Performance
                          <br />
                          <Typography component="span" sx={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>
                            (Score Range %)
                          </Typography>
                        </TableCell>
                        {BANDS.map((b) => (
                          <TableCell key={b.field} align="center" sx={{ fontWeight: 800, fontSize: 11, color: '#334155', bgcolor: `${b.bg}99` }}>
                            <Stack alignItems="center" spacing={0.25}>
                              <b.Icon size={16} color={b.color} />
                              <span>{b.label}</span>
                              <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: b.color }}>{b.title}</Typography>
                            </Stack>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={BANDS.length + 1} sx={{ py: '2px !important', borderBottom: '2px solid #e2e8f0' }}>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textAlign: 'center' }}>
                            Psychomotor / Behaviour Rating (Average)
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.comment_grade_id}>
                          <TableCell sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px 0 0 8px' }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>
                              {scoreRangeType === 'grade' ? row.grade : row.grade_score}
                            </Typography>
                            <Typography sx={{ fontSize: 10.5, color: '#64748b' }}>({row.remark})</Typography>
                          </TableCell>
                          {BANDS.map((b) => (
                            <TableCell key={b.field} sx={{ bgcolor: `${b.bg}66` }}>
                              {renderCell(row, b)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </Box>

            {/* ── Sidebar ────────────────────────────────────────── */}
            <Stack spacing={2}>
              {/* Completion Status */}
              <Box sx={{ ...cardSx, borderTop: '3px solid #16a34a' }}>
                <Typography sx={panelTitleSx} mb={1.5}>
                  Completion Status
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                    <svg width="88" height="88" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="38" fill="none" stroke={isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'} strokeWidth="9" />
                      <circle
                        cx="44"
                        cy="44"
                        r="38"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={2 * Math.PI * 38 * (1 - completion.percent / 100)}
                        transform="rotate(-90 44 44)"
                        style={{ transition: 'stroke-dashoffset 300ms ease' }}
                      />
                    </svg>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{completion.percent}%</Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.75} flexGrow={1}>
                    {[
                      { label: 'Filled', value: completion.filled, color: '#16a34a' },
                      { label: 'Remaining', value: completion.remaining, color: '#94a3b8' },
                      { label: 'Total', value: completion.total, color: '#334155' },
                    ].map((s) => (
                      <Stack key={s.label} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color }} />
                          <Typography sx={{ fontSize: 11.5, color: '#64748b' }}>{s.label}</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{s.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Box>

              {/* AI Comment Assistant */}
              <Box sx={{ ...cardSx, bgcolor: isDark ? cardSx.bgcolor : '#faf5ff', borderColor: '#e9d5ff', borderTop: '3px solid #9333ea' }}>
                <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mb: 0.25 }}>
                  <IconSparkles size={16} color="#9333ea" />
                  <Typography sx={panelTitleSx}>AI Comment Assistant</Typography>
                  <Chip label="Beta" size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: '#f3e8ff', color: '#9333ea' }} />
                  <Tooltip title="Rule-based template suggestions (academic level + behaviour band + tone) — not a connected external AI model." arrow>
                    <IconInfoCircle size={13} color="#94a3b8" style={{ cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <Typography sx={{ fontSize: 11, color: '#64748b', mb: 1.25 }}>
                  Auto-generate or improve comments using score range and psychomotor rating.
                </Typography>

                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#334155', mb: 0.4 }}>Tone</Typography>
                <Select size="small" fullWidth value={tone} onChange={(e) => setTone(e.target.value)} sx={{ fontSize: 12.5, mb: 1.25 }}>
                  {TONES.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: 12.5 }}>
                      {t === 'Balanced' ? 'Balanced (Default)' : t}
                    </MenuItem>
                  ))}
                </Select>

                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={
                      aiLoading === 'auto-fill' ? (
                        <Skeleton variant="circular" width={15} height={15} sx={{ bgcolor: 'rgba(255,255,255,0.6)' }} />
                      ) : (
                        <IconSparkles size={15} />
                      )
                    }
                    onClick={() => handleAutoFill(false)}
                    disabled={Boolean(aiLoading)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg,#9333ea,#2563eb)',
                      '&:hover': { background: 'linear-gradient(90deg,#7e22ce,#1d4ed8)' },
                    }}
                  >
                    Auto-fill Empty Comments
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={aiLoading === 'improve' ? <Skeleton variant="circular" width={15} height={15} /> : <IconWand size={15} />}
                    onClick={() => handleImprove(false)}
                    disabled={Boolean(aiLoading)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Improve All Comments
                  </Button>
                </Stack>
              </Box>

              {/* Selected Comment Preview */}
              <Box sx={{ ...cardSx, borderTop: '3px solid #2563eb' }}>
                <Typography sx={panelTitleSx} mb={1}>
                  Selected Comment Preview
                </Typography>
                {previewCell ? (
                  <>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <IconQuote size={18} color="#cbd5e1" />
                      <Typography sx={{ fontSize: 12.5, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                        {previewCell.row[previewCell.band.field] || 'This cell is empty — click the pencil icon to add a comment.'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.5}>
                      <Chip label={`Score Range: ${previewCell.row.grade_score}`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#f1f5f9' }} />
                      <Chip label={`Psychomotor: ${previewCell.band.label}`} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#f1f5f9' }} />
                    </Stack>
                  </>
                ) : (
                  <Typography sx={{ fontSize: 11.5, color: '#94a3b8' }}>Click any cell in the matrix to preview it here.</Typography>
                )}
              </Box>

              {/* Quick Actions */}
              <Box sx={{ ...cardSx, borderTop: '3px solid #f59e0b' }}>
                <Typography sx={panelTitleSx} mb={1}>
                  Quick Actions
                </Typography>
                <Stack spacing={0.5}>
                  {[
                    {
                      key: 'auto-fill',
                      Icon: IconSparkles,
                      color: '#9333ea',
                      title: 'Auto-fill empty cells',
                      subtitle: 'Generate comments for all remaining cells',
                      onClick: () => handleAutoFill(false),
                    },
                    {
                      key: 'copy',
                      Icon: IconCopy,
                      color: '#2563eb',
                      title: 'Copy from higher range',
                      subtitle: 'Use comments from higher performance range',
                      onClick: handleCopyFromHigher,
                    },
                    {
                      key: 'clear',
                      Icon: IconTrash,
                      color: '#dc2626',
                      title: 'Clear selected cells',
                      subtitle: 'Remove comments from selected cells',
                      onClick: handleClearSelected,
                    },
                    {
                      key: 'reset',
                      Icon: IconRefresh,
                      color: '#d97706',
                      title: 'Reset to default',
                      subtitle: 'Restore system default comments',
                      onClick: handleResetDefault,
                    },
                  ].map((action) => (
                    <Stack
                      key={action.key}
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      onClick={() => {
                        if (quickActionLoading) return;
                        action.onClick();
                      }}
                      sx={{
                        p: 1,
                        borderRadius: '8px',
                        cursor: quickActionLoading ? 'wait' : 'pointer',
                        opacity: quickActionLoading && quickActionLoading !== action.key ? 0.5 : 1,
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '8px',
                          bgcolor: `${action.color}1a`,
                          color: action.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {quickActionLoading === action.key ? (
                          <Skeleton variant="circular" width={16} height={16} sx={{ bgcolor: `${action.color}55` }} />
                        ) : (
                          <action.Icon size={16} />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{action.title}</Typography>
                        <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>{action.subtitle}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </>
      )}

      {/* ── General Comments tab ───────────────────────────────── */}
      {mainTab === 'general' && (
        <Box sx={cardSx}>
          <Typography sx={panelTitleSx} mb={0.25}>
            General Comments
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: '#64748b', mb: 1.5 }}>
            Freeform comment snippets you keep for yourself — not tied to a score range, picked manually rather than
            resolved automatically by Generate Remarks.
          </Typography>

          {generalLoading ? (
            <Stack spacing={1}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: '8px' }} />
              ))}
            </Stack>
          ) : generalComments.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '10px' }}>
              No general comments yet — click "Add Custom Comment" above to create your first one.
            </Alert>
          ) : (
            <Stack spacing={1}>
              {generalComments.map((c) => (
                <Stack key={c.id} direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.25, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {c.category && (
                      <Chip label={c.category} size="small" sx={{ mb: 0.5, fontSize: 10, height: 18, bgcolor: '#eff6ff', color: '#2563eb' }} />
                    )}
                    <Typography sx={{ fontSize: 12.5, color: '#334155' }}>{c.comment}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleDeleteGeneral(c.id)} sx={{ color: '#dc2626' }}>
                    <IconTrash size={15} />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* ── View Example dialog ────────────────────────────────── */}
      <Dialog open={exampleOpen} onClose={() => setExampleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Example comment</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 12.5, color: '#64748b', mb: 1 }}>
            One cell = one score range x one psychomotor band. For example, a student scoring in the "Good" range
            (70.01 – 80) with a "Good" psychomotor/behaviour average (2.0 – 3.9) would get:
          </Typography>
          <Alert severity="success" icon={<IconQuote size={16} />} sx={{ borderRadius: '10px' }}>
            He performed well this term, showing a good grasp of most topics taught. He shows good behaviour and a
            positive attitude towards school activities. Keep up the effort and continue working towards steady
            improvement.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExampleOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Custom Comment dialog ──────────────────────────── */}
      <Dialog open={addDialog.open} onClose={closeAddDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add Custom Comment</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            {mainTab === 'matrix' ? (
              <>
                <TextField
                  select
                  size="small"
                  label="Score Range"
                  value={addDialog.gradeId}
                  onChange={(e) => setAddDialog((d) => ({ ...d, gradeId: e.target.value }))}
                >
                  {rows.map((r) => (
                    <MenuItem key={r.comment_grade_id} value={r.comment_grade_id}>
                      {r.grade_score} ({r.remark})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Psychomotor Band"
                  value={addDialog.field}
                  onChange={(e) => setAddDialog((d) => ({ ...d, field: e.target.value }))}
                >
                  {BANDS.map((b) => (
                    <MenuItem key={b.field} value={b.field}>
                      {b.label} ({b.title})
                    </MenuItem>
                  ))}
                </TextField>
              </>
            ) : (
              <TextField
                size="small"
                label="Category (optional)"
                value={addDialog.category}
                onChange={(e) => setAddDialog((d) => ({ ...d, category: e.target.value }))}
              />
            )}
            <TextField
              size="small"
              label="Comment"
              multiline
              minRows={3}
              value={addDialog.comment}
              onChange={(e) => setAddDialog((d) => ({ ...d, comment: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitAddDialog} disabled={!addDialog.comment.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ───────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (t) => t.zIndex.modal + 9999 }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentBankTab;
