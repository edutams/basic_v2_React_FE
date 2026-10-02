import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, useTheme,
  Alert, Snackbar, Skeleton,
} from '@mui/material';
import { IconPrinter, IconLock } from '@tabler/icons-react';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import { decodeLinkParams } from '@/utils/scoreLinks';

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

const CaBreakdownTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Context arrives as one opaque token — same pattern as the Score Sheet /
  // Performance Analytics pages — so a deep link never shows raw student or
  // class ids in the address bar.
  const linkParams = useMemo(() => decodeLinkParams(searchParams.get('t')), [searchParams]);
  const studentRegistrationId = linkParams.student_registration_id;
  const userId = linkParams.user_id;
  const sessionTermId = linkParams.session_term_id;
  const classArmId = linkParams.class_arm_id;

  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [payload, setPayload] = useState(null);
  const [selectedCaIndex, setSelectedCaIndex] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Self mode (a learner opening the page from the sidebar) — populated by
  // the registration effect below; deep-linked pages never touch these.
  const [myTerms, setMyTerms] = useState([]);
  const [selfTermId, setSelfTermId] = useState('');
  const [termsLoaded, setTermsLoaded] = useState(false);

  // Deep links (admin dossier / score sheet) carry a student id in the
  // token. A learner arriving with none is resolved server-side from the
  // auth token, and this term list drives their term selector.
  const hasIdentity = Boolean(studentRegistrationId || userId);
  const isSelfMode = !hasIdentity;
  const effectiveSessionTermId = isSelfMode ? selfTermId : sessionTermId;
  const termsReady = !isSelfMode || (termsLoaded && Boolean(selfTermId));

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Self mode: the learner's own registrations (for the term selector).
  useEffect(() => {
    if (!isSelfMode) {
      setTermsLoaded(true);
      return;
    }
    let cancelled = false;
    resultDossierApi.getMyRegistration()
      .then((res) => {
        if (cancelled) return;
        const body = res?.data;
        if (body?.status) {
          const regs = body.data?.registrations || [];
          setMyTerms(regs);
          setSelfTermId((prev) => {
            const fallback = String(body.data?.default_session_term_id ?? '');
            if (prev && regs.some((r) => String(r.session_term_id) === prev)) return prev;
            return fallback;
          });
        } else {
          setError(body?.message || 'Failed to load your registration.');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load learner registration:', err);
        setError(err?.response?.data?.message || 'Failed to load your registration.');
      })
      .finally(() => {
        if (!cancelled) setTermsLoaded(true);
      });
    return () => { cancelled = true; };
  }, [isSelfMode]);

  useEffect(() => {
    if (!termsReady) {
      setPayload(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      setPaymentRequired(false);
      try {
        const body = {
          session_term_id: effectiveSessionTermId ? Number(effectiveSessionTermId) : undefined,
          class_arm_id: classArmId ? Number(classArmId) : undefined,
        };
        if (studentRegistrationId) body.student_registration_id = Number(studentRegistrationId);
        else if (userId) body.user_id = userId;
        // Self mode sends neither — the backend resolves the logged-in learner.

        const res = await scoreManagerApi.getCaBreakdown(body);
        const data = res?.data;
        if (cancelled) return;
        if (data?.status) {
          setPayload(data.data || null);
          setSelectedCaIndex((prev) => {
            const options = data.data?.ca_options || [];
            if (prev !== '' && options[prev]) return prev;
            return options.length ? 0 : '';
          });
        } else {
          setError(data?.message || 'Failed to load CA breakdown.');
          setPayload(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch CA breakdown:', err);
        if (err?.response?.data?.reason === 'payment_required') {
          setPaymentRequired(true);
        } else {
          setError(err?.response?.data?.message || 'Failed to load CA breakdown.');
        }
        setPayload(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [
    termsReady, effectiveSessionTermId, studentRegistrationId, userId, classArmId,
  ]);

  const caOptions = payload?.ca_options || [];
  const student = payload?.user_details || null;
  const caConfig = selectedCaIndex === '' ? null : caOptions[selectedCaIndex] || null;

  const subjectRows = useMemo(() => {
    if (!payload?.subjects || selectedCaIndex === '') return [];
    return payload.subjects.map((sub) => {
      const ca = sub.cas?.[selectedCaIndex] || null;
      return { ...sub, ca };
    });
  }, [payload, selectedCaIndex]);

  // True when at least one subject has an uploaded CA total for the selected
  // CA type — drives the "no scores yet" notice and hides the print/totals.
  const hasAnyScore = subjectRows.some(
    (s) => s.ca?.total !== null && s.ca?.total !== undefined,
  );

  const totalScore = caConfig
    ? subjectRows.reduce((sum, s) => sum + Number(s.ca?.total || 0), 0)
    : 0;
  const gradedCount = caConfig
    ? subjectRows.filter((s) => s.ca?.total !== null && s.ca?.total !== undefined).length
    : 0;
  const average = gradedCount > 0
    ? +(Math.round((totalScore / gradedCount) * 100) / 100)
    : 0;

  const handlePrint = async () => {
    if (selectedCaIndex === '') return;
    setPrinting(true);
    try {
      const body = {
        session_term_id: effectiveSessionTermId ? Number(effectiveSessionTermId) : undefined,
        class_arm_id: classArmId ? Number(classArmId) : undefined,
        ca_index: selectedCaIndex,
      };
      if (studentRegistrationId) body.student_registration_id = Number(studentRegistrationId);
      else if (userId) body.user_id = userId;

      const res = await scoreManagerApi.printCaBreakdown(body);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Failed to generate CA report PDF:', err);
      showSnackbar('Failed to generate the C.A report PDF', 'error');
    } finally {
      setPrinting(false);
    }
  };

  // ── Self mode: still resolving the learner's registration, or the first
  // breakdown fetch is in flight — skeleton matches the real layout so the
  // page never flashes a bare spinner.
  if ((isSelfMode && !termsLoaded) || (loading && !payload)) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Skeleton width={260} height={28} />
        </Box>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}><Skeleton width="80%" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Skeleton width="60%" /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><Skeleton width="50%" /></Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rounded" width={240} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={280} />
        </Box>
      </Paper>
    );
  }

  // ── Self mode: this account has never been registered ──────
  if (isSelfMode && myTerms.length === 0 && !payload) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {error || 'No student registration found for your account.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your Continuous Assessment sheet appears here once the school registers you for a term.
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (paymentRequired) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <IconLock size={48} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 12 }} />
          <Alert severity="warning" sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={900}>
              Payment Required
            </Typography>
            You must clear your outstanding fees before you can view your results for this
            term.
          </Alert>
          <Button variant="contained" size="small" onClick={() => navigate('/pay-school-fees')}>
            Go to Payments
          </Button>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      </Paper>
    );
  }

  if (!payload) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No student data found.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
    >
      {/* ── Card Header ──────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {caConfig && student
            ? `CA Report — ${student.class_name} ${student.arm_name} • ${student.lname} ${student.fname}`
            : 'Student C.A Scores'}
        </Typography>
        {caConfig && hasAnyScore && (
          <Button
            variant="contained"
            size="small"
            startIcon={<IconPrinter size={16} />}
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? 'Preparing PDF...' : 'Print C.A Result'}
          </Button>
        )}
      </Box>

      {/* ── Student Info ────────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <Typography variant="h6" color="text.dark" fontWeight={800}>
              Name Of Student: <strong>{student.lname} {student.fname} {student.mname}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.dark" fontWeight={800}>
              Student Class: <strong>{student.class_name} {student.arm_name}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="h6" color="text.dark" fontWeight={800}>
              Student ID: <strong>{student.user_id}</strong>
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* ── CA Type Filter ──────────────────────────────────── */}
      <Box sx={{ p: 2, borderBottom: caConfig ? 1 : 0, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          {isSelfMode && myTerms.length > 0 && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session-Term</InputLabel>
                <Select
                  value={selfTermId}
                  label="Session-Term"
                  onChange={(e) => setSelfTermId(e.target.value)}
                >
                  {myTerms.map((t) => (
                    <MenuItem key={t.session_term_id} value={String(t.session_term_id)}>
                      {t.session_name} - {t.term_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>CA Type</InputLabel>
              <Select
                value={selectedCaIndex}
                label="CA Type"
                onChange={(e) => setSelectedCaIndex(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">--Select Type--</MenuItem>
                {caOptions.map((ca, i) => (
                  <MenuItem key={ca.display_name || i} value={i}>{ca.display_name || `CA${i + 1}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {caOptions.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {isSelfMode
              ? 'Continuous assessment has not been set up for this term yet. Please check back later or contact your school.'
              : 'No CA types are configured for this session/term. Configure marks in Result Setup first.'}
          </Alert>
        )}
      </Box>

      {/* ── Subjects Table — loading skeleton while re-fetching for a new
          self-mode term, real table once data has arrived ───────── */}
      {loading && caOptions.length > 0 ? (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={280} />
        </Box>
      ) : caConfig && (
        <Box sx={{ p: 3 }}>
          {!hasAnyScore && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {isSelfMode
                ? 'No CA scores have been uploaded yet for this term. Your scores will appear here once your teachers upload them.'
                : 'No CA scores have been uploaded for this student yet.'}
            </Alert>
          )}
          <TableContainer sx={{ overflowX: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx, width: '3%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }}>Subjects</TableCell>
                  {(caConfig.entities || []).map((ent) => (
                    <TableCell key={ent.display_name} sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                      {ent.display_name}({ent.max_score})
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                    Total({caConfig.max_score})
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50', ...cellBorderSx }} align="center">
                    Percentage(100%)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }} align="center">Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={(caConfig.entities || []).length + 5} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        No registered subjects found for this student.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {subjectRows.map((sub, i) => (
                  <TableRow key={sub.subject_id ?? i} hover>
                    <TableCell sx={cellBorderSx}>{i + 1}</TableCell>
                    <TableCell sx={{ ...cellBorderSx, fontWeight: 500 }}>{sub.subject_name}</TableCell>
                    {(sub.ca?.entities || caConfig.entities || []).map((ent, ei) => (
                      <TableCell key={ei} align="center" sx={cellBorderSx}>
                        {ent.score ?? '-'}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ ...cellBorderSx, fontWeight: 700 }}>
                      {sub.ca?.total ?? '-'}
                    </TableCell>
                    <TableCell align="center" sx={cellBorderSx}>
                      {sub.ca?.percent != null ? `${sub.ca.percent}%` : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <strong>{sub.ca?.grade ?? '-'}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Total & Average ────────────────────────────── */}
          {hasAnyScore && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              <Typography variant="h6" fontWeight={700} color="primary">
                Total Score: {totalScore}
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                Average Score: {average}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Empty State ─────────────────────────────────────── */}
      {!caConfig && caOptions.length > 0 && (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Please select a CA type to view result
          </Typography>
        </Box>
      )}

      {/* ── Bottom Print Button ─────────────────────────────── */}
      {caConfig && hasAnyScore && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<IconPrinter size={16} />}
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? 'Preparing PDF...' : 'Print C.A Result'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CaBreakdownTab;
