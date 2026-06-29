import { useState, useRef, useEffect } from 'react';
import { Box, Grid, Typography, Button, Stack, Paper, Tooltip, Divider } from '@mui/material';
import TiptapEdit from '@/pages/landlord/views/forms/form-tiptap/TiptapEdit';
import ParentCard from 'src/components/shared/ParentCard';

const PLACEHOLDER_FIELDS = [
  { label: "Student's First Name", value: "[@Student's First Name]" },
  { label: "Student's Middle Name", value: "[@Student's Middle Name]" },
  { label: "Student's Last Name", value: "[@Student's Last Name]" },
  { label: 'Form Number', value: '[@Form Number]' },
  { label: 'Class Name', value: '[@Class Name]' },
  { label: 'Entrance Score', value: '[@Entrance Score]' },
  { label: "Parent's Name", value: "[@Parent's Name]" },
  { label: 'School Division', value: '[@School Division]' },
  { label: 'Admission Session', value: '[@Admission Session]' },
];

export const LETTER_TEMPLATES = [
  {
    id: 'offer',
    label: 'Admission Offer',
    preview:
      "Name [@Student's Last Name] [@Student's First Name] [@Student's Middle Name]\n\n[@Form Number]\n\n\nOFFER OF PROVISIONAL ADMISSION INTO [@Admission Session] FOR 2020 / 2021 ACADEMIC SESSION\n\nAs a result of your performance in the Entrance Examination conducted by the school, you are hereby offered admission into [@Class Name] for the 2020/2021 academic session.\n\nCongratulations!\n\nPlease note that all fees must be paid using Master Card before admission can be allowed on the School portal.\n\nThe 2020/2021 academic session commences on Sunday (Boarder) 20th September, 2020; Monday (Day Students) 21st September, 2020 respectively.\n\nIntending Boarder should please see the Vice Principal (Administration) who is in-charge of the Hostel Requirements.\n\nI wish you a very brilliant future as you step into this Great School. By the special grace of God, you are assured of an all-round quality education.\n\nOnce again, accept my congratulations\n\nYours faithfully,\n\nOlaniyan B.I (Mrs.)",
  },
];

const PREVIEW_SAMPLES = {
  "[@Student's First Name]": 'John',
  "[@Student's Middle Name]": 'K.',
  "[@Student's Last Name]": 'Doe',
  '[@Form Number]': 'ADM/2026/0012',
  '[@Class Name]': 'Junior Secondary',
  '[@Entrance Score]': '85',
  "[@Parent's Name]": 'Mr. & Mrs. Doe',
  '[@School Division]': 'Brightwood School',
  '[@Admission Session]': '2025/2026 Session',
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const editorRef = useRef(null); // holds the tiptap editor instance

  const makeTemplateHtml = (templateText) =>
    templateText
      .split('\n')
      .map((line) => (line.trim() ? `<p>${line}</p>` : '<p></p>'))
      .join('');

  const handleTemplateChange = (template) => {
    const html = makeTemplateHtml(template.preview);
    setSelectedTemplate(template);
    setLetterContent(html);
    setActiveTab('editor');
    onChange?.(html);
  };

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

  useEffect(() => {
    setLetterContent(getInitialContent());
  }, [initialContent]);

  // Determine what content to show in the editor
  const getInitialContent = () => {
    if (initialContent && initialContent.trim()) {
      return initialContent;
    }

    return '';
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
                  <Button variant="contained" size="small" fullWidth disabled={readOnly} onClick={() => handleInsertPlaceholder(field.value)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: 11,
                      fontWeight: 500,
                      borderColor: 'divider',
                    }}
                  >
                    {field.label}
                  </Button>
                </span>
              </Tooltip>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            display="block"
            mb={1}
          >
            Template Options
          </Typography>
          <Stack direction="row" spacing={1}>
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
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Admission Letter
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small" onClick={() => setActiveTab('editor')}
              >
                Letter Editor
              </Button>
              <Button variant="contained" size="small" onClick={() => setActiveTab('preview')}
              >
                Live Preview
              </Button>
            </Stack>
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
            {activeTab === 'editor' ? (
              <TiptapEdit
                initialContent={letterContent || ''}
                onUpdate={handleEditorUpdate}
                readOnly={readOnly}
              />
            ) : (
              <Box sx={{ p: 2 }}>
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
              </Box>
            )}
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
                <Button variant="contained" size="small" sx={{ fontWeight: 600, textTransform: 'none', fontSize: { xs: 10, sm: 11, md: 12 }, px: { xs: 1, sm: 1.5, md: 2 }, whiteSpace: 'nowrap', }}>
                  Save Template
                </Button>
                <Button variant="contained" size="small" sx={{ fontWeight: 600, textTransform: 'none', fontSize: { xs: 10, sm: 11, md: 12 }, px: { xs: 1, sm: 1.5, md: 2 }, whiteSpace: 'nowrap', }}>
                  Send Test Email
                </Button>
              </Stack>
              <Button variant="contained" size="small" sx={{ fontWeight: 700, textTransform: 'none', fontSize: { xs: 10, sm: 11, md: 12 }, px: { xs: 1, sm: 1.5, md: 2 }, whiteSpace: 'nowrap', }}>
                Save & Preview
              </Button>
            </Stack>
          )} */}
        </Grid>
      </Grid>
    </ParentCard>
  );
};

export default AdmissionLetterEditor;
