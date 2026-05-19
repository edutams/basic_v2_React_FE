import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import TiptapEdit from 'src/views/forms/form-tiptap/TiptapEdit';
import templateImg from 'src/assets/images/admission/template.jpg';

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/admission-setup', title: 'Admission Setup' },
  { title: 'Create New Admission Batch' },
];

// ── Dummy programmes & classes ────────────────────────────────────────────────
const DUMMY_PROGRAMMES = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];

const DUMMY_CLASSES = {
  1: ['JSS1', 'JSS2', 'JSS3'],
  2: ['SSS1', 'SSS2', 'SSS3'],
};

// ── Placeholder fields for the letter editor ──────────────────────────────────
const PLACEHOLDER_FIELDS = [
  { label: "Student's First Name", value: "[Student's First Name]" },
  { label: "Student's Last Name", value: "[Student's Last Name]" },
  { label: 'Class Name', value: '[Class Name]' },
  { label: 'Entrance Score', value: '[Entrance Score]' },
  { label: "Parent's Name", value: "[Parent's Name]" },
  { label: 'School Division', value: '[School Division]' },
  { label: 'Admission Session', value: '[Admission Session]' },
];

// ── Letter templates ──────────────────────────────────────────────────────────
const LETTER_TEMPLATES = [
  {
    id: 'congratulations',
    label: 'Congratulations Letter',
    preview:
      "Dear [Student's First Name] [Student's Last Name],\n\nCongratulations! You've achieved an entrance score of [Entrance Score],\n\nWelcome to [Class Name] at [School Division]. We look forward to having you join us for the [Admission Session].",
    image: templateImg,
  },
  {
    id: 'offer',
    label: 'Admission Offer',
    preview:
      "Dear [Student's First Name],\n\nWe are pleased to offer you admission to [Class Name] at [School Division] for the [Admission Session].\n\nPlease complete your registration to confirm your place.",
    image: templateImg,
  },
];

