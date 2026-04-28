import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import { IconUpload, IconFileSpreadsheet } from '@tabler/icons-react';

const UploadParentModal = ({ open, onClose, onUpload }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); 

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
      const message = await onUpload(selectedFile);
      setResult({ severity: 'success', message });
      setSelectedFile(null);
    } catch (err) {
      setResult({
        severity: 'error',
        message: err?.response?.data?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setSelectedFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Upload Parents via Excel</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Download the template first, fill in the parent details, then upload the completed file.
        </Typography>

        {/* Drop zone / file picker */}
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: selectedFile ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: selectedFile ? 'primary.lighter' : 'background.default',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' },
          }}
        >
          <IconFileSpreadsheet size={36} style={{ opacity: 0.6 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {selectedFile ? selectedFile.name : 'Click to select an Excel file (.xlsx)'}
          </Typography>
        </Box>

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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {result?.severity === 'success' ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          startIcon={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadParentModal;
