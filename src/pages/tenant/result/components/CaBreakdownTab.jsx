import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Grid, FormControl, InputLabel, Select, MenuItem, Avatar, useTheme,
  CircularProgress, Alert, Snackbar,
} from '@mui/material';
import { IconPrinter } from '@tabler/icons-react';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';

const cellBorderSx = { borderRight: '1px solid', borderColor: 'divider' };

// Print only the report card — hide chrome, filters, buttons and layout.
const PRINT_STYLE_ID = 'ca-breakdown-print-style';
const printCss = `
@page { size: portrait; margin: 10mm; }
@media print {
  body * { visibility: hidden !important; }
  .ca-print-root, .ca-print-root * { visibility: visible !important; }
  .ca-print-root {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
    color: #000 !important;
  }
  .ca-no-print, .ca-no-print * { display: none !important; visibility: hidden !important; }
}
`;

const CaBreakdownTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams] = useSearchParams();

  const studentRegistrationId = searchParams.get('student_registration_id');
  const userId = searchParams.get('user_id');
  const sessionTermId = searchParams.get('session_term_id');
  const classArmId = searchParams.get('class_arm_id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [selectedCaIndex, setSelectedCaIndex] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const hasIdentity = Boolean(studentRegistrationId || userId);

  useEffect(() => {
    if (!document.getElementById(PRINT_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = PRINT_STYLE_ID;
      style.textContent = printCss;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    getTenantInfo()
      .then((data) => setSchoolInfo(data?.data || null))
      .catch(() => setSchoolInfo(null));
  }, []);

  useEffect(() => {
    if (!hasIdentity) {
      setPayload(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const body = {
          session_term_id: sessionTermId ? Number(sessionTermId) : undefined,
          class_arm_id: classArmId ? Number(classArmId) : undefined,
        };
        if (studentRegistrationId) body.student_registration_id = Number(studentRegistrationId);
        else body.user_id = userId;

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
        setError(err?.response?.data?.message || 'Failed to load CA breakdown.');
        setPayload(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [hasIdentity, studentRegistrationId, userId, sessionTermId, classArmId]);

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

  const totalScore = caConfig
    ? subjectRows.reduce((sum, s) => sum + Number(s.ca?.total || 0), 0)
    : 0;
  const gradedCount = caConfig
    ? subjectRows.filter((s) => s.ca?.total !== null && s.ca?.total !== undefined).length
    : 0;
  const average = gradedCount > 0
    ? +(Math.round((totalScore / gradedCount) * 100) / 100)
    : 0;

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.school_name || '';
  const schoolAddress = schoolInfo?.address || '';
  const schoolPhone = schoolInfo?.phone || schoolInfo?.tenant_phone || '';
  const schoolLogo = schoolInfo?.logo || schoolInfo?.school_logo || schoolInfo?.image || '';
  const sessionTermLabel = payload?.session_term
    ? `${payload.session_term.session_name} - ${payload.session_term.term_name}`
    : '';

  const handlePrint = () => window.print();

  if (!hasIdentity) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Open a student&apos;s C.A Report from the Result Manager to view their breakdown.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            A student registration or user id is required.
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading CA breakdown...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
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
      className="ca-print-root"
      sx={{ borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}
    >
      {/* ── Card Header (chrome — hidden when printing) ─────── */}
      <Box className="ca-no-print" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {caConfig && student
            ? `CA Report — ${student.class_name} ${student.arm_name} • ${student.lname} ${student.fname}`
            : 'Student C.A Scores'}
        </Typography>
        {caConfig && (
          <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
            Print C.A Result
          </Button>
        )}
      </Box>

      {/* ── School Info Header ──────────────────────────────── */}
      <Box sx={{ p: 2, pb: 2, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {schoolLogo ? (
            <Avatar src={schoolLogo} sx={{ width: 64, height: 64 }} variant="rounded" />
          ) : (
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 20 }} variant="rounded">
              {schoolName?.[0] || 'S'}
            </Avatar>
          )}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={900} sx={{ textTransform: 'uppercase' }}>
              {schoolName || 'School'}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="text.secondary">
              {schoolAddress}{schoolPhone ? `  |  Phone: ${schoolPhone}` : ''}
            </Typography>
            {sessionTermLabel && (
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
                {sessionTermLabel}
              </Typography>
            )}
          </Box>
        </Box>
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

      {/* ── CA Type Filter (UI chrome — hidden when printing) ── */}
      <Box className="ca-no-print" sx={{ p: 2, borderBottom: caConfig ? 1 : 0, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
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
            No CA types are configured for this session/term. Configure marks in Result Setup first.
          </Alert>
        )}
      </Box>

      {/* ── Subjects Table ──────────────────────────────────── */}
      {caConfig && (
        <Box sx={{ p: 3 }}>
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
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Total Score: {totalScore}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              Average Score: {average}
            </Typography>
          </Box>
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

      {/* ── Bottom Print Button (chrome — hidden when printing) ── */}
      {caConfig && (
        <Box className="ca-no-print" sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
            Print C.A Result
          </Button>
        </Box>
      )}

      <Snackbar
        className="ca-no-print"
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
