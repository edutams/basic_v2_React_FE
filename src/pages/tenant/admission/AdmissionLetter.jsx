import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState, useRef } from 'react';
import { Box, Grid, Typography, Paper, Button, Divider, Avatar } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { useReactToPrint } from 'react-to-print';
import {
  updateAdmissionPrintStatus,
  getAdmissionLetterDetails,
} from '@/api/tenant/admission/admissionApi';
import { useNotification } from 'src/hooks/useNotification';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

const MOCK_LETTER = {
  reference: 'TASUES/ADM/2025/10428',
  date: 'August 30, 2025',
  parentName: 'Mrs. Adaeze Okafor',
  studentName: 'Chinaza Okafor',
  class: 'JSS 1 — Section A',
  schoolEmail: 'admissions@tasues.school',
  session: '2025/26',
  resumption: 'September 16, 2025',
  acceptanceFee: '₦35,000',
  deadline: 'September 5, 2025',
  signatoryScript: 'M. Adekunle',
  signatoryName: 'Mrs. M. Adekunle',
  signatoryTitle: 'Registrar, TASUES Secondary School',
  generatedDate: '24/04/2026',
};

const DetailCell = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={700} mt={0.25}>
      {value}
    </Typography>
  </Box>
);

const LetterCard = ({ letter, schoolName, schoolLogo, schoolAddress, schoolEmail }) => {
  const theme = useTheme();

  const bg = `linear-gradient(90deg, #15161a 0%, ${theme.palette.primary.main} 100%)`;
  return (
    <Paper
      id="admission-letter-print"
      sx={{
        maxWidth: 680,
        mx: 'auto',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
      }}
    >
      <Box sx={{ height: 8, background: bg }} />

      <Box sx={{ p: { xs: 3, sm: 5 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 2, md: 0 }}
          mb={4}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              src={schoolLogo}
              variant="rounded"
              sx={{ width: 44, height: 44, bgcolor: 'primary.light' }}
            >
              <SchoolIcon sx={{ color: 'primary.main' }} />
            </Avatar>

            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1}>
                {schoolName?.toUpperCase()}
              </Typography>
              <Typography variant="caption" color="text.secondary" letterSpacing={1}>
                ADMISSIONS
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: { xs: 'left', md: 'right' },
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {schoolName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {schoolAddress}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {schoolEmail}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={3}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Reference
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {letter.reference}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Date
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {letter.date}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />


        <Typography variant="h5" fontWeight={800} mb={1.5}>
          Offer of Admission —{' '}
          <Typography component="span" variant="h5" fontWeight={800} color="primary.main">
            {(letter.class ?? '').split('—')[0].trim() || letter.class}
          </Typography>
        </Typography>

        <Typography
          variant="body2"
          mb={3}
          lineHeight={1.8}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(letter.offer_letter) }}
        />

        {/* <Paper sx={{ borderRadius: 2, p: 2.5, mb: 3, bgcolor: '#F7FAFC' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailCell label="Class" value={letter.class} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailCell label="Resumption" value={letter.resumption} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailCell label="Acceptance Fee" value={letter.acceptanceFee} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DetailCell label="Deadline" value={letter.deadline} />
            </Grid>
          </Grid>
        </Paper> */}


        <Typography variant="body2" mb={4} lineHeight={1.8}>
          We look forward to welcoming {(letter.studentName ?? '').split(' ')[0]} into the{' '}
          {schoolName}.
        </Typography>

        <Box mb={3}>
          <Typography variant="h6" sx={{ fontFamily: 'cursive', color: 'primary.main', mb: 0.5 }}>
            {letter.signatoryScript}
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {letter.signatoryName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {letter.signatoryTitle}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption" color="text.disabled">
            Generated by EduTAMS · {letter.generatedDate}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            This document is digitally verifiable.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const AdmissionLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const notify = useNotification();
  const { tenantInfo } = useContext(TenantAuthContext);
  console.log(tenantInfo, 33)

  const [letter, setLetter] = useState(location.state?.letter ?? MOCK_LETTER);
  const [isLoading, setIsLoading] = useState(Boolean(id && !location.state?.letter));

  useEffect(() => {
    const fetchLetter = async () => {
      if (id && !location.state?.letter) {
        try {
          const res = await getAdmissionLetterDetails(id);
          if (res?.data) {
            setLetter(res.data);
          }
        } catch (error) {
          console.error(error);
          notify.error('Failed to load admission letter details');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state?.letter]);

  const schoolName = tenantInfo?.tenant_name;
  const schoolLogo = tenantInfo?.school_logo;
  const schoolAddress = tenantInfo?.address;
  const schoolEmail = tenantInfo?.tenant_email;

  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Admission_Letter_${letter.studentName?.replace(/\s+/g, '_') || 'Student'}`,
    onAfterPrint: async () => {
      if (id) {
        try {
          await updateAdmissionPrintStatus(id);
          notify.success('Form printed and marked as complete');
        } catch (error) {
          console.error('Failed to update print status', error);
        }
      }
    },
  });

  const handleDownload = () => handlePrint();

  if (isLoading) {
    return (
      <PageContainer title="Admission Letter" description="View admission letter">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="body1" color="text.secondary">
            Loading admission letter details...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Admission Letter" description="View admission letter">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Button variant="contained" size="small" startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}
          >
            Back to dashboard
          </Button>
          <Typography variant="h4" fontWeight={800}>
            Admission letter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {letter.studentName} · {(letter.class ?? '').split('—')[0].trim() || letter.class} ·{' '}
            {letter.session}
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* <Button variant="contained" size="small" startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ fontWeight: 600 }}
          >
            Print
          </Button> */}
          {/* <Button variant="contained" size="small" startIcon={<ShareIcon />} sx={{ fontWeight: 600 }}>
            Share
          </Button> */}
          <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ fontWeight: 700 }}>
            Download PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#EEF2F7', py: 4, px: { xs: 1, sm: 3 }, borderRadius: 3 }}>
        <div ref={contentRef} style={{ padding: '20px' }}>
          <LetterCard letter={letter} schoolName={schoolName} schoolLogo={schoolLogo} schoolAddress={schoolAddress} schoolEmail={schoolEmail} />

        </div>
      </Box>
    </PageContainer>
  );
};

export default AdmissionLetter;
