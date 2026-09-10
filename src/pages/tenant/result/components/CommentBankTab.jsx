import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  useTheme, TextField, Button, CircularProgress, Tooltip, Chip, Stack,
} from '@mui/material';
import { IconHelp, IconListNumbers, IconGridDots, IconCheck, IconX } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';

const initialBankComments = [
  { id: 1, grade_score: '90-100', comment1: 'An excellent performance. Keep it up!', comment2: 'A brilliant student with outstanding results.', comment3: 'Exceptional performance across all areas.' },
  { id: 2, grade_score: '80-89', comment1: 'Very good effort. Sustained this standard.', comment2: 'Good performance with room for improvement.', comment3: 'A hardworking student.' },
  { id: 3, grade_score: '70-79', comment1: 'Good performance. Keep pushing higher.', comment2: 'Above average, can do better.', comment3: 'Consistent effort shown.' },
  { id: 4, grade_score: '60-69', comment2: 'Fair performance. More effort needed.', comment3: 'Needs to improve on weak areas.' },
  { id: 5, grade_score: '50-59', comment1: 'Average performance. Needs more dedication.', comment2: 'Below average. Requires parental support.', comment3: 'Needs serious attention.' },
  { id: 6, grade_score: '40-49', comment1: 'Below expectations. Needs serious attention.', comment2: 'Poor performance. More effort required.', comment3: 'Needs to attend tutorials.' },
  { id: 7, grade_score: '30-39', comment1: 'Poor performance. Urgent improvement needed.', comment2: 'Very poor. Requires immediate intervention.', comment3: 'Not meeting basic standards.' },
  { id: 8, grade_score: '0-29', comment1: 'Very poor performance. Needs urgent help.', comment2: 'Highly unsatisfactory. Seek help immediately.', comment3: 'Requires special attention.' },
];

const CommentBankTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB';

  const [bankComments, setBankComments] = useState(initialBankComments);
  const [editingCell, setEditingCell] = useState({ rowIdx: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDoubleClick = (rowIdx, field, currentValue) => {
    setEditingCell({ rowIdx, field });
    setOriginalValue(currentValue || '');
    setEditValue(currentValue || '');
  };

  const handleSave = (rowIdx) => {
    setSaving(true);
    setTimeout(() => {
      setBankComments(prev => prev.map((row, i) => {
        if (i !== rowIdx) return row;
        return { ...row, [editingCell.field]: editValue.trim() || null };
      }));
      setEditingCell({ rowIdx: null, field: null });
      setSaving(false);
    }, 500);
  };

  const handleClear = (rowIdx) => {
    setBankComments(prev => prev.map((row, i) => {
      if (i !== rowIdx) return row;
      return { ...row, [editingCell.field]: originalValue || null };
    }));
    setEditingCell({ rowIdx: null, field: null });
  };

  const renderEditableCell = (rowIdx, field, value) => {
    const isEditing = editingCell.rowIdx === rowIdx && editingCell.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <TextField
            size="small" multiline minRows={2} maxRows={5} fullWidth
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #000' } }}
            autoFocus
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
            <Button variant="contained" size="small" onClick={() => handleSave(rowIdx)} disabled={saving}
              sx={{ fontSize: 10, minWidth: 0, px: 1 }}>
              {saving ? <CircularProgress size={12} /> : 'Save'}
            </Button>
            <Button variant="outlined" size="small" color="error" onClick={() => handleClear(rowIdx)}
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

  // Compute stats
  const totalCells = bankComments.length * 3;
  const filledCells = bankComments.reduce((count, row) => {
    return count + (row.comment1 ? 1 : 0) + (row.comment2 ? 1 : 0) + (row.comment3 ? 1 : 0);
  }, 0);

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor }}>
      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2, pb: 0 }}>
        <StatCard count={bankComments.length} label="Score Ranges" subtitle="Editable comment rows" icon={IconListNumbers} colorIndex={0} loading={false} />
        <StatCard count={totalCells} label="Total Cells" subtitle="8 rows x 3 columns" icon={IconGridDots} colorIndex={1} loading={false} />
        <StatCard count={filledCells} label="Filled" subtitle="Comments completed" icon={IconCheck} colorIndex={2} loading={false} />
        <StatCard count={totalCells - filledCells} label="Empty" subtitle="Awaiting input" icon={IconX} colorIndex={3} loading={false} />
      </Stack>

      {/* ── Header ──────────────────────────────────────────── */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${borderColor}` }}>
        <Typography variant="h6" fontWeight={700}>Comment Bank</Typography>
        <Tooltip title="Add and edit result comments here." arrow>
          <Chip icon={<IconHelp size={14} />} label="?" size="small" color="info"
            sx={{ height: 22, fontSize: 11, cursor: 'help', '& .MuiChip-icon': { ml: 0.3 } }} />
        </Tooltip>
      </Box>

      {/* ── Table ───────────────────────────────────────────── */}
      <Box sx={{ p: 2, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900, '& .MuiTableCell-root': { py: 1.5, px: 1.5, borderRight: `1px solid ${borderColor}` } }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={{ fontWeight: 700, width: '15%', textAlign: 'center', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                Score Range
              </TableCell>
              <TableCell colSpan={3} sx={{ fontWeight: 700, textAlign: 'center', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>
                Attendance Affectives and Psychomotor Domain average
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: '25%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>0-2</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: '25%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>3-4</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', width: '25%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>5</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bankComments.map((row, i) => (
              <TableRow key={row.id || i}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {row.grade_score}
                </TableCell>
                <TableCell>
                  {renderEditableCell(i, 'comment1', row.comment1)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(i, 'comment2', row.comment2)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(i, 'comment3', row.comment3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default CommentBankTab;
