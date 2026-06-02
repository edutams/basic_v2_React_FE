import React, { useRef, useState } from 'react';
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import { updateSchoolLogo } from '@/api/tenant/tenant_api';
import { getFullImageUrl } from 'src/helpers/ImageHelper';
import { useNotification } from 'src/hooks/useNotification';

const UploadLogoModal = ({ open, onClose, onUploaded }) => {
  const fileInputRef = useRef(null);
  const notify = useNotification();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('school_logo', selectedFile);
      const res = await updateSchoolLogo(formData);
      const newLogoUrl = getFullImageUrl(res.data?.school_logo);
      notify.success('School logo uploaded successfully.');
      onUploaded(newLogoUrl);
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
      notify.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <ReusableModal open={open} onClose={handleClose} title="Upload School Logo" size="small">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select an image file for your school logo (PNG, JPG, SVG).
      </Typography>

      {/* Drop / click zone */}
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
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }}
          />
        ) : (
          <>
            <IconPhoto size={40} style={{ opacity: 0.5 }} />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Click to select an image file
            </Typography>
          </>
        )}
      </Box>

      {selectedFile && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {selectedFile.name}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {uploading && <LinearProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button color="inherit" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          startIcon={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
    </ReusableModal>
  );
};

UploadLogoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploaded: PropTypes.func.isRequired,
};

export default UploadLogoModal;
