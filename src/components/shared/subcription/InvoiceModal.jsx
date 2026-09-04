import React, { useState, useMemo, useContext } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Divider,
  TextField,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import useNotification from '@/hooks/useNotification';
import { TenantAuthContext } from 'src/context/TenantContext/auth';
import { usePermissions } from '@/context/TenantContext/permissions';
import subscriptionApi from '@/api/tenant/subscription/subscriptionApi';

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
};

const InvoiceModal = ({ open, onClose, selectedRow, subscriptionCharges, onExtended }) => {
  const { can } = usePermissions();

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);
  const notify = useNotification();
  const { tenantInfo } = useContext(TenantAuthContext);

  const schoolName = tenantInfo?.tenant_name || tenantInfo?.school_name || tenantInfo?.name || '';
  const schoolAddress = tenantInfo?.address || '';
  const schoolPhone = tenantInfo?.phone || '';
  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;

  const planData = useMemo(() => {
    if (!selectedRow?.plans?.data) return {};
    return typeof selectedRow.plans.data === 'string'
      ? JSON.parse(selectedRow.plans.data)
      : selectedRow.plans.data;
  }, [selectedRow]);

  const amount = parseFloat(selectedRow?.amount) || 0;
  const discount = parseFloat(selectedRow?.discount) || 0;
  const charges = parseFloat(subscriptionCharges) || 0;
  const discountAmount = (amount * discount) / 100;
  const amountAfterDiscount = amount - discountAmount;
  const totalAmount = amountAfterDiscount + charges;

  const sessionTerm = `${selectedRow?.sessions?.session_name || ''} / ${selectedRow?.terms?.term_name || ''}`;
  const planName = selectedRow?.my_plans?.display_name || 'N/A';
  const studentsLimit = planData.students_limit || 'N/A';
  const planDescription = `${planName} (${studentsLimit} Students)`;

  // extended_due_date (set by a super_admin's manual extension) always wins
  // over the auto-computed due_date when both are present.
  const isExtendedDueDate = Boolean(selectedRow?.extended_due_date);
  const dueDateRaw = selectedRow?.extended_due_date || selectedRow?.due_date;
  const dueDateDisplay = dueDateRaw ? new Date(dueDateRaw).toLocaleDateString('en-GB') : null;

  // Separate loading flags per button — sharing one made it look like both
  // had been clicked together, since neither showed which action was
  // actually the one in flight.
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const pdfLoading = downloadLoading || printLoading;

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      await subscriptionApi.downloadInvoicePdf(selectedRow.id);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      await subscriptionApi.printInvoicePdf(selectedRow.id);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to open invoice');
    } finally {
      setPrintLoading(false);
    }
  };

  const handleExtendDueDate = async () => {
    if (!extendDate) {
      notify.error('Please select a date');
      return;
    }
    setExtendLoading(true);
    try {
      await subscriptionApi.extendDueDate(selectedRow.id, extendDate);
      notify.success(`Due date extended to ${new Date(extendDate).toLocaleDateString('en-GB')}`, 'Success');
      setExtendModalOpen(false);
      setExtendDate('');
      onExtended?.();
      onClose();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to extend due date');
    } finally {
      setExtendLoading(false);
    }
  };

  if (!selectedRow) return null;

  return (
    <>
      <ReusableModal
        open={open}
        onClose={onClose}
        title="School Invoice"
        size="extraLarge"
        disableEnforceFocus
        disableAutoFocus
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {schoolLogo && (
              <Avatar
                src={schoolLogo}
                alt={schoolName}
                variant="rounded"
                sx={{ width: 56, height: 56, flexShrink: 0 }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>School Name:</strong> {schoolName || 'N/A'}
              </Typography>
              {schoolAddress && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Address:</strong> {schoolAddress}
                </Typography>
              )}
              {schoolPhone && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Phone:</strong> {schoolPhone}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Invoice Status:</strong>
              </Typography>
              <Chip
                label={selectedRow?.status?.toUpperCase() || 'PENDING'}
                color={getStatusColor(selectedRow?.status)}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Invoice Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                <strong>Invoice No.:</strong> SUB-{selectedRow?.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Invoice Date:</strong> {new Date().toLocaleDateString('en-GB')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Session/Term:</strong> {sessionTerm}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Plan:</strong> {planDescription}
              </Typography>
              {dueDateDisplay && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Due Date:</strong> {dueDateDisplay}
                  {isExtendedDueDate && (
                    <Chip
                      label="Extended"
                      size="small"
                      color="info"
                      sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Invoice Table */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>RATE (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>QTY</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    Discount (₦)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>AMOUNT (₦)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      EDUTAMS school portal ({planDescription})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Subscription Fee ({sessionTerm})
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>₦{amount.toLocaleString()}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>1</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    {discount > 0 ? `₦${discountAmount.toLocaleString()}` : '0'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    ₦{amountAfterDiscount.toLocaleString()}
                  </TableCell>
                </TableRow>

                {charges > 0 && (
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        Gateway / Subscription Charges
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₦{charges.toLocaleString()}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>1</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>0</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>₦{charges.toLocaleString()}</TableCell>
                  </TableRow>
                )}

                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell
                    colSpan={4}
                    sx={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem' }}
                  >
                    TOTAL AMOUNT (₦)
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      color: '#1a237e',
                    }}
                  >
                    ₦{totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            {can('subscriptions.extend_due_date') && selectedRow?.status === 'pending' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<CalendarIcon />}
                onClick={() => setExtendModalOpen(true)}
                sx={{ borderRadius: '8px' }}
              >
                Extend Due Date
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={downloadLoading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={pdfLoading}
              sx={{ borderRadius: '8px' }}
            >
              {downloadLoading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={printLoading ? <CircularProgress size={14} color="inherit" /> : <PrintIcon />}
              onClick={handlePrint}
              disabled={pdfLoading}
              sx={{ borderRadius: '8px', bgcolor: '#1a237e' }}
            >
              {printLoading ? 'Opening...' : 'Print Invoice'}
            </Button>
          </Box>
        </Box>
      </ReusableModal>

      <ReusableModal
        open={extendModalOpen}
        onClose={() => {
          setExtendModalOpen(false);
          setExtendDate('');
        }}
        title="Extend Due Date"
        size="small"
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a new due date for this subscription.
          </Typography>
          <TextField
            fullWidth
            type="date"
            label="New Due Date"
            value={extendDate}
            onChange={(e) => setExtendDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date(Date.now() + 86400000).toISOString().slice(0, 10) }}
            helperText="Must be a future date — matches the backend's own validation."
            size="small"
            sx={{ mb: 3 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setExtendModalOpen(false);
                setExtendDate('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleExtendDueDate}
              disabled={extendLoading}
            >
              {extendLoading ? 'Extending...' : 'Extend'}
            </Button>
          </Stack>
        </Box>
      </ReusableModal>
    </>
  );
};

InvoiceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
  subscriptionCharges: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onExtended: PropTypes.func,
};

export default InvoiceModal;
