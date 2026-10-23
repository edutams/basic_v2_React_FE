import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { IconDownload, IconPrinter, IconAlertCircle } from '@tabler/icons-react';
import { fetchVerifyResult } from '@/api/tenant/public/verifyResultApi';
import { getResultTemplate } from '@/pages/tenant/result/components/templates';
import {
  buildReportProp,
  gradeScaleFor,
  printNode,
} from '@/pages/tenant/result/components/reportCardUtils';
import { sampleIndex } from '@/context/ResultTemplateContext';
import { TenantAuthContext } from '@/context/TenantContext/auth';

/**
 * Public result page behind the "Download Result" link Result → Messaging
 * sends to parents (/verifyresult/:tenantId/:regId). No login: the API it
 * calls is the public verify-result route, which re-applies the school's
 * publish and result-payment gates server-side. "Download" and "Print" both
 * go through printNode — the browser's print dialog is what offers Save as
 * PDF, exactly like every other result sheet in the app.
 */
const VerifyResult = () => {
  const { tenantId, regId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      setNotice('');
      try {
        const body = await fetchVerifyResult(tenantId, regId);
        if (cancelled) return;
        if (body?.status && body?.data) {
          setReport(body.data);
        } else {
          setError(body?.message || 'This result could not be loaded.');
        }
      } catch (err) {
        if (cancelled) return;
        setReport(null);
        setError(err?.response?.data?.message || 'This result could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId, regId]);

  const handlePrint = () => {
    if (!printNode(printRef.current, 'Student Result')) {
      setNotice('Pop-up blocked. Allow pop-ups for this page to print or save the result.');
    }
  };

  const sessionTermLabel = report?.session_term
    ? [report.session_term.session_name, report.session_term.term_name].filter(Boolean).join(' - ')
    : '';
  const className = report?.class_arm
    ? [report.class_arm.class_name, report.class_arm.arm_name].filter(Boolean).join(' ')
    : '';
  const studentName = report?.student
    ? [report.student.fname, report.student.mname, report.student.lname].filter(Boolean).join(' ')
    : '';

  const TemplateComponent = report
    ? getResultTemplate(sampleIndex(report.result_template?.result_sample))
    : null;

  // Templates read their school header through useTenantBranding, which is
  // fed by TenantAuthProvider in the signed-in app — supply the same shape
  // here so the printed card carries the school's real name and logo.
  const tenantInfo = report?.school
    ? {
        tenant_name: report.school.name || '',
        logo_url: report.school.logo_url || null,
        address: report.school.address || '',
      }
    : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Student Result
            </Typography>
            {report && (
              <Typography variant="body2" color="text.secondary">
                {[studentName, className, sessionTermLabel].filter(Boolean).join(' • ')}
              </Typography>
            )}
          </Box>
          {report && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconPrinter size={16} />}
                onClick={handlePrint}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<IconDownload size={16} />}
                onClick={handlePrint}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Download
              </Button>
            </Stack>
          )}
        </Stack>

        {notice && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <Paper
          elevation={0}
          ref={printRef}
          sx={{
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: { xs: 1, sm: 2, md: 3 },
            overflow: 'auto',
          }}
        >
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading result…
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
              <IconAlertCircle size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {error}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                If you keep seeing this, contact your school for a fresh link.
              </Typography>
            </Box>
          ) : (
            report &&
            TemplateComponent && (
              <TenantAuthContext.Provider value={{ tenantInfo }}>
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
                    class_name: className,
                  }}
                  report={buildReportProp(report)}
                  sessionTerm={{
                    label: sessionTermLabel,
                    term_id: report.session_term?.term_id ?? null,
                    closing_date: report.session_term?.end_date || '',
                    resumption_date: '',
                  }}
                  className={className}
                  gradeScale={gradeScaleFor(report)}
                />
              </TenantAuthContext.Provider>
            )
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyResult;
