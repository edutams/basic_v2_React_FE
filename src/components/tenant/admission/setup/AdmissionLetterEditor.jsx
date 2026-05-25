import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material';
import TiptapEdit from '@/pages/landlord/views/forms/form-tiptap/TiptapEdit';
import ParentCard from 'src/components/shared/ParentCard';

const PLACEHOLDER_FIELDS = [
  { label: "Student's First Name", value: "[Student's First Name]" },
  { label: "Student's Last Name", value: "[Student's Last Name]" },
  { label: 'Class Name', value: '[Class Name]' },
  { label: 'Entrance Score', value: '[Entrance Score]' },
  { label: "Parent's Name", value: "[Parent's Name]" },
  { label: 'School Division', value: '[School Division]' },
  { label: 'Admission Session', value: '[Admission Session]' },
];

export const LETTER_TEMPLATES = [
  {
    id: 'offer',
    label: 'Admission Offer',
    preview:
      "Dear [Student's First Name],\n\nWe are pleased to offer you admission to [Class Name] at [School Division] for the [Admission Session].\n\nPlease complete your registration to confirm your place.",
  },
];

const PREVIEW_SAMPLES = {
  "[Student's First Name]": 'John',
  "[Student's Last Name]": 'Doe',
  '[Class Name]': 'Junior Secondary',
  '[Entrance Score]': '85',
  "[Parent's Name]": 'Mr. & Mrs. Doe',
  '[School Division]': 'Brightwood School',
  '[Admission Session]': '2025/2026 Session',
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
    result = result.replace(pattern, `<strong style="color:#1976d2">${value}</strong>`);
  });
  return result;
};

const AdmissionLetterEditor = ({ onChange, initialContent = '', readOnly = false }) => {
  const [letterContent, setLetterContent] = useState('');
  const editorRef = useRef(null); // holds the tiptap editor instance

  const handleEditorUpdate = ({ editor }) => {
    editorRef.current = editor;
    const html = editor.getHTML();
    setLetterContent(html);
    onChange?.(html);
  };

  const handleInsertPlaceholder = (value) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent(value).run();
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(value);
    }
  };

  // Determine what content to show in the editor
  const getInitialContent = () => {
    // If initialContent is provided (edit mode), use it
    if (initialContent && initialContent.trim()) {
      return initialContent;
    }
    
    // Otherwise, use the default template
    const defaultTemplate = LETTER_TEMPLATES[0];
    return defaultTemplate.preview
      .split('\n')
      .map((line) => (line.trim() ? `<p>${line}</p>` : '<p></p>'))
      .join('');
  };

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
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            display="block"
            mb={1}
          >
            Placeholder Fields
          </Typography>

          <Stack spacing={0.75}>
            {PLACEHOLDER_FIELDS.map((field) => (
              <Tooltip
                key={field.value}
                title={readOnly ? field.value : `Insert: ${field.value}`}
                placement="right"
              >
                <span>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={readOnly}
                    onClick={() => handleInsertPlaceholder(field.value)}
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
                </span>
              </Tooltip>
            ))}
          </Stack>

          {/* <Divider sx={{ my: 2 }} />

          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            display="block"
            mb={1}
          >
            Template Options
          </Typography> */}
          {/* <Stack direction="row" spacing={1}>
            {LETTER_TEMPLATES.map((tpl) => (
              <Paper
                key={tpl.id}
                elevation={0}
                onClick={() => !readOnly && handleTemplateChange(tpl)}
                sx={{
                  flex: 1,
                  cursor: readOnly ? 'default' : 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1.5,
                  border: '2px solid',
                  borderColor: selectedTemplate?.id === tpl.id ? 'primary.main' : 'divider',
                  transition: 'all 0.15s',
                  bgcolor: selectedTemplate?.id === tpl.id ? 'primary.light' : 'background.paper',
                  opacity: readOnly ? 0.6 : 1,
                  '&:hover': !readOnly ? { borderColor: 'primary.main', boxShadow: 1 } : {},
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
          </Stack> */}
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

          {/* <TextField
            select
            fullWidth
            size="small"
            label="Template"
            value={selectedTemplate?.id ?? ''}
            disabled={readOnly}
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
          </TextField> */}

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 220,
              maxHeight: 400,
              overflowY: 'auto',
              bgcolor: readOnly ? 'grey.50' : 'background.paper',
              '& .ProseMirror': {
                minHeight: 180,
                p: 1.5,
                outline: 'none',
              },
            }}
          >
            <TiptapEdit
              key={initialContent} // Force re-render when initialContent changes
              initialContent={getInitialContent()}
              onUpdate={handleEditorUpdate}
              readOnly={readOnly}
            />
          </Box>

          {/* {!readOnly && (
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
                Save & Preview
              </Button>
            </Stack>
          )} */}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="primary.main"
            display="block"
            mb={1}
          >
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
                  '& p': { mt: 0, mb: 0.75 },
                  '& strong': { fontWeight: 700 },
                  '& em': { fontStyle: 'italic' },
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
