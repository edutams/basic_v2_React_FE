import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
} from '@mui/material';
import { IconPrinter, IconChartBar, IconArrowLeft, IconClipboardCheck } from '@tabler/icons-react';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { usePermissions } from '@/context/TenantContext/permissions';
import { getResultTemplate } from './templates';
import { buildReportProp, gradeScaleFor, printNode } from './reportCardUtils';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import { getTenantInfo } from '@/api/tenant/tenant_api';

/**
 * Learner-facing Report Card.
 *
 * Loads the logged-in student's own registrations (one per session-term),
 * lets them pick the term, then renders their own report card through the
 * school's configured result template — the learner counterpart of the
 * admin Student Dossier (ReportSheetTab).
 */
const ReportCardTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { getTemplateIndexForSample } = useResultTemplate();
  const { roles } = useTenantAuth();
  const { can } = usePermissions();
  const printRef = useRef(null);

  const [registrations, setRegistrations] = useState([]);
  const [selectedSessionTerm, setSelectedSessionTerm] = useState('');
  const [report, setReport] = useState(null);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // The route is permission-gated to `result.client.view_report_sheet` (students);
  // a staff member landing here is pointed at the admin Student Dossier.
  const isLearner = can('result.client.view_report_sheet');
  const roleName = useMemo(() => {
    const list = Array.isArray(roles) ? roles : [];
    return list.map((r) => (typeof r === 'string' ? r : r?.name));
  }, [roles]);
  const isLearnerRole = roleName.includes('student') || roleName.includes('learner');

  useEffect(() => {
    getTenantInfo()
      .then((data) => setSchoolInfo(data?.data || null))
      .catch(() => setSchoolInfo(null));
  }, []);

  // ── 1. The learner's registrations (drives the term selector) ──
  const loadRegistrations = useCallback(async () => {
    setLoadingRegs(true);
    setError('');
    try {
      const res = await resultDossierApi.getMyRegistration();
      const body = res?.data;
      if (body?.status) {
        const regs = body.data?.registrations || [];
        setRegistrations(regs);
        setSelectedSessionTerm((prev) =>
          prev && regs.some((r) => String(r.session_term_id) === String(prev))
            ? prev
            : (body.data?.default_session_term_id ?? ''),
        );
        if (regs.length === 0) {
          setError('No student registration found for your account. Please contact your school.');
        }
      } else {
        setError(body?.message || 'Failed to load your registration.');
      }
    } catch (err) {
      console.error('Failed to load learner registration:', err);
      setError(err?.response?.data?.message || 'Failed to load your registration.');
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  // ── 2. The report card for the selected term ────────────────
  useEffect(() => {
    if (!selectedSessionTerm) {
      setReport(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingReport(true);
      setError('');
      try {
        const res = await resultDossierApi.getMyReport({
          session_term_id: Number(selectedSessionTerm),
        });
        const body = res?.data;
        if (cancelled) return;
        if (body?.status) {
          setReport(body.data || null);
        } else {
          setReport(null);
          setError(body?.message || 'Failed to load your report card.');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load learner report card:', err);
        setReport(null);
        setError(err?.response?.data?.message || 'Failed to load your report card.');
      } finally {
        if (!cancelled) setLoadingReport(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedSessionTerm]);

  const selectedRegistration = registrations.find(
    (r) => String(r.session_term_id) === String(selectedSessionTerm),
  );

  const sessionTermLabel = report?.session_term
    ? `${report.session_term.session_name} - ${report.session_term.term_name}`
    : [selectedRegistration?.session_name, selectedRegistration?.term_name]
        .filter(Boolean)
        .join(' - ');

  const className = report?.class_arm
    ? [report.class_arm.class_name, report.class_arm.arm_name].filter(Boolean).join(' ')
    : [selectedRegistration?.class_name, selectedRegistration?.arm_name].filter(Boolean).join(' ');

  const schoolName = schoolInfo?.tenant_name || schoolInfo?.name || '';

  // ── Publish gate (basic v1  pattern) ─────────────
  // Learners only see their report card once the School Portal Admin has
  // approved AND the Head of School has published the results; until then
  // the card body is replaced by a notice naming the missing stage(s).
  const spaApproved = report?.result_publish?.spa_publish === 'yes';
  const hosPublished = report?.result_publish?.head_of_school_publish === 'yes';
  const fullyPublished = spaApproved && hosPublished;
  const publishBlocked = Boolean(report) && !fullyPublished;

  const handlePrint = () => {
    if (!printNode(printRef.current, 'Report Card')) {
      showSnackbar('Pop-up blocked. Allow pop-ups to print your report card.', 'warning');
    }
  };

  const openCaBreakdown = () => {
    const params = new URLSearchParams();
    if (selectedSessionTerm) params.set('session_term_id', selectedSessionTerm);
    if (selectedRegistration?.id) params.set('student_registration_id', selectedRegistration.id);
    navigate(`/result-ca_breakdown?${params.toString()}`);
  };

  // ── Staff safety net: this page is for learners ─────────────
  if (!isLearner && !isLearnerRole) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <IconClipboardCheck
            size={48}
            color={isDark ? '#fff' : '#94a3b8'}
            style={{ marginBottom: 12 }}
          />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            Report Card is available to learners.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Use the Student Dossier to view a class list and any student&apos;s dossier.
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconArrowLeft size={16} />}
            onClick={() => navigate('/result-reportsheet')}
          >
            Open Student Dossier
          </Button>
        </Box>
      </Paper>
    );
  }

  if (loadingRegs) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your registration...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error && registrations.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      {/* ── Term selector + actions ─────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              flex: 1,
              minWidth: 260,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Session-Term</InputLabel>
              <Select
                value={selectedSessionTerm}
                label="Session-Term"
                onChange={(e) => setSelectedSessionTerm(e.target.value)}
              >
                {registrations.length === 0 && (
                  <MenuItem value="" disabled>
                    -- No terms --
                  </MenuItem>
                )}
                {registrations.map((r) => (
                  <MenuItem key={r.session_term_id} value={r.session_term_id}>
                    {r.session_name} - {r.term_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {sessionTermLabel && (
              <Chip
                size="small"
                variant="outlined"
                label={sessionTermLabel}
                sx={{ fontWeight: 600 }}
              />
            )}
            {!publishBlocked && report?.summary?.overall_position && (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`${report.summary.overall_position} in class`}
                sx={{ fontWeight: 700 }}
              />
            )}
            {!publishBlocked && report?.summary?.average_score != null && (
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`Average: ${report.summary.average_score}`}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              color="info"
              startIcon={<IconChartBar size={16} />}
              onClick={openCaBreakdown}
              disabled={!selectedSessionTerm}
            >
              C.A Breakdown
            </Button>
            {report && !publishBlocked && (
              <Button
                size="small"
                variant="contained"
                startIcon={<IconPrinter size={16} />}
                onClick={handlePrint}
              >
                Print Report Card
              </Button>
            )}
          </Box>
        </Box>

        {error && registrations.length > 0 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {registrations.length === 0 && !error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="warning">
              You have no registration on record yet, so no report card can be built.
            </Alert>
          </Box>
        )}
      </Paper>

      {/* ── Report card ─────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={report?.student?.avatar || undefined}
              sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}
              variant="rounded"
            >
              {(report?.student?.fname?.[0] || '') + (report?.student?.lname?.[0] || '') || 'ST'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {report
                  ? `Report Card — ${report.student?.lname} ${report.student?.fname}`
                  : 'My Report Card'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[className, sessionTermLabel, schoolName].filter(Boolean).join(' • ')}
              </Typography>
            </Box>
          </Box>
          {report && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {!publishBlocked && (
                <>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Subjects: ${report.summary?.subjects_taken ?? 0}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Total: ${report.summary?.total_score ?? 0}`}
                  />
                </>
              )}
              <Chip
                size="small"
                color={fullyPublished ? 'success' : 'default'}
                variant="outlined"
                label={fullyPublished ? 'Published' : 'Not published yet'}
              />
            </Box>
          )}
        </Box>

        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%', maxWidth: '100%' }}
          ref={printRef}
        >
          {loadingReport ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading your report card...
              </Typography>
            </Box>
          ) : publishBlocked ? (
            <Box sx={{ p: { xs: 2, sm: 3 }, display: 'grid', gap: 2 }}>
              {!spaApproved && (
                <Alert severity="warning">
                  <Typography variant="subtitle2" fontWeight={900}>
                    SPA Approval Notification
                  </Typography>
                  This report card is not available at the moment because the School
                  Portal Admin has not approved all the scores.
                </Alert>
              )}
              {!hosPublished && (
                <Alert severity="warning">
                  <Typography variant="subtitle2" fontWeight={900}>
                    HoS Approval Notification
                  </Typography>
                  This report card is not available at the moment because the Head of
                  School has not published all the scores.
                </Alert>
              )}
            </Box>
          ) : report ? (
            <ReportCardView
              report={report}
              className={className}
              sessionTermLabel={sessionTermLabel}
              getTemplateIndexForSample={getTemplateIndexForSample}
            />
          ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <IconClipboardCheck
                size={48}
                color={isDark ? '#fff' : '#94a3b8'}
                style={{ marginBottom: 12 }}
              />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {selectedSessionTerm
                  ? 'No report card available for this term yet.'
                  : 'Select a session-term to view your report card.'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Results appear here once your school uploads and submits your scores.
              </Typography>
            </Box>
          )}
        </Box>

        {report && !publishBlocked && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              variant="contained"
              startIcon={<IconPrinter size={16} />}
              onClick={handlePrint}
            >
              Print Report Card
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: (t) => t.zIndex.modal + 9999 }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Renders the dossier payload through the school's configured template.
const ReportCardView = ({ report, className, sessionTermLabel, getTemplateIndexForSample }) => {
  const sample = report.result_template?.result_sample;
  const TemplateComponent = getResultTemplate(getTemplateIndexForSample(sample));
  const cls = className || '';

  return (
    <TemplateComponent
      student={{
        student_registration_id: report.student?.student_registration_id,
        user_id: report.student?.admission_no || report.student?.user_id,
        admission_no: report.student?.admission_no,
        fname: report.student?.fname || '',
        lname: report.student?.lname || '',
        mname: report.student?.mname || '',
        sex: report.student?.sex || '',
        image: report.student?.avatar || '',
        avatar: report.student?.avatar || '',
        class_name: cls,
      }}
      report={buildReportProp(report)}
      sessionTerm={{
        label: sessionTermLabel,
        term_id: report.session_term?.term_id ?? null,
        closing_date: report.session_term?.end_date || '',
        resumption_date: '',
      }}
      className={cls}
      gradeScale={gradeScaleFor(report)}
    />
  );
};

export default ReportCardTab;
