import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import { fetchStudentInvoiceBreakdown } from '@/api/tenant/bursary/bursarySettingsApi';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
  DescriptionOutlined as InvoiceIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const InvoiceView = () => {
  const { session_term_id, class_id, category_id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tenantInfo } = useContext(TenantAuthContext) || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [sessionLabel, setSessionLabel] = useState('');
  const [termLabel, setTermLabel] = useState('');
  const [className, setClassName] = useState('');

  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || '/Edutams.png';
  const schoolName =
    tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || 'School Name';
  const schoolEmail = tenantInfo?.administrator_info?.school_owner?.school_owner_email || '';
  const schoolPhone = tenantInfo?.administrator_info?.school_owner?.school_owner_phone || '';
  const issuerName = tenantInfo?.issuer_name || 'Bursary Officer';
  const issuerTitle = tenantInfo?.issuer_title || 'Bursary Officer';
  const printRef = useRef(null);

  const handlePrintAll = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Class_Invoice_${className || 'Class'}`,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchStudentInvoiceBreakdown({
          sessionTermId: session_term_id,
          classId: class_id,
          categoryId: category_id,
        });

        setStudentsData(res.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || 'Failed to load invoice breakdown');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session_term_id, class_id, category_id]);

  const handleBack = () => {
    navigate(`/payment-schedule/invoice/${session_term_id}/${class_id}`);
  };

  const handleUpdateInvoice = (student) => {
    window.open(
      `/class-ledger/${student.invoice_number}/${student?.student?.user_id}/invoice`,
      '_blank',
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={handleBack}>
            Back to Invoice List
          </Button>
        </Box>
      </Box>
    );
  }

  if (studentsData.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <InvoiceIcon sx={{ fontSize: 40, color: 'warning.main' }} />
          </Box>

          <Typography variant="h5" fontWeight={700} mb={1}>
            No Invoice Generated
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 360, mx: 'auto', lineHeight: 1.7 }}
          >
            Invoices have not been generated for this class yet. Please go back to the invoice list
            and generate invoices for the selected students before viewing them here.
          </Typography>

          <Button
            variant="contained"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ fontWeight: 600, px: 4 }}
          >
            Back to Invoice List
          </Button>
        </Paper>
      </Box>
    );
  }

  const fmt = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString();
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            View Class Invoice{' '}
            <Box component="span" color="primary.main">
              {className} {sessionLabel} {termLabel}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {studentsData.length} student(s)
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrintAll}
            disabled={studentsData.length === 0}
            sx={{ fontWeight: 600 }}
          >
            Print All
          </Button>
          <Button variant="outlined" size="small" onClick={handleBack}>
            Back
          </Button>
        </Box>
      </Box>

      {/* ── Print All Container ── */}
      <style>
        {`
          @media print {
            body { margin: 0; padding: 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 12mm; }
          }
        `}
      </style>
      <Box ref={printRef} sx={{ '&:print': { p: 2 } }}>
        {/* ── Student Invoices ── */}
        {studentsData.map((student, index) => {
          const compulsory = student.compulsory_invoice || [];
          const optional = student.optional_invoice || [];
          const dueBalance = Number(student.due_balance || 0);

          const compulsoryPayable = compulsory.reduce((sum, i) => sum + Number(i.schedule_amount || 0), 0);
          const compulsoryPaid = compulsory.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
          const compulsoryTotal = compulsory.reduce((sum, i) => sum + Number(i.balance || 0), 0);

          const optionalPayable = optional.reduce((sum, i) => sum + Number(i.schedule_amount || 0), 0);
          const optionalPaid = optional.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
          const optionalTotal = optional.reduce((sum, i) => sum + Number(i.balance || 0), 0);

          const currentTermPayable = compulsoryPayable + optionalPayable;
          const currentTermPaid = compulsoryPaid + optionalPaid;
          const currentTermTotal = compulsoryTotal + optionalTotal;

          // Compute overall balance for the outstanding banner
          // const overallBalance = compulsory.reduce((sum, i) => sum + (Number(i.balance) || 0), 0)
          //   + optional.reduce((sum, i) => sum + (Number(i.balance) || 0), 0);

          return (
            <Box
              key={student.user_id}
              sx={{
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                p: 3,
              }}
            >
              {/* ── SCHOOL HEADER — centered ── */}
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  p: 2,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 110,
                }}
              >
                {/* LEFT LOGO */}
                <Box
                  component="img"
                  src={schoolLogo}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    objectFit: 'contain',
                    bgcolor: '#fff',
                    p: 0.5,
                    position: 'absolute',
                    left: 16,
                  }}
                />

                {/* CENTER CONTENT */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="h1" fontWeight={900} sx={{ textTransform: 'uppercase' }}>
                    {schoolName}
                  </Typography>

                  <Typography
                    variant="caption"
                    display="block"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {[schoolEmail, schoolPhone].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              </Box>

              {/* ── STUDENT INFO left · INVOICE NUMBER right ── */}
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Box>
                  <Typography fontWeight={700} fontSize={13}>
                    {student.student?.fname} {student.student?.lname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.student?.learnerId} · {student.student?.class_name} ·{' '}
                    {student.student?.term_name}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Invoice Number{' '}
                  </Typography>
                  <Typography fontWeight={900} fontSize={15}>
                    {student.invoice_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Balance Due
                  </Typography>
                  <Typography fontWeight={900} fontSize={15}>
                    ₦{fmt(dueBalance)}
                  </Typography>
                </Box>
              </Box>

              {/* ── TOP ACTION BUTTONS ── */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Button size="small" variant="contained">
                  Proceed to Pay
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleUpdateInvoice(student)}
                >
                  Update Invoice
                </Button>
              </Box>

              {/* ── BREAKDOWN TABLE ── */}
              <TableContainer>
                {/* {overallBalance > 0 && ( */}
                <Table
                  size="small"
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.400',
                    '& .MuiTableCell-root': {
                      border: '1px solid',
                      borderColor: 'grey.400',
                    },
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>
                        OUTSTANDING BALANCE
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        ₦{fmt(student?.outstanding_balance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {/* )} */}

                <Table
                  size="small"
                  sx={{
                    border: '1px solid',
                    borderColor: 'grey.400',
                    '& .MuiTableCell-root': {
                      border: '1px solid',
                      borderColor: 'grey.400',
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>
                        PAYMENT TYPE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>
                        PAYMENT ITEMS
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>
                        PAYABLE (₦)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>PAID (₦)</TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>
                        BALANCE (₦)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* ── COMPULSORY ROWS ── */}
                    {compulsory.map((item, i) => (
                      <TableRow key={`c-${item.id}`}>
                        {i === 0 && (
                          <TableCell
                            rowSpan={compulsory.length}
                            align="center"
                            sx={{ fontWeight: 800, verticalAlign: 'middle' }}
                          >
                            COMPULSORY
                          </TableCell>
                        )}
                        <TableCell>{item.schedule_info?.payment_name?.name}</TableCell>
                        <TableCell align="center">₦{fmt(item.schedule_amount)}</TableCell>
                        <TableCell align="center">₦{fmt(item.paid_amount)}</TableCell>
                        <TableCell align="center">₦{fmt(item.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {compulsory.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="right" sx={{ fontWeight: 800 }}>
                          COMPULSORY TOTAL
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(compulsoryPayable)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(compulsoryPaid)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(compulsoryTotal)}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* ── OPTIONAL ROWS ── */}
                    {optional.map((item, i) => (
                      <TableRow key={`o-${item.id}`}>
                        {i === 0 && (
                          <TableCell
                            rowSpan={optional.length}
                            align="center"
                            sx={{ fontWeight: 800, verticalAlign: 'middle' }}
                          >
                            OPTIONAL
                          </TableCell>
                        )}
                        <TableCell>{item.schedule_info?.payment_name?.name}</TableCell>
                        <TableCell align="center">₦{fmt(item.schedule_amount)}</TableCell>
                        <TableCell align="center">₦{fmt(item.paid_amount)}</TableCell>
                        <TableCell align="center">₦{fmt(item.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {optional.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="right" sx={{ fontWeight: 800 }}>
                          OPTIONAL TOTAL
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(optionalPayable)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(optionalPaid)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 900 }}>
                          ₦{fmt(optionalTotal)}
                        </TableCell>
                      </TableRow>
                    )}

                    {/* ── TOTAL ROW ── */}
                    <TableRow>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: 800 }}>
                        TOTAL DUE
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        ₦{fmt(currentTermPayable)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        ₦{fmt(currentTermPaid)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        ₦{fmt(currentTermTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ── ISSUED BY SECTION ── */}
              <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Issued By
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    mb: 0.5,
                    width: 160,
                    borderBottom: '1.5px solid',
                    borderColor: 'text.primary',
                    minHeight: 40,
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <Typography sx={{ fontFamily: 'cursive', fontSize: 20, opacity: 0.7, pb: 0.5 }}>
                    {issuerName}
                  </Typography>
                </Box>
                <Typography fontWeight={700} fontSize={13}>
                  {issuerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {issuerTitle}
                </Typography>
              </Box>

              {/* ── BOTTOM ACTION BUTTONS ── */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Button size="small" variant="contained">
                  Proceed to Pay
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleUpdateInvoice(student)}
                >
                  Update Invoice
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default InvoiceView;
