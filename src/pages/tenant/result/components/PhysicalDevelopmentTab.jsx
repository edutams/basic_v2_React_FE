import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import { FilterAlt as FilterIcon, Save as SaveIcon } from '@mui/icons-material';
import physicalRecordApi from '@/api/tenant/result/physicalRecordApi';
import {
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
  fetchSessionTerms,
  fetchActiveSessionTerm,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const CLEANLINESS_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

/**
 * Bulk-entry grid for beginning/end-of-term weight, height and cleanliness
 * rating, one row per student in a class arm — feeds the report card's
 * physical development section (previously hardcoded placeholder text).
 */
const PhysicalDevelopmentTab = () => {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [sessionTermsData, setSessionTermsData] = useState([]);

  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [classId, setClassId] = useState('');
  const [armId, setArmId] = useState('');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    Promise.all([
      fetchSessions(),
      fetchTerms(),
      fetchProgrammes(),
      fetchSessionTerms(),
      fetchActiveSessionTerm(),
    ])
      .then(([sessRes, termRes, progRes, stRes, activeRes]) => {
        setSessions(sessRes.data || []);
        setTerms(termRes.data || []);
        setProgrammes(progRes.data || []);
        setSessionTermsData(stRes.data || []);

        const active = activeRes?.data;
        if (active?.session_id) setSessionId(active.session_id);
        if (active?.term_id) setTermId(active.term_id);
      })
      .catch((err) => console.error('Failed to load physical development filters:', err));
  }, []);

  useEffect(() => {
    if (!programmeId) return;
    fetchClassesByProgramme(programmeId)
      .then((r) => setClasses(r.data || []))
      .catch(console.error);
  }, [programmeId]);

  useEffect(() => {
    if (!classId) return;
    fetchClassArmsByClass(classId, { programme_id: programmeId || undefined })
      .then((r) => setArms(r.data || []))
      .catch(console.error);
  }, [classId, programmeId]);

  const sessionTermId = (() => {
    if (!sessionId || !termId) return null;
    const match = sessionTermsData.find(
      (st) =>
        String(st.session?.id) === String(sessionId) && String(st.term?.id) === String(termId),
    );
    return match?.id ?? null;
  })();

  const handleLoad = useCallback(() => {
    if (!armId || !sessionTermId) return;
    setLoading(true);
    setLoaded(false);
    setPage(0);
    physicalRecordApi
      .getRecords({ class_arm_id: armId, session_term_id: sessionTermId })
      .then((res) => {
        if (res.data?.status) {
          setStudents(res.data.data);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load physical records:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load students for this arm.',
          severity: 'error',
        });
      })
      .finally(() => setLoading(false));
  }, [armId, sessionTermId]);

  const updateField = (studentRegistrationId, field, value) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_registration_id === studentRegistrationId ? { ...s, [field]: value } : s,
      ),
    );
  };

  const handleSave = () => {
    setSaving(true);
    physicalRecordApi
      .saveRecords({
        class_arm_id: armId,
        records: students.map((s) => ({
          student_registration_id: s.student_registration_id,
          beginning_weight_kg: s.beginning_weight_kg || null,
          end_weight_kg: s.end_weight_kg || null,
          beginning_height_cm: s.beginning_height_cm || null,
          end_height_cm: s.end_height_cm || null,
          cleanliness_rating: s.cleanliness_rating || null,
        })),
      })
      .then((res) => {
        if (res.data?.status) {
          setSnackbar({
            open: true,
            message: 'Physical records saved successfully.',
            severity: 'success',
          });
        }
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Failed to save physical records.',
          severity: 'error',
        });
      })
      .finally(() => setSaving(false));
  };

  const numberField = (student, field, label, unit) => (
    <TextField
      size="small"
      type="number"
      value={student[field] ?? ''}
      onChange={(e) => updateField(student.student_registration_id, field, e.target.value)}
      placeholder={label}
      InputProps={{ endAdornment: unit }}
      sx={{ width: 110 }}
    />
  );

  const canSave = !saving && loaded && students.length > 0;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
        Physical Development
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Beginning/end-of-term weight, height and cleanliness rating — shown on each student's report
        card.
      </Typography>

      <Stack direction="row" flexWrap="wrap" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Session</InputLabel>
          <Select label="Session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            {sessions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.session_name || s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Term</InputLabel>
          <Select label="Term" value={termId} onChange={(e) => setTermId(e.target.value)}>
            {terms.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.term_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Programme</InputLabel>
          <Select
            label="Programme"
            value={programmeId}
            onChange={(e) => {
              setProgrammeId(e.target.value);
              setClassId('');
              setArmId('');
            }}
          >
            {programmes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.programme_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!programmeId}>
          <InputLabel>Class</InputLabel>
          <Select
            label="Class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setArmId('');
            }}
          >
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.class_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!classId}>
          <InputLabel>Class Arm</InputLabel>
          <Select label="Class Arm" value={armId} onChange={(e) => setArmId(e.target.value)}>
            {arms.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.class_arm_names}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={handleLoad}
          disabled={!armId || !sessionTermId}
        >
          Load Students
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!canSave}
          sx={{ ml: 'auto' }}
        >
          {saving ? 'Saving…' : 'Save Records'}
        </Button>
      </Stack>

      {loading ? (
        <TableContainer variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>S/N</TableCell>
                <TableCell>Student</TableCell>
                <TableCell align="center">Beginning Weight</TableCell>
                <TableCell align="center">End Weight</TableCell>
                <TableCell align="center">Beginning Height</TableCell>
                <TableCell align="center">End Height</TableCell>
                <TableCell align="center">Cleanliness Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" width={20} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="45%" />
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={110} height={36} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={110} height={36} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={110} height={36} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={110} height={36} sx={{ mx: 'auto' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={110} height={36} sx={{ mx: 'auto' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !loaded ? (
        <Alert severity="info">
          Choose a session, term and class arm, then click "Load Students".
        </Alert>
      ) : students.length === 0 ? (
        <Alert severity="info">No students found in this class arm for this term.</Alert>
      ) : (
        <>
          <TableContainer variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>S/N</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell align="center">Beginning Weight</TableCell>
                  <TableCell align="center">End Weight</TableCell>
                  <TableCell align="center">Beginning Height</TableCell>
                  <TableCell align="center">End Height</TableCell>
                  <TableCell align="center">Cleanliness Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((s, idx) => (
                    <TableRow key={s.student_registration_id}>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar src={s.avatar} sx={{ width: 28, height: 28 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {s.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {s.admission_no}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {numberField(s, 'beginning_weight_kg', 'Weight', 'kg')}
                      </TableCell>
                      <TableCell align="center">
                        {numberField(s, 'end_weight_kg', 'Weight', 'kg')}
                      </TableCell>
                      <TableCell align="center">
                        {numberField(s, 'beginning_height_cm', 'Height', 'cm')}
                      </TableCell>
                      <TableCell align="center">
                        {numberField(s, 'end_height_cm', 'Height', 'cm')}
                      </TableCell>
                      <TableCell align="center">
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                          <Select
                            displayEmpty
                            value={s.cleanliness_rating || ''}
                            onChange={(e) =>
                              updateField(
                                s.student_registration_id,
                                'cleanliness_rating',
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value="">
                              <em>—</em>
                            </MenuItem>
                            {CLEANLINESS_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    count={students.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? 'Saving…' : 'Save Records'}
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhysicalDevelopmentTab;