// ── Sample values for live preview placeholder substitution ──────────────────
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
    // Escape the token for use in a regex, then match with or without the brackets
    const inner = token.replace(/^\[/, '').replace(/\]$/, '');
    // Match [token], [token with HTML entities], or just the inner text
    const pattern = new RegExp(
      `\\[${inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]|${inner.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'gi',
    );
    result = result.replace(pattern, `<strong style="color:#1976d2">${value}</strong>`);
  });
  return result;
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CreateAdmissionBatch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-filled from navigation state (when editing)
  const existingBatch = location.state?.batch ?? null;
  const termLabel = location.state?.termLabel ?? '';

  // ── Form state ──────────────────────────────────────────────────────────
  const [batchName, setBatchName] = useState(existingBatch?.batch_name ?? '');
  const [programmeId, setProgrammeId] = useState(existingBatch?.programme_id ?? '');
  const [selectedClasses, setSelectedClasses] = useState(existingBatch?.classes ?? []);

  // Entrance exam
  const [entranceExam, setEntranceExam] = useState(existingBatch?.has_entrance_exam ?? false);
  const [examType, setExamType] = useState(existingBatch?.exam_type ?? 'CBT');
  const [examDate, setExamDate] = useState(existingBatch?.exam_date ?? '');
  const [passMark, setPassMark] = useState(existingBatch?.pass_mark ?? 70);

  // Payment
  const [enablePayment, setEnablePayment] = useState(existingBatch?.require_payment ?? false);
  const [preAppFee, setPreAppFee] = useState(existingBatch?.application_fee ?? '');
  const [postAppFee, setPostAppFee] = useState(existingBatch?.acceptance_fee ?? '');

  // Admission letter
  const [enableLetter, setEnableLetter] = useState(existingBatch?.enable_letter ?? false);
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [letterContent, setLetterContent] = useState('');

  // Status
  const [isOpen, setIsOpen] = useState(existingBatch?.status === 'open' ?? true);

  // ── Class chip toggle ───────────────────────────────────────────────────
  const availableClasses = DUMMY_CLASSES[programmeId] ?? [];

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );
  };

  // ── Handle submit ───────────────────────────────────────────────────────
  const handleSubmit = () => {
    const payload = {
      batch_name: batchName,
      programme_id: programmeId,
      classes: selectedClasses,
      has_entrance_exam: entranceExam,
      exam_type: examType,
      exam_date: examDate,
      pass_mark: passMark,
      require_payment: enablePayment,
      application_fee: enablePayment ? Number(preAppFee) : 0,
      acceptance_fee: enablePayment ? Number(postAppFee) : 0,
      enable_letter: enableLetter,
      letter_content: letterContent,
      status: isOpen ? 'open' : 'close',
    };
    console.log('Batch payload:', payload);
    navigate('/admission-setup');
  };

  return (
    <PageContainer title="Create New Admission Batch" description="Set up a new admission batch">
      <Breadcrumb title="Create New Admission Batch" items={BCrumb} subtitle={termLabel} sx={{ mb: 0 }}></Breadcrumb>

      {/* <Box display="flex" justifyContent="end" alignItems="center" mb={1} mt={0}>
         <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admission-setup')}
          sx={{ fontWeight: 700 }}
        >
          Back
        </Button>
      </Box> */}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Batch Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Eg Batch3"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Entry Term
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={termLabel || '2025/2026 First Term'}
                  disabled
                  sx={{ bgcolor: 'grey.50' }}
                />
              </Box>

              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Programme
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={programmeId}
                      onChange={(e) => {
                        setProgrammeId(e.target.value);
                        setSelectedClasses([]);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      {DUMMY_PROGRAMMES.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Class
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value=""
                      onChange={(e) => {
                        const cls = e.target.value;
                        if (cls && !selectedClasses.includes(cls)) {
                          setSelectedClasses((prev) => [...prev, cls]);
                        }
                      }}
                      displayEmpty
                      disabled={!programmeId}
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      {availableClasses.map((cls) => (
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                {selectedClasses.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5}>
                    {selectedClasses.map((cls) => (
                      <Chip
                        key={cls}
                        label={cls}
                        size="small"
                        onDelete={() => toggleClass(cls)}
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Entrance Exam */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Entrance Exam
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Require an entrance exam for this batch
                    </Typography>
                  </Box>
                  <Switch
                    checked={entranceExam}
                    onChange={(e) => setEntranceExam(e.target.checked)}
                    color="primary"
                  />
                </Box>

                {entranceExam && (
                  <Box mt={2}>
                    {/* CBT / Physical toggle */}
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Select CBT or Physical
                    </Typography>
                    <ToggleButtonGroup
                      value={examType}
                      exclusive
                      onChange={(_, val) => val && setExamType(val)}
                      size="small"
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="CBT" sx={{ fontWeight: 700, px: 2 }}>
                        CBT
                      </ToggleButton>
                      <ToggleButton value="Physical" sx={{ fontWeight: 700, px: 2 }}>
                        Physical
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          Sat Date
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          slotProps={{ inputLabel: { shrink: true } }}
                          placeholder="MM - DD - YYYY"
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          Pass Mark / 100
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={passMark}
                          onChange={(e) => setPassMark(e.target.value)}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Enable Payment */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Enable Payment
                  </Typography>
                  <Switch
                    checked={enablePayment}
                    onChange={(e) => setEnablePayment(e.target.checked)}
                    color="primary"
                  />
                </Box>

                {enablePayment && (
                  <Stack spacing={2} mt={2}>
                    {/* Pre-Application */}
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
                        Pre-Application
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label="Application Form"
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                        <Chip
                          label="Registration Fee"
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="0"
                        value={preAppFee}
                        onChange={(e) => setPreAppFee(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                          },
                        }}
                        inputProps={{ min: 0 }}
                      />
                      {preAppFee > 0 && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={600}
                          mt={0.5}
                          display="block"
                        >
                          Pre-Application : ₦{Number(preAppFee).toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Post-Application */}
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block" mb={0.75}>
                        Post-Application
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label="Application Form"
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                        <Chip
                          label="Registration Fee"
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="0"
                        value={postAppFee}
                        onChange={(e) => setPostAppFee(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                          },
                        }}
                        inputProps={{ min: 0 }}
                      />
                      {postAppFee > 0 && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={600}
                          mt={0.5}
                          display="block"
                        >
                          Post-Application : ₦{Number(postAppFee).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Enable Admission Letter */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Enable Admission Letter
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Edit Admission letter
                    </Typography>
                  </Box>
                  <Switch
                    checked={enableLetter}
                    onChange={(e) => setEnableLetter(e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>

              <Divider />

              {/* Status */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Open the batch for applications
                    </Typography>
                  </Box>
                  <Switch
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
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
              {/* ── Placeholder Fields ── */}
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
                      title={`Click to copy: ${field.value}`}
                      placement="right"
                    >
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

                {/* Template Options */}
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
                      onClick={() => setSelectedTemplate(tpl)}
                      sx={{
                        flex: 1,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        borderRadius: 1.5,
                        border: '2px solid',
                        borderColor: selectedTemplate?.id === tpl.id ? 'primary.main' : 'divider',
                        transition: 'all 0.15s',
                        bgcolor:
                          selectedTemplate?.id === tpl.id ? 'primary.light' : 'background.paper',
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

              {/* ── Letter Editor ── */}
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

                {/* Template selector */}
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedTemplate?.id ?? ''}
                  onChange={(e) => {
                    const tpl = LETTER_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tpl) setSelectedTemplate(tpl);
                  }}
                  sx={{ mb: 1.5 }}
                  label="Template"
                >
                  {LETTER_TEMPLATES.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl.id}>
                      {tpl.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Tiptap rich text editor */}
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
                    initialContent={
                      selectedTemplate
                        ? selectedTemplate.preview
                            .split('\n')
                            .map((line) => (line.trim() ? `<p>${line}</p>` : '<p></p>'))
                            .join('')
                        : '<p>Type here...</p>'
                    }
                    onUpdate={({ editor }) => setLetterContent(editor.getHTML())}
                  />
                </Box>

                {/* Action buttons */}
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
                    onClick={() => {}}
                  >
                    Save
                  </Button>
                </Stack>
              </Grid>

              {/* ── Live Preview ── */}
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
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    overflowY: 'auto',
                    maxHeight: 320,
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
                      dangerouslySetInnerHTML={{
                        __html: applyPreviewSamples(letterContent),
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      Start typing in the editor to see a live preview
                    </Typography>
                  )}
                </Paper>

                {/* <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="success.dark" fontWeight={600}>
                    ✓ All fields are complete and ready to send!
                  </Typography>
                </Box> */}
              </Grid>
            </Grid>
          </ParentCard>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{ fontWeight: 700, px: 4 }}
            >
              Create New Admission
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CreateAdmissionBatch;
