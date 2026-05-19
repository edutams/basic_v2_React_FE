import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import TiptapEdit from 'src/views/forms/form-tiptap/TiptapEdit';
import ParentCard from 'src/components/shared/ParentCard';

const PLACEHOLDER_FIELDS = [
  { label: "Student's First Name", value: "[Student's First Name]" },
  { label: "Student's Last Name",  value: "[Student's Last Name]" },
  { label: 'Class Name',           value: '[Class Name]' },
  { label: 'Entrance Score',       value: '[Entrance Score]' },
  { label: "Parent's Name",        value: "[Parent's Name]" },
  { label: 'School Division',      value: '[School Division]' },
  { label: 'Admission Session',    value: '[Admission Session]' },
];

export const LETTER_TEMPLATES = [
  {
    id: 'congratulations',
    label: 'Congratulations Letter',
    preview:
      "Dear [Student's First Name] [Student's Last Name],\n\nCongratulations! You've achieved an entrance score of [Entrance Score],\n\nWelcome to [Class Name] at [School Division]. We look forward to having you join us for the [Admission Session].",
  },
  {
    id: 'offer',
    label: 'Admission Offer',
    preview:
      "Dear [Student's First Name],\n\nWe are pleased to offer you admission to [Class Name] at [School Division] for the [Admission Session].\n\nPlease complete your registration to confirm your place.",
  },
];

const PREVIEW_SAMPLES = {
  "[Student's First Name]": 'John',
  "[Student's Last Name]":  'Doe',
  '[Class Name]':           'Junior Secondary',
  '[Entrance Score]':       '85',
  "[Parent's Name]":        'Mr. & Mrs. Doe',
  '[School Division]':      'Brightwood School',
  '[Admission Session]':    '2025/2026 Session',
};

const applyPreviewSamples = (html) => {
  if (!html) return '';
  let result = html;
  Object.entries(PREVIEW_SAMPLES).forEach(([token, value]) => {
    const inner = token.replace(/^\[/, '').replace(/\]$/, '');
    const pattern = new RegExp(
      `\\[${inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]|${inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'gi',
    );
    result = result.replace(
      pattern,
      `<strong style="color:#1976d2">${value}</strong>`,
    );
  });
  return result;
};

const AdmissionLetterEditor = ({ onChange }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [letterContent,    setLetterContent]    = useState('');

  const handleTemplateChange = (tpl) => {
    setSelectedTemplate(tpl);
  };

  const handleEditorUpdate = ({ editor }) => {
    const html = editor.getHTML();
    setLetterContent(html);
    onChange?.(html);
  };

  const initialContent = selectedTemplate
    ? selectedTemplate.preview
        .split('\n')
        .map((line) => (line.trim() ? `<p>${line}</p>` : '<p></p>'))
        .join('')
    : '<p>Type here...</p>';

  return (
    <ParentCard title="Admission Letter Editor">
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: '#fff',
          px: 2.5,
          py: 1.5,
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Admission Letter Editor
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* ── Placeholder Fields + Template Options ── */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
            Placeholder Fields
          </Typography>

          <Stack spacing={0.75}>
            {PLACEHOLDER_FIELDS.map((field) => (
              <Tooltip key={field.value} title={`Click to copy: ${field.value}`} placement="right">
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => navigator.clipboard?.writeText(field.value)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: 11,
                    fontWeight: 500,
                    borderColor: 'divider',
                    color: 'text.primary',
                    py: 0.5,
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' },
                  }}
                >
                  {field.label}
                </Button>
              </Tooltip>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
            Template Options
          </Typography>
          <Stack direction="row" spacing={1}>
            {LETTER_TEMPLATES.map((tpl) => (
              <Paper
                key={tpl.id}
                elevation={0}
                onClick={() => handleTemplateChange(tpl)}
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1.5,
                  border: '2px solid',
                  borderColor: selectedTemplate?.id === tpl.id ? 'primary.main' : 'divider',
                  transition: 'all 0.15s',
                  bgcolor: selectedTemplate?.id === tpl.id ? 'primary.light' : 'background.paper',
                  '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                }}
              >
                <Box
                  sx={{
                    height: 52,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.disabled" fontSize={9}>
                    preview
                  </Typography>
                </Box>
                <Box sx={{ px: 0.5, py: 0.5 }}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    display="block"
                    textAlign="center"
                    fontSize={10}
                    lineHeight={1.2}
                  >
                    {tpl.label}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Letter Editor
            </Typography>
            <Chip
              label="⚠ Check Missing Fields"
              size="small"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: 10 }}
            />
          </Box>

          <TextField
            select
            fullWidth
            size="small"
            label="Template"
            value={selectedTemplate?.id ?? ''}
            onChange={(e) => {
              const tpl = LETTER_TEMPLATES.find((t) => t.id === e.target.value);
              if (tpl) handleTemplateChange(tpl);
            }}
            sx={{ mb: 1.5 }}
          >
            {LETTER_TEMPLATES.map((tpl) => (
              <MenuItem key={tpl.id} value={tpl.id}>
                {tpl.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Tiptap editor */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 220,
              '& .ProseMirror': { minHeight: 180, p: 1.5, outline: 'none' },
            }}
          >
            <TiptapEdit
              initialContent={initialContent}
              onUpdate={handleEditorUpdate}
            />
          </Box>

          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1 }}
            mt={1.5}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Save Template
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Send Test Email
              </Button>
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: 10, sm: 11, md: 12 },
                px: { xs: 1, sm: 1.5, md: 2 },
                whiteSpace: 'nowrap',
              }}
            >
              Save &amp; Preview
            </Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" display="block" mb={1}>
            Live Preview
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 220,
              maxHeight: 320,
              overflowY: 'auto',
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            {letterContent ? (
              <Box
                sx={{
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: 'text.primary',
                  '& p':        { mt: 0, mb: 0.75 },
                  '& strong':   { fontWeight: 700 },
                  '& em':       { fontStyle: 'italic' },
                  '& ul, & ol': { pl: 2.5, mb: 0.75 },
                }}
                dangerouslySetInnerHTML={{ __html: applyPreviewSamples(letterContent) }}
              />
            ) : (
              <Typography variant="caption" color="text.disabled">
                Start typing in the editor to see a live preview
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </ParentCard>
  );
};

export default AdmissionLetterEditor;
