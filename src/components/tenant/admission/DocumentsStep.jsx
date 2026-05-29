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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FileUpload as UploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Visibility as EyeIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const DOCUMENTS = [
  { key: 'birth_cert',         label: 'Birth certificate',      required: true,  accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'prev_school_report', label: 'Previous school report', required: true,  accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'passport_photo',     label: 'Passport photo',         required: true,  accept: '.jpg,.jpeg,.png'      },
  { key: 'medical_record',     label: 'Medical record',         required: false, accept: '.pdf,.jpg,.jpeg,.png' },
];

const ACCEPTED = '.pdf,.jpg,.jpeg,.png';
const MAX_MB   = 5;

const isImage = (file) => file?.type?.startsWith('image/');

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
  const isImageFile = file ? isImage(file) : url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
          {displayName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        {displayUrl && isImageFile ? (
          <Box
            component="img"
            src={displayUrl}
            alt={displayName}
            sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 2, objectFit: 'contain' }}
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

const DocumentRow = ({ doc, file, existingUrl, onFileChange, onRemove, onPreview, isDragOver, onDragOver, onDragLeave, onDrop }) => {
  const inputRef = useRef(null);
  const hasDocument = Boolean(file || existingUrl);
  const displayName = file?.name || (existingUrl ? existingUrl.split('/').pop() : null);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        borderStyle: isDragOver ? 'dashed' : 'solid',
        borderColor: isDragOver ? 'primary.main' : 'divider',
        bgcolor: isDragOver ? 'primary.lighter' : 'background.paper',
        transition: 'all 0.15s',
        cursor: hasDocument ? 'default' : 'pointer',
      }}
      onClick={() => !hasDocument && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: hasDocument ? 'success.light' : 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {hasDocument
          ? <FileIcon sx={{ color: 'success.dark', fontSize: 22 }} />
          : <UploadIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        }
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700}>
          {doc.label}
          {doc.required && (
            <Typography component="span" color="error.main" ml={0.5}>*</Typography>
          )}
        </Typography>

        {hasDocument ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayName}
            </Typography>
            {file && (
              <Chip
                label={`${(file.size / 1024 / 1024).toFixed(1)} MB`}
                size="small"
                sx={{ height: 16, fontSize: 10, ml: 0.5 }}
              />
            )}
            {existingUrl && !file && (
              <Chip
                label="Previously uploaded"
                size="small"
                color="success"
                sx={{ height: 16, fontSize: 10, ml: 0.5 }}
              />
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Click to upload or drag and drop
            {doc.accept === '.jpg,.jpeg,.png' ? ' · JPG or PNG only' : ' · PDF, JPG or PNG'}
          </Typography>
        )}
      </Box>

      {hasDocument ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            sx={{ color: 'primary.main' }}
            title="Preview file"
          >
            <EyeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title={existingUrl && !file ? "Remove and upload new" : "Remove file"}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          sx={{ flexShrink: 0, borderRadius: 2, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Choose file
        </Button>
      )}

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

const DocumentsStep = ({ initialValues, onNext, onBack, isLoading = false }) => {
  const [files, setFiles] = useState({});
  const [existingDocs, setExistingDocs] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({ file: null, url: null });

  // Initialize existing documents from initialValues
  useEffect(() => {
    if (initialValues) {
      const existing = {};
      DOCUMENTS.forEach((doc) => {
        if (initialValues[doc.key]) {
          existing[doc.key] = initialValues[doc.key];
        }
      });
      setExistingDocs(existing);
    }
  }, [initialValues]);

  const handleFile = (key, file) => {
    const doc = DOCUMENTS.find((d) => d.key === key);
    const acceptedExts = (doc?.accept ?? ACCEPTED).split(',').map((e) => e.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedExts.includes(fileExt)) {
      setErrors((prev) => ({ ...prev, [key]: `Invalid file type. Accepted: ${acceptedExts.join(', ')}` }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: `File exceeds ${MAX_MB}MB limit` }));
      return;
    }
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemove = (key) => {
    setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setExistingDocs((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleDrop = (key, e) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(key, file);
  };

  const requiredKeys = DOCUMENTS.filter((d) => d.required).map((d) => d.key);
  // Check if all required documents are either newly uploaded or already exist
  const allRequiredOk = requiredKeys.every((k) => Boolean(files[k] || existingDocs[k]));

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
    
    // Pass both new files and existing document URLs
    onNext({ 
      newFiles: files, 
      existingDocs: existingDocs 
    });
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Upload required documents
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        PDF, JPG or PNG · Max {MAX_MB}MB each · Passport photo accepts images only.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {DOCUMENTS.map((doc) => (
          <Box key={doc.key}>
            <DocumentRow
              doc={doc}
              file={files[doc.key] ?? null}
              existingUrl={existingDocs[doc.key] ?? null}
              onFileChange={(f) => handleFile(doc.key, f)}
              onRemove={() => handleRemove(doc.key)}
              onPreview={() => setPreview({ 
                file: files[doc.key] || null, 
                url: existingDocs[doc.key] || null 
              })}
              isDragOver={dragOver === doc.key}
              onDragOver={(e) => { e.preventDefault(); setDragOver(doc.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(doc.key, e)}
            />
            {errors[doc.key] && (
              <Typography variant="caption" color="error.main" sx={{ pl: 1 }}>
                {errors[doc.key]}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ mt: 4, mb: 2 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !allRequiredOk}
          sx={{ fontWeight: 700, px: 4, borderRadius: 2 }}
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
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default DocumentsStep;
