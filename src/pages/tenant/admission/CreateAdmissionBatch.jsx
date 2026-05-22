import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Switch,
  Chip,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/full/shared/breadcrumb/Breadcrumb';
import AdmissionLetterEditor from '@/components/tenant/admission/setup/AdmissionLetterEditor';

const CREATE_BCRUMB = [
  { to: '/', title: 'Home' },
  { to: '/admission-setup', title: 'Admission Setup' },
  { title: 'Create New Admission Batch' },
];

const EDIT_BCRUMB = [
  { to: '/', title: 'Home' },
  { to: '/admission-setup', title: 'Admission Setup' },
  { title: 'Edit Admission Batch' },
];

const DUMMY_PROGRAMMES = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];

const DUMMY_CLASSES = {
  1: ['JSS1', 'JSS2', 'JSS3'],
  2: ['SSS1', 'SSS2', 'SSS3'],
};

const CreateAdmissionBatch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const existingBatch = location.state?.batch ?? null;
  const termLabel = location.state?.termLabel ?? '';
  const isEdit = Boolean(existingBatch);

  const [batchName, setBatchName] = useState(existingBatch?.batch_name ?? '');
  const [programmeId, setProgrammeId] = useState(existingBatch?.programme_id ?? '');
  const [selectedClasses, setSelectedClasses] = useState(existingBatch?.classes ?? []);

  const [entranceExam, setEntranceExam] = useState(existingBatch?.has_entrance_exam ?? false);
  const [examType, setExamType] = useState(existingBatch?.exam_type ?? 'CBT');
  const [examDate, setExamDate] = useState(existingBatch?.exam_date ?? '');
  const [passMark, setPassMark] = useState(existingBatch?.pass_mark ?? 70);

  const [enablePayment, setEnablePayment] = useState(existingBatch?.require_payment ?? false);
  const [preAppFee, setPreAppFee] = useState(existingBatch?.application_fee ?? '');
  const [postAppFee, setPostAppFee] = useState(existingBatch?.acceptance_fee ?? '');

  const [enableLetter, setEnableLetter] = useState(existingBatch?.enable_letter ?? false);
  const [letterContent, setLetterContent] = useState('');

  const [isOpen, setIsOpen] = useState(existingBatch?.status !== 'close');

  const availableClasses = DUMMY_CLASSES[programmeId] ?? [];

  const toggleClass = (cls) =>
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );

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
    <PageContainer
      title={isEdit ? 'Edit Admission Batch' : 'Create New Admission Batch'}
      description="Set up a new admission batch"
    >
      <Breadcrumb
        title={isEdit ? 'Edit Admission Batch' : 'Create New Admission Batch'}
        subtitle={termLabel}
        items={isEdit ? EDIT_BCRUMB : CREATE_BCRUMB}
      />

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

              <Box sx={{ bgcolor: 'primary.light', p: 2 }}>
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
                      disabled={!programmeId}
                      onChange={(e) => {
                        const cls = e.target.value;
                        if (cls && !selectedClasses.includes(cls))
                          setSelectedClasses((prev) => [...prev, cls]);
                      }}
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
                          bgcolor: 'grey.50',
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
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Select CBT or Physical
                    </Typography>
                    <ToggleButtonGroup
                      value={examType}
                      exclusive
                      size="small"
                      sx={{ mb: 2 }}
                      onChange={(_, val) => val && setExamType(val)}
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
          <AdmissionLetterEditor onChange={setLetterContent} />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{ fontWeight: 700, px: 4 }}
            >
              {isEdit ? 'Save Changes' : 'Create New Admission'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CreateAdmissionBatch;
