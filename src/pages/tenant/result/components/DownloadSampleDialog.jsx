import { useEffect, useMemo, useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert,
} from '@mui/material';
import { IconDownload } from '@tabler/icons-react';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';

const DownloadSampleDialog = ({ open, onClose, allocation, filter }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [caOptions, setCaOptions] = useState([]);

  // Load CA types from the marks configuration for the selected session/term,
  // same parsing pattern as the other score modals.
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

  // Reset selection whenever the dialog opens or options change
  useEffect(() => {
    setCategory('');
    setSelectedType('');
    setError('');
  }, [open, caOptions.length]);

  const displayName = useMemo(() => {
    if (category === 'exam') return 'Exam';
    if (category === 'ca') return caOptions[selectedType]?.display_name || '';
    return '';
  }, [category, selectedType, caOptions]);

  const handleDownload = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await scoreManagerApi.downloadCombinedScoresheet({
        session_id: filter.session_id,
        term_id: filter.term_id,
        programme_id: filter.programme_id,
        class_arm_id: filter.class_arm_id,
        class_id: filter.class_id || undefined,
        subject_ids: [allocation.subject_id],
        category,
        display_name: category === 'ca' ? displayName : undefined,
      });

      // Response is a binary Excel blob — build an object URL and trigger download
      const disposition = res?.headers?.['content-disposition'] || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const fileName = match?.[1]
        || `${allocation?.class_name ?? allocation?.className ?? 'Class'}_${allocation?.subject_name || 'Subject'}_${displayName}_result.xlsx`;

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
      console.error('Failed to download sample:', err);
      setError(err?.response?.data?.message || 'Failed to download the template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory('');
    setSelectedType('');
    setError('');
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Download Sample — ${allocation?.subject_name} (${allocation?.class_name ?? allocation?.className})`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a category and type to download the score sheet template for this subject.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => { setCategory(e.target.value); setSelectedType(''); }}
        >
          <MenuItem value="">--Select category--</MenuItem>
          <MenuItem value="ca">CA</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
        </Select>
      </FormControl>

      {category === 'ca' && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="">--Select Type--</MenuItem>
            {caOptions.map((type, index) => (
              <MenuItem key={type.display_name || index} value={index}>
                {type.display_name || `CA${index + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {category === 'ca' && caOptions.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No CA types are configured for this session/term. Configure marks in Result Setup first.
        </Alert>
      )}

      {category && (category === 'exam' || selectedType !== '') && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click download to get the Excel template for <strong>{displayName}</strong> scores.
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
          disabled={!category || (category === 'ca' && selectedType === '') || loading}
          onClick={handleDownload}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default DownloadSampleDialog;
