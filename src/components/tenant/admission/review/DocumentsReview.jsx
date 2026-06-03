import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';

const DOC_DEFS = [
  { key: 'birth_cert', label: 'Birth certificate', required: true },
  { key: 'prev_school_report', label: 'Previous school report', required: true },
  { key: 'passport_photo', label: 'Passport photo', required: true },
  { key: 'medical_record', label: 'Medical record', required: false },
];

const PreviewDialog = ({ file, onClose }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    // If file is already a URL string, use it directly
    if (typeof file === 'string') {
      setObjectUrl(file);
      return;
    }

    // If file is a File/Blob object, create object URL
    if (file instanceof File || file instanceof Blob) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  // Determine if it's an image
  const isImage =
    typeof file === 'string'
      ? file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      : file.type?.startsWith('image/');

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Typography
          variant="subtitle1"
          component="span"
          fontWeight={700}
          noWrap
          sx={{ flex: 1, mr: 1 }}
        >
          {typeof file === 'string' ? 'Document Preview' : file.name}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        {objectUrl && isImage ? (
          <Box
            component="img"
            src={objectUrl}
            alt={typeof file === 'string' ? 'Document' : file.name}
            sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, objectFit: 'contain' }}
          />
        ) : objectUrl ? (
          <Box sx={{ height: '70vh' }}>
            <iframe
              src={objectUrl}
              title={typeof file === 'string' ? 'Document' : file.name}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: 8 }}
            />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const DocRow = ({ label, file, required, onView }) => {
  const uploaded = Boolean(file);

  // Get file name - handle both File objects and URL strings
  const fileName =
    file instanceof File ? file.name : typeof file === 'string' ? file.split('/').pop() : null;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}
    >
      <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: uploaded ? 'success.light' : 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileIcon sx={{ color: uploaded ? 'success.dark' : 'text.disabled', fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {label}
            {required && (
              <Typography component="span" color="error.main" ml={0.5}>
                *
              </Typography>
            )}
          </Typography>
          {fileName && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {fileName}
            </Typography>
          )}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
        {uploaded ? (
          <>
            <Chip
              label="Uploaded"
              size="small"
              sx={{
                bgcolor: 'success.light',
                color: 'success.dark',
                fontWeight: 600,
                fontSize: 11,
              }}
            />
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={onView}
              sx={{ fontSize: 11, whiteSpace: 'nowrap' }}
            >
              View
            </Button>
          </>
        ) : (
          <Chip
            label="Not uploaded"
            size="small"
            sx={{ bgcolor: 'error.light', color: 'error.dark', fontWeight: 600, fontSize: 11 }}
          />
        )}
      </Box>
    </Box>
  );
};

const DocumentsReview = ({ documentsData, hasPreviousSchool = false }) => {
  const [preview, setPreview] = useState(null);

  const files = documentsData ?? {};

  const effectiveDocs = DOC_DEFS.filter(
    (doc) => doc.key !== 'prev_school_report' || hasPreviousSchool,
  ).map((doc) =>
    doc.key === 'prev_school_report' ? { ...doc, required: hasPreviousSchool } : doc,
  );

  return (
    <ReviewSection
      number={4}
      title="Upload required documents"
      subtitle="PDF, JPG or PNG · Max 5MB each."
      id="section-documents"
    >
      {effectiveDocs.map((doc) => (
        <DocRow
          key={doc.key}
          label={doc.label}
          file={files[doc.key] ?? null}
          required={doc.required}
          onView={() => setPreview(files[doc.key])}
        />
      ))}

      {preview && <PreviewDialog file={preview} onClose={() => setPreview(null)} />}
    </ReviewSection>
  );
};

DocumentsReview.propTypes = {
  documentsData: PropTypes.object,
  hasPreviousSchool: PropTypes.bool,
};

export default DocumentsReview;
