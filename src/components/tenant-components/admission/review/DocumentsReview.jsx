import { Box, Typography, Chip, Button } from '@mui/material';
import { InsertDriveFile as FileIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ReviewSection from './ReviewSection';

const DocRow = ({ label, filename, required }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between"
    sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}>
    <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5,
        bgcolor: 'primary.light', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <FileIcon sx={{ color: 'primary.main', fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {label}
          {required && <Typography component="span" color="error.main" ml={0.5}>*</Typography>}
        </Typography>
        {filename && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {filename}
          </Typography>
        )}
      </Box>
    </Box>

    <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
      <Chip label="Uploaded" size="small"
        sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: 11 }} />
      <Button size="small" startIcon={<VisibilityIcon />} variant="outlined" sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>
        View
      </Button>
    </Box>
  </Box>
);

const DocumentsReview = () => {
  const docs = [
    { key: 'birth_certificate',      label: 'Birth certificate',      filename: 'Adewunmirrrr_2019_birth.pdf', required: true  },
    { key: 'previous_school_report', label: 'Previous school report', filename: 'all_report_2025.pdf',      required: true  },
    { key: 'passport_photo',         label: 'Passport photo',         filename: 'passport.png',             required: true  },
    { key: 'medical_record',         label: 'Medical record',         filename: 'medical_record.pdf',       required: false },
  ];

  return (
    <ReviewSection number={4} title="Upload required documents" subtitle="PDF, JPG or PNG. Max 5MB each." id="section-documents">
      {docs.map((doc) => (
        <DocRow key={doc.key} label={doc.label} filename={doc.filename} required={doc.required} />
      ))}
    </ReviewSection>
  );
};

DocumentsReview.propTypes = {};

export default DocumentsReview;
