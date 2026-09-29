import { useEffect, useMemo, useRef, useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, LinearProgress, Alert, List, ListItem, ListItemIcon, ListItemText,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { IconUpload, IconFileSpreadsheet, IconCheck, IconX } from '@tabler/icons-react';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';

const UploadCombinedDialog = ({ open, onClose, allocations, filter, onUploaded }) => {
  const fileInputRef = useRef(null);
  const [selection, setSelection] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [rowResults, setRowResults] = useState([]);
  const [caOptions, setCaOptions] = useState([]);

  const className = allocations?.[0]?.class_name || 'Selected Class';

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
    setSelectedFile(null);
    setResult(null);
    setRowResults([]);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setRowResults([]);
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setResult(null);
      setRowResults([]);

      const [category, displayName] = selection.startsWith('ca:')
        ? ['ca', selection.slice(3)]
        : ['exam', undefined];

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('session_id', filter.session_id);
      formData.append('term_id', filter.term_id);
      formData.append('programme_id', filter.programme_id);
      formData.append('class_arm_id', filter.class_arm_id);
      formData.append('category', category);
      if (displayName) formData.append('display_name', displayName);

      const res = await scoreManagerApi.uploadCombinedScoresheet(formData);
      const payload = res?.data || {};

      if (payload.status === false) {
        setResult({
          severity: 'error',
          message: payload.message || (payload.errors || []).join(' ') || 'Upload failed. Please check the file.',
        });
        setRowResults([]);
      } else {
        const rows = payload.results || [];
        const successCount = rows.filter((r) => r.success).length;
        const warnCount = rows.filter((r) => r.warning).length;
        setResult({
          severity: successCount > 0 ? 'success' : 'warning',
          message: `${successCount} score entr${successCount === 1 ? 'y' : 'ies'} saved${
            warnCount > 0 ? `, ${warnCount} skipped` : ''
          }.`,
        });
        setRowResults(rows.slice(0, 30));
        setSelectedFile(null);
        onUploaded?.();
      }
    } catch (err) {
      const data = err?.response?.data;
      setResult({
        severity: 'error',
        message:
          data?.message ||
          (Array.isArray(data?.errors) ? data.errors.join(' ') : null) ||
          err?.message ||
          'Upload failed. Please try again.',
      });
      setRowResults([]);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelection('');
    setSelectedFile(null);
    setResult(null);
    setRowResults([]);
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Upload Bulk — ${className} Combined Subjects`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a score category, then upload the scoresheet previously downloaded for this class. The file must match
        the selected session, term, class and category.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selection}
          label="Category"
          onChange={(e) => { setSelection(e.target.value); setResult(null); setSelectedFile(null); setRowResults([]); }}
        >
          <MenuItem value="">--Select category--</MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selection && (
        <Box
          onClick={() => !uploading && fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: selectedFile ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            bgcolor: selectedFile ? 'primary.lighter' : 'background.default',
            transition: 'all 0.2s',
            '&:hover': uploading ? {} : { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
          }}
        >
          <IconFileSpreadsheet size={36} style={{ opacity: 0.6 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {selectedFile ? selectedFile.name : 'Click to select an Excel file (.xlsx)'}
          </Typography>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {uploading && <LinearProgress sx={{ mt: 2 }} />}
      {result && (
        <Alert severity={result.severity} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
      {rowResults.length > 0 && (
        <List dense sx={{ mt: 1, maxHeight: 180, overflow: 'auto', bgcolor: 'background.default', borderRadius: 1 }}>
          {rowResults.map((r, i) => (
            <ListItem key={i} disableGutters>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {r.success ? <IconCheck size={14} color="green" /> : <IconX size={14} color="orange" />}
              </ListItemIcon>
              <ListItemText
                primary={r.success || r.warning}
                primaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button variant="contained" size="small" color="inherit" onClick={handleClose} disabled={uploading}>
          {result?.severity === 'success' ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={!selection || !selectedFile || uploading}
        >
          Upload
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default UploadCombinedDialog;
