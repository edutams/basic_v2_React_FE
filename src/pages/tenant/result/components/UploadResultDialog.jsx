import { useRef, useState } from 'react';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  Box, Button, Typography, LinearProgress, Alert,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { IconUpload, IconFileSpreadsheet } from '@tabler/icons-react';

const dummyCaType = [
  { display_name: 'CA1', entities: { entity1: { display_name: 'Test', max_score: 10 } } },
  { display_name: 'CA2', entities: { entity1: { display_name: 'Assignment', max_score: 10 } } },
];

const UploadResultDialog = ({ open, onClose, allocation, onUploaded }) => {
  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [caType] = useState(dummyCaType);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCategoryChange = (category) => {
    setFilter({ category, type: '' });
    setResult(null);
  };

  const handleTypeChange = (typeIndex) => {
    setFilter({ ...filter, type: typeIndex });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setResult(null);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setResult({ severity: 'success', message: 'Scores uploaded successfully!' });
      setSelectedFile(null);
      onUploaded?.();
    } catch (err) {
      setResult({
        severity: 'error',
        message: err?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFilter({ category: '', type: '' });
    setSelectedFile(null);
    setResult(null);
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={`Upload Result — ${allocation?.subject_name} (${allocation?.className})`}
      size="small"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a category, type, then upload the completed Excel template.
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filter.category}
          label="Category"
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <MenuItem value="">--Select category--</MenuItem>
          <MenuItem value="ca">CA</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
        </Select>
      </FormControl>

      {filter.category === 'ca' && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filter.type}
            label="Type"
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <MenuItem value="">--Select Type--</MenuItem>
            {caType.map((type, index) => (
              <MenuItem key={type.display_name} value={index}>
                {type.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filter.category && (
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

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button variant="contained" size="small" color="inherit" onClick={handleClose} disabled={uploading}>
          {result?.severity === 'success' ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={!filter.category || !selectedFile || uploading}
        >
          Upload
        </Button>
      </Box>
    </ReusableModal>
  );
};

export default UploadResultDialog;
