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
  useTheme,
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

// Solid hex tokens instead of theme.palette.success/error — matches the
// darker, legible set used across the rest of the reworked admission UI.
const COLOR = { done: '#16a34a', doneBg: '#dcfce7', error: '#dc2626', errorBg: '#fee2e2' };

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
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
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
            sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }}
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const uploaded = Boolean(file);

  // Get file name - handle both File objects and URL strings
  const fileName =
    file instanceof File ? file.name : typeof file === 'string' ? file.split('/').pop() : null;

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      gap={1}
      sx={{
        py: 1,
        px: 1.25,
        mb: 1,
        borderRadius: '8px',
        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: uploaded ? COLOR.done : 'primary.light',
        },
        '&:last-of-type': { mb: 0 },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.25} sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: uploaded ? COLOR.doneBg : 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileIcon sx={{ color: uploaded ? COLOR.done : 'text.disabled', fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {label}
            {required && (
              <Typography component="span" sx={{ color: COLOR.error, ml: 0.5 }}>
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

      <Box display="flex" alignItems="center" justifyContent={{ xs: 'flex-end', sm: 'flex-start' }} gap={1} sx={{ flexShrink: 0 }}>
        {uploaded ? (
          <>
            <Chip
              label="Uploaded"
              size="small"
              sx={{ bgcolor: COLOR.doneBg, color: COLOR.done, fontWeight: 700, fontSize: 11 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon sx={{ fontSize: '15px !important' }} />}
              onClick={onView}
              sx={{ fontSize: 11, whiteSpace: 'nowrap', borderRadius: '8px', textTransform: 'none' }}
            >
              View
            </Button>
          </>
        ) : (
          <Chip
            label="Not uploaded"
            size="small"
            sx={{ bgcolor: COLOR.errorBg, color: COLOR.error, fontWeight: 700, fontSize: 11 }}
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
