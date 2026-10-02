import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, CircularProgress, Snackbar, Alert } from '@mui/material';
import { IconPrinter, IconClipboardCheck } from '@tabler/icons-react';
import { useResultTemplate } from '@/context/ResultTemplateContext';
import { getResultTemplate } from './templates';
import resultDossierApi from '@/api/tenant/result-dossier/resultDossierApi';
import { buildReportProp, gradeScaleFor, printNode } from './reportCardUtils';

// Standalone, routed counterpart to the "View / Print Class Dossier" action
// on the Student Dossier list (ReportSheetTab) — opened in its own tab via
// window.open so the class list stays put and the sidebar still shows here.
// Printing is a separate, explicit click: this page only loads and displays
// the dossiers; nothing is auto-printed.
const ClassDossierView = () => {
  const [searchParams] = useSearchParams();
  const classArmId = searchParams.get('class_arm_id');
  const sessionTermId = searchParams.get('session_term_id');
  const { getTemplateIndexForSample } = useResultTemplate();
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [termInfo, setTermInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [reportCache, setReportCache] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (!classArmId || !sessionTermId) {
      setError('Missing class arm or session term — open this page from the Student Dossier list.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await resultDossierApi.getClassStudents({ class_arm_id: classArmId, session_term_id: sessionTermId });
        const body = res?.data;
        if (!body?.status) throw new Error(body?.message || 'Failed to fetch class students');
        if (cancelled) return;

        const withResults = (body.data?.students || []).filter((s) => s.has_result);
        setClassInfo(body.data?.class_arm || null);
        setTermInfo(body.data?.session_term || null);
        setStudents(withResults);

        const reports = await Promise.all(
          withResults.map((s) =>
            resultDossierApi
              .getStudentReport({ student_registration_id: s.student_registration_id })
              .then((r) => [s.student_registration_id, r?.data?.status ? r.data.data : null])
              .catch(() => [s.student_registration_id, null]),
          ),
        );
        if (cancelled) return;
        setReportCache(Object.fromEntries(reports.filter(([, report]) => report !== null)));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load class dossier:', err);
          setError(err?.message || 'Failed to load class dossiers');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [classArmId, sessionTermId]);

  const handlePrint = () => {
    if (!printNode(printRef.current, 'Class Dossier')) {
      showSnackbar('Pop-up blocked. Allow pop-ups to print the dossier.', 'warning');
    }
  };

  const renderDossier = (student) => {
    const report = reportCache[student.student_registration_id];
    if (!report) return null;
    const sample = report.result_template?.result_sample;
    const TemplateComponent = getResultTemplate(getTemplateIndexForSample(sample));
    const cls = classInfo ? `${classInfo.class_name || ''} ${classInfo.arm_name || ''}`.trim() : student.class_name;
    return (
      <TemplateComponent
        student={{ ...student, user_id: student.admission_no || student.user_id, class_name: cls }}
        report={buildReportProp(report)}
        sessionTerm={{
          label: `${termInfo?.session_name || report.session_term?.session_name || ''} - ${termInfo?.term_name || report.session_term?.term_name || ''}`,
          term_id: termInfo?.term_id ?? report.session_term?.term_id ?? null,
          closing_date: report.session_term?.end_date || '',
          resumption_date: '',
        }}
        className={cls}
        gradeScale={gradeScaleFor(report)}
      />
    );
  };

  const className = [classInfo?.class_name, classInfo?.arm_name].filter(Boolean).join(' ');

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: '1px solid', borderColor: 'divider', width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Class Dossier{className ? ` — ${className}` : ''}{students.length > 0 ? ` (${students.length})` : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {loading && <CircularProgress size={18} />}
          {students.length > 0 && (
            <Button variant="contained" size="small" startIcon={<IconPrinter size={16} />} onClick={handlePrint}>
              Print Dossier
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto', width: '100%', maxWidth: '100%' }} ref={printRef}>
        {error ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="error" fontWeight={600}>{error}</Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary" mt={1}>Loading class dossiers…</Typography>
          </Box>
        ) : students.length > 0 ? (
          students.map((s, i) => (
            <Box key={s.student_registration_id} sx={{ mb: 2, '@media print': { pageBreakAfter: 'always' } }}>
              {renderDossier(s)}
              {i < students.length - 1 && <Divider sx={{ my: 4 }} />}
            </Box>
          ))
        ) : (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <IconClipboardCheck size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>No dossiers available</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              There are no students with results to display for this class.
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ClassDossierView;
