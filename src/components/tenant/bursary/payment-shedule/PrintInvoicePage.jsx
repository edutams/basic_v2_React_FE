import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import { fetchStudentPrintInvoice } from '@/api/tenant/bursary/bursarySettingsApi';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Typography,
  Button,
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
  ArrowBack as ArrowBackIcon,
  DescriptionOutlined as InvoiceIcon,
} from '@mui/icons-material';

const PrintInvoicePage = () => {
  const { session_term_id, class_id, id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tenantInfo } = useContext(TenantAuthContext) || {};
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || '/Edutams.png';
  const schoolName =
    tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || 'School Name';
  const schoolEmail = tenantInfo?.administrator_info?.school_owner?.school_owner_email || '';
  const schoolPhone = tenantInfo?.administrator_info?.school_owner?.school_owner_phone || '';
  const issuerName = tenantInfo?.issuer_name || 'Bursary Officer';
  const issuerTitle = tenantInfo?.issuer_title || 'Bursary Officer';

  useEffect(() => {
    if (!session_term_id || !class_id || !id) return;

    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStudentPrintInvoice({
          sessionTermId: session_term_id,
          classId: class_id,
          userId: id,
        });
        if (res?.success) {
          if (res?.success && res?.data && !Array.isArray(res.data)) {
            setInvoiceData(res.data);
          } else {
            setInvoiceData(null);
          }
        } else {
          setError(res?.message || 'Failed to load invoice data');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load invoice for printing');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [session_term_id, class_id, id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoiceData?.student?.name?.replace(/\s+/g, '_') || 'Student'}`,
  });

  const fmt = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const compulsoryPayable = invoiceData?.compulsory_invoice?.reduce((sum, i) => sum + Number(i.schedule_amount || 0), 0) || 0;
  const compulsoryPaid = invoiceData?.compulsory_invoice?.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0) || 0;
  const compulsoryTotal = invoiceData?.compulsory_invoice?.reduce((sum, i) => sum + Number(i.balance || 0), 0) || 0;

  const optionalPayable = invoiceData?.optional_invoice?.reduce((sum, i) => sum + Number(i.schedule_amount || 0), 0) || 0;
  const optionalPaid = invoiceData?.optional_invoice?.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0) || 0;
  const optionalTotal = invoiceData?.optional_invoice?.reduce((sum, i) => sum + Number(i.balance || 0), 0) || 0;

  const currentTermPayable = compulsoryPayable + optionalPayable;
  const currentTermPaid = compulsoryPaid + optionalPaid;
  const currentTermTotal = compulsoryTotal + optionalTotal;

  const handleGoBack = () => {
    const source = searchParams.get('source');
    
    if (source === 'class-ledger') {
      navigate('/class-ledger');
    } else if (window.history.length > 1 && !source) {
      navigate(-1);
    } else {
      navigate(`/payment-schedule/invoice/${session_term_id}/${class_id}`);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" size="small" startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 } }}>
      {/* TOOLBAR */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 2,
        }}
      >
        <Button variant="contained" size="small" startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Back
        </Button>
        <Button variant="contained" size="small" startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={!invoiceData}
          sx={{ fontWeight: 600 }}
        >
          Print
        </Button>
      </Box>

      {invoiceData ? (
        <Paper sx={{ p: { xs: 2, sm: 4 } }} ref={printRef}>
          {/* ── SCHOOL HEADER ── */}
          <Box
            sx={{
              bgcolor: 'primary.light',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              minHeight: 110,
              mb: 2,
              borderRadius: 1,
            }}
          >
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
                mr: 2,
              }}
            />
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={900} sx={{ textTransform: 'uppercase' }}>
                {schoolName}
              </Typography>
              <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">
                {[schoolEmail, schoolPhone].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Box>

          {/* ── STUDENT INFO ── */}
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
                {invoiceData.student?.fname} {invoiceData.student?.lname}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {invoiceData.student?.learnerId} · {invoiceData.student?.class_name} ·{' '}
                {invoiceData.student?.term_name} · {invoiceData.student?.sesname}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Invoice #
              </Typography>
              <Typography fontWeight={700} fontSize={14}>
                {invoiceData.invoice_number || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Balance Due
              </Typography>
              <Typography fontWeight={900} fontSize={15}>
                ₦{fmt(invoiceData.due_balance)}
              </Typography>
            </Box>
          </Box>

          {/* ── OUTSTANDING BALANCE ── */}
          {Number(invoiceData.outstanding_balance) > 0 && (
            <Table size="small" sx={{ border: '1px solid', borderColor: 'grey.400', mb: 0 }}>
              <TableBody>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>
                    OUTSTANDING BALANCE (Previous Terms)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    ₦{fmt(invoiceData.outstanding_balance)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {/* ── BREAKDOWN TABLE ── */}
          <TableContainer>
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
                  <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>PAYMENT TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>PAYMENT ITEMS</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>PAYABLE (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>PAID (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>BALANCE (₦)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.compulsory_invoice?.length > 0 ? (
                  invoiceData.compulsory_invoice.map((item, i) => (
                    <TableRow key={`c-${item.id || i}`}>
                      {i === 0 && (
                        <TableCell
                          rowSpan={invoiceData.compulsory_invoice.length}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                      No compulsory payments
                    </TableCell>
                  </TableRow>
                )}

                {invoiceData.compulsory_invoice?.length > 0 && (
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

                {invoiceData.optional_invoice?.length > 0 && (
                  <>
                    {invoiceData.optional_invoice.map((item, i) => (
                      <TableRow key={`o-${item.id || i}`}>
                        {i === 0 && (
                          <TableCell
                            rowSpan={invoiceData.optional_invoice.length}
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
                  </>
                )}

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

          {/* ── ISSUED BY ── */}
          <Box sx={{ px: 2, pt: 3, pb: 1 }}>
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
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <InvoiceIcon sx={{ fontSize: 36, color: 'warning.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} mb={1}>
            No Invoice Generated
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Invoice has not been generated for this student yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PrintInvoicePage;
