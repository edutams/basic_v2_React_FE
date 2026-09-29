import React, { useState, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  TableContainer,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import { IconDownload, IconX } from '@tabler/icons-react';
import CloseIcon from '@mui/icons-material/Close';

// ─── Drilldown Modal ────────────────────────────────────────────────────────
const DrilldownModal = ({ open, onClose, title, students, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleDownloadCSV = () => {
    if (!students?.length) return;
    const headers = ['SN', 'Student Name', 'Paid Amount'];
    const rows = students.map((s, i) => [
      i + 1,
      [s.lname, s.fname, s.mname].filter(Boolean).join(' '),
      s.amount ?? s.paid_amount ?? s.total_paid ?? 0,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.replace(/\s+/g, '_') || 'students'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: isDark ? theme.palette.background.paper : '#fff',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}`,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {!loading && students?.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<IconDownload />}
            onClick={handleDownloadCSV}
            disabled={loading || !students?.length}
            sx={{ fontSize: '12px' }}
          >
            Download CSV
          </Button>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !students?.length ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No students found.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? '#1a1a1a' : '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 50 }}>SN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Amount (₦)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, i) => {
                  const name = [s.lname, s.fname, s.mname].filter(Boolean).join(' ');
                  const amount = s.amount ?? s.paid_amount ?? s.total_paid ?? 0;
                  return (
                    <TableRow key={s.user_id || i} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">{Number(amount).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── Clickable Amount Cell ───────────────────────────────────────────────────
const ClickableAmount = ({ value, onClick, color }) => (
  <Tooltip title="Click to view students" placement="top">
    <Typography
      component="span"
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        color: color || 'primary.main',
        fontWeight: 600,
        fontSize: '13px',
        textDecoration: 'underline dotted',
        '&:hover': { opacity: 0.75 },
      }}
    >
      ₦{Number(value || 0).toLocaleString()}
    </Typography>
  </Tooltip>
);

// ─── FeeChart ────────────────────────────────────────────────────────────────
const FeeChart = ({
  open,
  onClose,
  title = 'Chart',
  chartOptions,
  chartSeries,
  chartType = 'bar',
  isPayable,
  isOptional,
  isCompulsory,
  // Real analytics data passed from ClassLedger
  analyticsData,
  className, // e.g. "JSS1 YELLOW"
  onFetchDrilldown, // async fn(type) => [{ fname, lname, mname, amount }]
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [drilldown, setDrilldown] = useState({
    open: false,
    title: '',
    students: [],
    loading: false,
  });

  // ── Build real chart series from analyticsData ──────────────────────────
  const realSeries = useMemo(() => {
    if (!analyticsData) return chartSeries;

    if (isCompulsory) {
      return [
        { name: 'Total Expected', data: [analyticsData.total_comp_schedule || 0] },
        { name: 'Total Paid', data: [analyticsData.total_comp_transaction || 0] },
        { name: 'Balance', data: [analyticsData.total_comp_balance || 0] },
      ];
    }
    if (isOptional) {
      return [
        { name: 'Total Expected', data: [analyticsData.total_opt_schedule || 0] },
        { name: 'Total Paid', data: [analyticsData.total_opt_transaction || 0] },
        { name: 'Balance', data: [analyticsData.total_opt_balance || 0] },
      ];
    }
    if (isPayable) {
      const totalExpected =
        (analyticsData.total_comp_schedule || 0) + (analyticsData.total_opt_schedule || 0);
      const totalPaid =
        (analyticsData.total_comp_transaction || 0) + (analyticsData.total_opt_transaction || 0);
      const balance = analyticsData.outstanding_balance || 0;
      return [
        { name: 'Total Expected', data: [totalExpected] },
        { name: 'Total Paid', data: [totalPaid] },
        { name: 'Balance', data: [balance] },
      ];
    }
    return chartSeries;
  }, [analyticsData, isCompulsory, isOptional, isPayable, chartSeries]);

  const realOptions = useMemo(
    () => ({
      ...chartOptions,
      xaxis: {
        ...chartOptions?.xaxis,
        categories: [className || 'Selected Class'],
      },
    }),
    [chartOptions, className],
  );

  // ── Build real table rows ────────────────────────────────────────────────
  const tableRows = useMemo(() => {
    if (!analyticsData) return [];

    if (isCompulsory) {
      return [
        {
          label: 'Compulsory Bill',
          expected: analyticsData.total_comp_schedule || 0,
          paid: analyticsData.total_comp_transaction || 0,
          balance: analyticsData.total_comp_balance || 0,
          drilldownPaid: 'compulsory_paid',
          drilldownBalance: 'compulsory_balance',
        },
      ];
    }
    if (isOptional) {
      return [
        {
          label: 'Optional Bill',
          expected: analyticsData.total_opt_schedule || 0,
          paid: analyticsData.total_opt_transaction || 0,
          balance: analyticsData.total_opt_balance || 0,
          drilldownPaid: 'optional_paid',
          drilldownBalance: 'optional_balance',
        },
      ];
    }
    if (isPayable) {
      const totalExpected =
        (analyticsData.total_comp_schedule || 0) + (analyticsData.total_opt_schedule || 0);
      const totalPaid =
        (analyticsData.total_comp_transaction || 0) + (analyticsData.total_opt_transaction || 0);
      const balance = analyticsData.outstanding_balance || 0;
      return [
        {
          label: 'Total Payable',
          expected: totalExpected,
          paid: totalPaid,
          balance: balance,
          drilldownPaid: 'all_paid',
          drilldownBalance: 'all_balance',
        },
      ];
    }
    return [];
  }, [analyticsData, isCompulsory, isOptional, isPayable]);

  // ── Drilldown handler ────────────────────────────────────────────────────
  const handleDrilldown = async (type, label) => {
    setDrilldown({
      open: true,
      title: `${label} — ${className || ''}`,
      students: [],
      loading: true,
    });
    try {
      const students = (await onFetchDrilldown?.(type)) ?? [];
      setDrilldown((prev) => ({ ...prev, students, loading: false }));
    } catch {
      setDrilldown((prev) => ({ ...prev, students: [], loading: false }));
    }
  };

  return (
    <>
      <StandardModal
        open={open}
        onClose={onClose}
        title={title}
        maxWidth="lg"
        padding={3}
        dividers={false}
        headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
        sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
      >
        <Grid container spacing={2} mt={3} mb={3}>
          {/* Chart */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
                borderRadius: '10px',
                bgcolor: isDark ? '#1e1e1e' : 'white',
                p: 1,
              }}
            >
              <Chart options={realOptions} series={realSeries} type={chartType} height={360} />
            </Box>
          </Grid>

          {/* Side Panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
                borderRadius: '10px',
                bgcolor: isDark ? theme.palette.background.paper : '#fff',
                p: 2,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ color: isDark ? '#fff' : '#1a1a1a' }}
                >
                  Summary — {className}
                </Typography>
              </Box>

              {tableRows.length > 0 ? (
                <TableContainer variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: isDark ? '#1a1a1a' : '#fafafa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Fee Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }} align="right">
                          Expected
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }} align="right">
                          Paid
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }} align="right">
                          Balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>
                            {row.label}
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                              ₦{Number(row.expected).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <ClickableAmount
                              value={row.paid}
                              color="#16a34a"
                              onClick={() =>
                                handleDrilldown(
                                  row.drilldownPaid,
                                  `Students Who Paid (${row.label})`,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ClickableAmount
                              value={row.balance}
                              color="#dc2626"
                              onClick={() =>
                                handleDrilldown(
                                  row.drilldownBalance,
                                  `Students With Balance (${row.label})`,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Totals row */}
                      <TableRow sx={{ bgcolor: isDark ? '#1a2a3a' : '#EEF6FF' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '12px' }}>
                          ₦{tableRows.reduce((s, r) => s + r.expected, 0).toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, fontSize: '12px', color: '#16a34a' }}
                        >
                          ₦{tableRows.reduce((s, r) => s + r.paid, 0).toLocaleString()}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, fontSize: '12px', color: '#dc2626' }}
                        >
                          ₦{tableRows.reduce((s, r) => s + r.balance, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80%',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No data available.
                  </Typography>
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1.5, display: 'block' }}
              >
                💡 Click on Paid or Balance amounts to view individual students.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StandardModal>

      {/* Drilldown Modal */}
      <DrilldownModal
        open={drilldown.open}
        onClose={() => setDrilldown((prev) => ({ ...prev, open: false }))}
        title={drilldown.title}
        students={drilldown.students}
        loading={drilldown.loading}
      />
    </>
  );
};

export default FeeChart;
