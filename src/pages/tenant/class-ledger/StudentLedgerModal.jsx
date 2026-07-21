import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useTheme } from '@mui/material/styles';
import { fetchStudentLedgerModalData } from '@/api/tenant/bursary/classLedger';
import useNotification from '@/hooks/useNotification';
import SharedStatCard from '@/components/shared/StatCard';

const StudentLedgerModal = ({ open, onClose, student }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const theme = useTheme();
  const notify = useNotification();

  useEffect(() => {
    if (open && student) {
      loadData();
    } else {
      setData([]);
    }
  }, [open, student]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = student?.users?.id || student?.user?.id || student?.user_id;
      if (!userId) throw new Error('Student user ID not found');

      const res = await fetchStudentLedgerModalData(userId);
      if (res.status) {
        setData(res.data || []);
      } else {
        notify.error(res.message || 'Failed to load ledger data');
      }
    } catch (error) {
      console.error(error);
      notify.error('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('student-ledger-print-area');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printHtml = `
        <html>
          <head>
            <title>Payment Ledger - ${studentName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
              .summary { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${studentName}'s Payment Ledger</h2>
            </div>
            <div class="summary">
              <div>Total Bill: ₦${totals.bill.toLocaleString()}</div>
              <div>Amount Paid: ₦${totals.paid.toLocaleString()}</div>
              <div>Balance: ₦${totals.balance.toLocaleString()}</div>
            </div>
            ${printContent.querySelector('table').outerHTML}
          </body>
        </html>
      `;
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const studentName = student?.users?.full_name || student?.user?.full_name || 'Student';

  const { groupedData, totals } = useMemo(() => {
    const groups = {};
    let totalBill = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let cumulative = 0;

    data.forEach((item) => {
      const sessionTerm = `${item.session_name || 'Unknown'}/${item.term_name || 'Unknown'}`;
      if (!groups[sessionTerm]) {
        groups[sessionTerm] = [];
      }
      groups[sessionTerm].push(item);

      totalBill += parseFloat(item.sched_amount || 0);
      totalPaid += parseFloat(item.amount_paid || 0);
      totalBalance += parseFloat(item.balance_amount || 0);
    });

    const sortedTerms = Object.keys(groups).sort((a, b) => {
      return groups[b][0].session_term_id - groups[a][0].session_term_id;
    });

    const finalGroups = sortedTerms.map(term => {
      const items = groups[term];
      return {
        term,
        items: items.map(item => {
          cumulative += parseFloat(item.sched_amount || 0);
          return { ...item, cumulative };
        })
      };
    });

    return {
      groupedData: finalGroups,
      totals: {
        bill: totalBill,
        paid: totalPaid,
        balance: totalBalance,
      }
    };
  }, [data]);

  // Adapter wrappers so MUI SvgIcons work as tabler-style icon components
  const ReceiptIcon = ({ size }) => <ReceiptLongIcon sx={{ fontSize: size }} />;
  const WalletIcon = ({ size }) => <AccountBalanceWalletIcon sx={{ fontSize: size }} />;
  const PayIcon = ({ size }) => <PaidIcon sx={{ fontSize: size }} />;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={600} fontSize="1rem">Payment Transactions Ledger</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderTop: 'none', px: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Box id="student-ledger-print-area">
            {/* Stat Cards */}
            <Grid container spacing={2} mb={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SharedStatCard
                  label="Total Bill"
                  count={`NGN ${totals.bill.toLocaleString()}`}
                  icon={ReceiptIcon}
                  colorIndex={1}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SharedStatCard
                  label="Amount Paid"
                  count={`NGN ${totals.paid.toLocaleString()}`}
                  icon={PayIcon}
                  colorIndex={3}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <SharedStatCard
                  label="Balance"
                  count={`NGN ${totals.balance.toLocaleString()}`}
                  icon={WalletIcon}
                  colorIndex={4}
                />
              </Grid>
            </Grid>

            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {studentName?.toUpperCase()}'s Payment Ledger
              </Typography>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  bgcolor: '#1e293b',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0f172a' }
                }}
                size="small"
              >
                Print Payment Ledger
              </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Sessn/Term</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Payment Items</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Amount Paid (NGN)</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem' }}>Cumulative</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.75rem', textAlign: 'center' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedData.length > 0 ? (
                    groupedData.map((group, gIndex) => (
                      <React.Fragment key={gIndex}>
                        {group.items.map((item, iIndex) => (
                          <TableRow key={`${gIndex}-${iIndex}`} hover>
                            {iIndex === 0 ? (
                              <TableCell rowSpan={group.items.length} sx={{ verticalAlign: 'top', fontWeight: 600, borderRight: '1px solid', borderColor: 'divider' }}>
                                {group.term}
                              </TableCell>
                            ) : null}
                            <TableCell>{item.payment_item}</TableCell>
                            <TableCell>{parseFloat(item.sched_amount || 0).toLocaleString()}</TableCell>
                            <TableCell>{parseFloat(item.amount_paid || 0).toLocaleString()}</TableCell>
                            <TableCell>{parseFloat(item.balance_amount || 0).toLocaleString()}</TableCell>
                            <TableCell>{item.cumulative.toLocaleString()}</TableCell>
                            <TableCell align="center">
                              {/* Add action icons if needed based on screenshot (usually print or view) */}
                              {parseFloat(item.balance_amount) > 0 && (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#ef4444',
                                    color: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                  title="Pay Balance"
                                  onClick={() => {
                                    window.open(`/class-ledger/${student?.invoice_number}/${student?.user_id}/pay-invoice`, '_blank');
                                  }}
                                >
                                  ₦
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No payment records found.
                      </TableCell>
                    </TableRow>
                  )}
                  {/* Totals Row */}
                  {groupedData.length > 0 && (
                    <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.bill.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.paid.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{totals.balance.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{/* cumulative total? */}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentLedgerModal;
