import { useEffect, useMemo, useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert,
} from '@mui/material';
import { IconDownload } from '@tabler/icons-react';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';

const DownloadCombinedDialog = ({ open, onClose, allocations, filter }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState('');
  const [caOptions, setCaOptions] = useState([]);

  const className = allocations?.[0]?.class_name || 'Selected Class';

  const subjects = useMemo(
    () => (allocations || []).map((a) => ({ id: a.subject_id, subject_name: a.subject_name })),
    [allocations]
  );

  // Load CA types from the marks configuration for the selected session/term,
  // same parsing pattern as the InputScore dialog.
  useEffect(() => {
    if (!open || !filter?.session_id || !filter?.term_id || !filter?.programme_id) {
      setCaOptions([]);
      return;
    }
    let cancelled = false;
    const loadConfig = async () => {
      try {
        const res = await scoreManagerApi.fetchMarksConfiguration({
          session_id: filter.session_id,
          term_id: filter.term_id,
          programme_id: filter.programme_id,
        });
        const configData = res?.data?.data?.[0];
        let parsed = [];
        if (configData?.ca_content) {
          const raw = typeof configData.ca_content === 'string'
            ? JSON.parse(configData.ca_content)
            : configData.ca_content;
          if (Array.isArray(raw)) {
            parsed = raw;
          } else if (typeof raw === 'object' && raw !== null) {
            parsed = Object.values(raw);
          }
        }
        if (!cancelled) setCaOptions(parsed);
      } catch (err) {
        console.error('Failed to fetch marks configuration:', err);
        if (!cancelled) setCaOptions([]);
      }
    };
    loadConfig();
    return () => { cancelled = true; };
  }, [open, filter?.session_id, filter?.term_id, filter?.programme_id]);

  // Reset the selection whenever the dialog opens or options change
  useEffect(() => {
    setSelection('');
  }, [open, caOptions.length]);

  // Dropdown options: one entry per configured CA type + Exam
  const options = useMemo(() => {
    const list = caOptions.map((ca, i) => ({
      value: `ca:${ca.display_name || `CA${i + 1}`}`,
      label: ca.display_name || `CA${i + 1}`,
    }));
    list.push({ value: 'exam', label: 'Exam' });
    return list;
  }, [caOptions]);

  const handleDownload = async () => {
    setError('');
    setLoading(true);
    try {
      const [category, displayName] = selection.startsWith('ca:')
        ? ['ca', selection.slice(3)]
        : ['exam', undefined];

      const res = await scoreManagerApi.downloadCombinedScoresheet({
        session_id: filter.session_id,
        term_id: filter.term_id,
        programme_id: filter.programme_id,
        class_arm_id: filter.class_arm_id,
        class_id: filter.class_id || undefined,
        subject_ids: subjects.map((s) => s.id),
        category,
        display_name: displayName,
      });

      // Response is a binary Excel blob — build an object URL and trigger download
      const disposition = res?.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1] || `${className}_${category.toUpperCase()}_scoresheet.xlsx`;

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('Failed to download scoresheet:', err);
      setError(err?.response?.data?.message || 'Failed to download the scoresheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelection('');
    setError('');
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Download Bulk — ${className} Combined Subjects`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a score category to download the combined score sheet template for all listed subjects.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selection}
          label="Category"
          onChange={(e) => setSelection(e.target.value)}
        >
          <MenuItem value="">--Select category--</MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selection && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click download to get the combined Excel template for <strong>{selection.startsWith('ca:') ? selection.slice(3) : 'Exam'}</strong> scores,
          pre-filled with all registered students in {className}.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button variant="contained" size="small" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconDownload size={16} />}
          disabled={!selection || loading}
          onClick={handleDownload}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default DownloadCombinedDialog;
