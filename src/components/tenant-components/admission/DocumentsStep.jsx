import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FileUpload as UploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

// ── Document definitions ──────────────────────────────────────────────────────
const DOCUMENTS = [
  { key: 'birth_certificate',    label: 'Birth certificate',      required: true  },
  { key: 'previous_school_report', label: 'Previous school report', required: true  },
  { key: 'passport_photo',       label: 'Passport photo',         required: true  },
  { key: 'medical_record',       label: 'Medical record',         required: false },
];

const ACCEPTED = '.pdf,.jpg,.jpeg,.png';
const MAX_MB   = 5;

// ── Single upload row ─────────────────────────────────────────────────────────
const DocumentRow = ({ doc, file, onFileChange, onRemove, isDragOver, onDragOver, onDragLeave, onDrop }) => {
  const inputRef = useRef(null);

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
        cursor: 'pointer',
      }}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Upload icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <UploadIcon sx={{ color: 'primary.main', fontSize: 22 }} />
      </Box>

      {/* Label + hint / selected file */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700}>
          {doc.label}
          {doc.required && (
            <Typography component="span" color="error.main" ml={0.5}>*</Typography>
          )}
        </Typography>

        {file ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            <FileIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {file.name}
            </Typography>
            <Chip
              label={`${(file.size / 1024 / 1024).toFixed(1)} MB`}
              size="small"
              sx={{ height: 16, fontSize: 10, ml: 0.5 }}
            />
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Click to upload or drag and drop
          </Typography>
        )}
      </Box>

      {/* Action — remove if file selected, else Choose file */}
      {file ? (
        <IconButton
          size="small"
          color="error"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
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

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
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

// ── Main step ─────────────────────────────────────────────────────────────────
const DocumentsStep = ({ onNext, onBack, isLoading = false }) => {
  const [files, setFiles]       = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [errors, setErrors]     = useState({});

  const handleFile = (key, file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: `File exceeds ${MAX_MB}MB limit` }));
      return;
    }
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemove = (key) => {
    setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleDrop = (key, e) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(key, file);
  };

  const requiredKeys  = DOCUMENTS.filter((d) => d.required).map((d) => d.key);
  const allRequiredOk = requiredKeys.every((k) => Boolean(files[k]));

  const handleSubmit = () => {
    // Validate required
    const newErrors = {};
    requiredKeys.forEach((k) => {
      if (!files[k]) newErrors[k] = 'This document is required';
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    // TODO: pass files to API
    onNext(files);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Upload required documents
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        PDF, JPG or PNG. Max {MAX_MB}MB each.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {DOCUMENTS.map((doc) => (
          <Box key={doc.key}>
            <DocumentRow
              doc={doc}
              file={files[doc.key] ?? null}
              onFileChange={(f) => handleFile(doc.key, f)}
              onRemove={() => handleRemove(doc.key)}
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

      {/* Footer — matches ParentForm action row */}
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
          {isLoading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </Box>
    </Box>
  );
};

DocumentsStep.propTypes = {
  onNext:     PropTypes.func.isRequired,
  onBack:     PropTypes.func.isRequired,
  isLoading:  PropTypes.bool,
};

export default DocumentsStep;
