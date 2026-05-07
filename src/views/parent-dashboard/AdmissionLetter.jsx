import { useTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { Box, Grid, Typography, Paper, Button, Divider, Avatar } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import { TenantAuthContext } from 'src/context/TenantContext/auth';

// ── Print / Download helper
const toDataUrl = (url) =>
  new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => resolve(null); // fallback — just skip if blocked
    img.src = url;
  });

const printLetter = async () => {
  // Inject a one-time print stylesheet that hides everything except the letter
  const styleId = 'admission-print-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #admission-letter-root { display: block !important; }
        #admission-letter-root * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        #admission-letter-root img {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          max-width: 100% !important;
        }
        #admission-letter-root svg {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const el = document.getElementById('admission-letter-print');
  if (!el) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'admission-letter-root';
  wrapper.style.display = 'none'; 
  wrapper.appendChild(el.cloneNode(true));
  document.body.appendChild(wrapper);

  window.print();

  document.body.removeChild(wrapper);
};
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

// ── The printable letter card
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
        {/* School header */}
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
                {schoolName?.toUpperCase() ?? 'SCHOOL'}
              </Typography>
              <Typography variant="caption" color="text.secondary" letterSpacing={1}>
                ADMISSIONS
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: { xs: 'left', md: 'right' }, // 👈 align properly on mobile
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {schoolName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {schoolAddress ?? 'Plot 14, School Rd, Lagos'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {schoolEmail ?? 'admissions@edutams.school'}
            </Typography>
          </Box>
        </Box>

        {/* Reference + Date */}
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

        <Typography variant="body1" mb={2}>
          Dear {letter.parentName},
        </Typography>

        <Typography variant="h5" fontWeight={800} mb={1.5}>
          Offer of Admission —{' '}
          <Typography component="span" variant="h5" fontWeight={800} color="primary.main">
            {(letter.class ?? '').split('—')[0].trim() || letter.class}
          </Typography>
        </Typography>

        <Typography variant="body2" mb={3} lineHeight={1.8}>
          Following the successful completion of the entrance examination and review of your child's
          application, we are pleased to offer{' '}
          <Typography component="strong" variant="body2" fontWeight={700} color="text.primary">
            {letter.studentName}
          </Typography>{' '}
          a place in{' '}
          <Typography component="strong" variant="body2" fontWeight={700} color="text.primary">
            Junior Secondary School 1, Section A
          </Typography>{' '}
          for the {letter.session} academic session.
        </Typography>

        {/* Details box */}
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 3, bgcolor: '#F7FAFC' }}>
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
        </Paper>

        <Typography variant="body2" mb={2} lineHeight={1.8}>
          To confirm this offer, please make payment of the acceptance fee through your parent
          dashboard before the deadline above. Once payment is received, your child will be
          automatically enrolled and assigned a student ID.
        </Typography>

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
  const { tenantInfo } = useContext(TenantAuthContext);

  const letter = location.state?.letter ?? MOCK_LETTER;
  const schoolName = tenantInfo?.school_name ?? tenantInfo?.name ?? 'FunmiSchool';
  const schoolLogo = tenantInfo?.logo_url ?? tenantInfo?.logo ?? null;

  const handlePrint = () => printLetter();
  const handleDownload = () => printLetter(); 

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
          <Button
            startIcon={<ArrowBackIcon />}
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
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ fontWeight: 600 }}
          >
            Print
          </Button>
          <Button variant="outlined" startIcon={<ShareIcon />} sx={{ fontWeight: 600 }}>
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ fontWeight: 700 }}
          >
            Download PDF
          </Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#EEF2F7', py: 4, px: { xs: 1, sm: 3 }, borderRadius: 3 }}>
        <LetterCard letter={letter} schoolName={schoolName} schoolLogo={schoolLogo} />
      </Box>
    </PageContainer>
  );
};

export default AdmissionLetter;
