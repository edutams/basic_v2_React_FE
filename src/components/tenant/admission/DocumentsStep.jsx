import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Visibility as EyeIcon,
  CheckCircle as CheckCircleIcon,
  Autorenew as ReplaceIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const DOCUMENTS = [
  { key: 'birth_cert', label: 'Birth certificate', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
  {
    key: 'prev_school_report',
    label: 'Previous school report',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  { key: 'passport_photo', label: 'Passport photo', required: true, accept: '.jpg,.jpeg,.png' },
  {
    key: 'medical_record',
    label: 'Medical record',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
];

const ACCEPTED = '.pdf,.jpg,.jpeg,.png';
const MAX_MB = 5;

// Solid hex tokens instead of theme.palette shades (some of which don't
// exist in this app's custom theme — e.g. "primary.lighter" is undefined
// and silently drops a highlight) — matching the darker, legible set used
// across the rest of the reworked admission UI.
const COLOR = {
  done: '#16a34a',
  doneBg: '#dcfce7',
  accent: '#2563eb',
  accentBg: '#eff6ff',
  error: '#dc2626',
};

const isImageFile = (file) => file?.type?.startsWith('image/');
const isImageUrl = (url) => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

const PreviewDialog = ({ file, url, onClose }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const newUrl = URL.createObjectURL(file);
    setObjectUrl(newUrl);
    return () => URL.revokeObjectURL(newUrl);
  }, [file]);

  if (!file && !url) return null;

  const displayUrl = objectUrl || url;
  const displayName = file?.name || url?.split('/').pop() || 'Document';
  const showAsImage = file ? isImageFile(file) : isImageUrl(url);

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="subtitle1" component="span" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
          {displayName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        {displayUrl && showAsImage ? (
          <Box
            component="img"
            src={displayUrl}
            alt={displayName}
            sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }}
          />
        ) : displayUrl ? (
          <Box sx={{ height: '70vh' }}>
            <iframe
              src={displayUrl}
              title={displayName}
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

/**
 * One upload tile in the grid. Image files (new or previously uploaded)
 * render an actual thumbnail so the parent can visually confirm they picked
 * the right document, instead of a generic file icon either way.
 */
const DocumentCard = ({
  doc,
  file,
  existingUrl,
  onFileChange,
  onRemove,
  onPreview,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const inputRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const hasDocument = Boolean(file || existingUrl);
  const displayName = file?.name || (existingUrl ? existingUrl.split('/').pop() : null);

  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    if (file && isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setThumb(url);
      return () => URL.revokeObjectURL(url);
    }
    if (!file && existingUrl && isImageUrl(existingUrl)) {
      setThumb(existingUrl);
      return undefined;
    }
    setThumb(null);
    return undefined;
  }, [file, existingUrl]);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1.5px solid',
        borderStyle: isDragOver ? 'dashed' : hasDocument ? 'solid' : 'dashed',
        borderColor: isDragOver
          ? COLOR.accent
          : hasDocument
            ? (isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0')
            : (isDark ? 'rgba(255,255,255,0.16)' : '#cbd5e1'),
        bgcolor: isDragOver ? COLOR.accentBg : 'background.paper',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.15s',
        cursor: hasDocument ? 'default' : 'pointer',
        '&:hover': !hasDocument
          ? { borderColor: COLOR.accent, bgcolor: isDark ? 'rgba(37,99,235,0.06)' : COLOR.accentBg }
          : {},
      }}
      onClick={() => !hasDocument && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {hasDocument && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            zIndex: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: COLOR.accent, '&:hover': { bgcolor: '#fff' } }}
            title="Preview"
          >
            <EyeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: COLOR.error, '&:hover': { bgcolor: '#fff' } }}
            title="Remove"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Thumbnail / icon zone */}
      <Box
        sx={{
          height: 108,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: hasDocument ? (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc') : 'transparent',
          borderBottom: hasDocument ? '1px solid' : 'none',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        }}
      >
        {thumb ? (
          <Box component="img" src={thumb} alt={doc.label} sx={{ height: '100%', width: '100%', objectFit: 'cover' }} />
        ) : hasDocument ? (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '10px',
              bgcolor: COLOR.doneBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileIcon sx={{ color: COLOR.done, fontSize: 24 }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <CloudUploadIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              Drag & drop or click
            </Typography>
          </Box>
        )}
      </Box>

      {/* Label + meta */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {hasDocument && <CheckCircleIcon sx={{ color: COLOR.done, fontSize: 15, flexShrink: 0 }} />}
          <Typography variant="body2" fontWeight={700} noWrap>
            {doc.label}
            {doc.required && (
              <Typography component="span" sx={{ color: COLOR.error, ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
        </Box>

        {hasDocument ? (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Previously uploaded'}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {doc.accept === '.jpg,.jpeg,.png' ? 'JPG or PNG' : 'PDF, JPG or PNG'} · Max {MAX_MB}MB
          </Typography>
        )}

        {hasDocument && (
          <Button
            size="small"
            startIcon={<ReplaceIcon sx={{ fontSize: '15px !important' }} />}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            sx={{
              mt: 0.75,
              p: 0,
              minWidth: 0,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              color: COLOR.accent,
              '&:hover': { bgcolor: 'transparent', color: COLOR.accent, textDecoration: 'underline' },
            }}
          >
            Replace file
          </Button>
        )}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={doc.accept ?? ACCEPTED}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
    </Paper>
  );
};

const DocumentsStep = ({
  initialValues,
  hasPreviousSchool = false,
  onNext,
  onBack,
  isLoading = false,
}) => {
  const [files, setFiles] = useState({});
  const [existingDocs, setExistingDocs] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({ file: null, url: null });

  // Build effective documents list — completely remove prev_school_report if not needed
  // based on the hasPreviousSchool flag passed from the Academic Info step
  const EFFECTIVE_DOCUMENTS = DOCUMENTS.filter((doc) => {
    // Remove prev_school_report entirely if student has no previous school
    if (doc.key === 'prev_school_report' && !hasPreviousSchool) {
      return false;
    }
    return true;
  });

  // Initialize existing documents from initialValues
  // This runs whenever initialValues changes (e.g., after backend save/reload)
  useEffect(() => {
    const existing = {};
    const newFiles = {};

    if (initialValues) {
      EFFECTIVE_DOCUMENTS.forEach((doc) => {
        // Only add to existing if the value is truthy (not null, not empty string)
        if (initialValues[doc.key]) {
          existing[doc.key] = initialValues[doc.key];
        }
      });
    }

    setExistingDocs(existing);
    // Clear files state when initialValues change - backend is source of truth
    setFiles(newFiles);
    // Clear any errors
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, hasPreviousSchool]);

  const handleFile = (key, file) => {
    const doc = EFFECTIVE_DOCUMENTS.find((d) => d.key === key);
    const acceptedExts = (doc?.accept ?? ACCEPTED).split(',').map((e) => e.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedExts.includes(fileExt)) {
      setErrors((prev) => ({
        ...prev,
        [key]: `Invalid file type. Accepted: ${acceptedExts.join(', ')}`,
      }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: `File exceeds ${MAX_MB}MB limit` }));
      return;
    }
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemove = (key) => {
    setFiles((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setExistingDocs((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const handleDrop = (key, e) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(key, file);
  };

  const requiredKeys = EFFECTIVE_DOCUMENTS.filter((d) => d.required).map((d) => d.key);
  // Check if all required documents are either newly uploaded or already exist
  const allRequiredOk = requiredKeys.every((k) => Boolean(files[k] || existingDocs[k]));
  const uploadedCount = EFFECTIVE_DOCUMENTS.filter((d) => Boolean(files[d.key] || existingDocs[d.key])).length;
  const progressPct = EFFECTIVE_DOCUMENTS.length
    ? (uploadedCount / EFFECTIVE_DOCUMENTS.length) * 100
    : 0;

  const handleSubmit = () => {
    const newErrors = {};
    requiredKeys.forEach((k) => {
      if (!files[k] && !existingDocs[k]) {
        newErrors[k] = 'This document is required';
      }
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    // Build the submission data
    const submissionData = {
      newFiles: files,
      existingDocs: {},
    };

    // For each document field, explicitly set its state
    EFFECTIVE_DOCUMENTS.forEach((doc) => {
      const key = doc.key;

      if (files[key]) {
        // New file uploaded - will be in newFiles
        // Don't need to set in existingDocs
      } else if (existingDocs[key]) {
        // Existing document kept
        submissionData.existingDocs[key] = existingDocs[key];
      } else if (initialValues?.[key]) {
        // Document was in initialValues but removed by user - explicitly send null
        submissionData.existingDocs[key] = null;
      }
    });

    onNext(submissionData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1.5, mb: 0.75 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
            Upload required documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PDF, JPG or PNG · Max {MAX_MB}MB each
          </Typography>
        </Box>
        <Typography variant="caption" fontWeight={700} sx={{ color: uploadedCount === EFFECTIVE_DOCUMENTS.length ? COLOR.done : COLOR.accent, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {uploadedCount}/{EFFECTIVE_DOCUMENTS.length} uploaded
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          height: 5,
          borderRadius: 4,
          mb: 2.5,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: uploadedCount === EFFECTIVE_DOCUMENTS.length ? COLOR.done : COLOR.accent,
          },
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {EFFECTIVE_DOCUMENTS.map((doc) => (
          <Box key={doc.key}>
            <DocumentCard
              doc={doc}
              file={files[doc.key] ?? null}
              existingUrl={existingDocs[doc.key] ?? null}
              onFileChange={(f) => handleFile(doc.key, f)}
              onRemove={() => handleRemove(doc.key)}
              onPreview={() =>
                setPreview({
                  file: files[doc.key] || null,
                  url: existingDocs[doc.key] || null,
                })
              }
              isDragOver={dragOver === doc.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(doc.key);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(doc.key, e)}
            />
            {errors[doc.key] && (
              <Typography variant="caption" sx={{ color: COLOR.error, pl: 0.5, display: 'block', mt: 0.5 }}>
                {errors[doc.key]}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ mt: 2.5, mb: 1.5 }} />
      <Box
        display="flex"
        flexDirection={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap={1.5}
      >
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          fullWidth={false}
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={isLoading}
          sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={isLoading || !allRequiredOk}
          sx={{ fontWeight: 700, px: 3.5, borderRadius: '8px', textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : 'Save and Continue'}
        </Button>
      </Box>

      {(preview.file || preview.url) && (
        <PreviewDialog
          file={preview.file}
          url={preview.url}
          onClose={() => setPreview({ file: null, url: null })}
        />
      )}
    </Box>
  );
};

DocumentsStep.propTypes = {
  initialValues: PropTypes.object,
  /** Pass true when the applicant indicated they attended a previous school (from Academic Info step) */
  hasPreviousSchool: PropTypes.bool,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default DocumentsStep;
