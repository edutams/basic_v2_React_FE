import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import EduTAMSLogo from 'src/assets/images/logos/EduTAMS.jpeg';
import useNotification from '@/hooks/useNotification';

const SCHOOL_INFO = {
  name: 'Tai Solarin University of Education Secondary School',
  address: 'Igbeba Road, Ijebu Ode',
  phone: '2348140304580',
  email: 'support@edutams.com',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'expired': return 'error';
    default: return 'default';
  }
};

const InvoiceModal = ({ open, onClose, selectedRow, subscriptionCharges }) => {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);
  const notify = useNotification();

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

  const handlePrint = () => {
    window.print();
  };

  const handleExtendDueDate = async () => {
    if (!extendDate) {
      notify.error('Please select a date');
      return;
    }
    setExtendLoading(true);
    try {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notify.success(`Due date extended to ${new Date(extendDate).toLocaleDateString('en-GB')}`);
      setExtendModalOpen(false);
      setExtendDate('');
      onClose();
    } catch {
      notify.error('Failed to extend due date');
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
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={EduTAMSLogo}
              alt="School Logo"
              sx={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid #eee',
                mb: 2,
              }}
            />

            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 0.5 }}>
              {SCHOOL_INFO.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {SCHOOL_INFO.address}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Phone: {SCHOOL_INFO.phone}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography variant="body2" color="textSecondary">
                <strong>Invoice Date:</strong> {new Date().toLocaleDateString('en-GB')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Session/Term:</strong> {sessionTerm}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Plan:</strong> {planDescription}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                <strong>Status:</strong>{' '}
              </Typography>
              <Chip
                label={selectedRow?.status?.toUpperCase() || 'PENDING'}
                color={getStatusColor(selectedRow?.status)}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>RATE (₦)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>QTY</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Discount (₦)</TableCell>
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
                  <TableCell sx={{ textAlign: 'right' }}>{discount > 0 ? `₦${discountAmount.toLocaleString()}` : '0'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>₦{amountAfterDiscount.toLocaleString()}</TableCell>
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

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarIcon />}
              onClick={() => setExtendModalOpen(true)}
              sx={{ borderRadius: '8px' }}
            >
              Extend Due Date
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={handlePrint} sx={{ borderRadius: '8px' }}>
              Download
            </Button>
            <Button variant="contained" size="small" startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: '8px', bgcolor: '#1a237e' }}
            >
              Print Invoice
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
};

export default InvoiceModal;
