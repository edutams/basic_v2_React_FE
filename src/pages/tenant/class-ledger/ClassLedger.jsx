import React, { useState, useMemo, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
  TableFooter,
  TablePagination,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Stack,
  Chip,
  Grid,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StatCard from './components/StatCard';
import FeeChart from './components/FeeChart';
import { IconDotsVertical, IconEye, IconEdit } from '@tabler/icons-react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import {
  fetchClassesByProgramme,
  fetchProgrammes,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import {
  fetchClassLedgerAnalytics,
  fetchDrilldownStudents,
  generateClassLedgerExcel,
  getClassStudentsPaymentStatus,
  printClassLedgerPaymentList,
} from '@/api/tenant/bursary/classLedger';
import useNotification from '@/hooks/useNotification';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Bursary' }, { title: 'class ledger' }];

const ClassLedger = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('bar');

  const [isCompulsory, setIsCompulsory] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [isPayable, setIsPayable] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);

  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [ledgerData, setLedgerData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [meta, setMeta] = useState(null);

  const notify = useNotification();

  const handleFilterChange = React.useCallback(async (key, val) => {
    if (key === 'programme') {
      try {
        const classesRes = await fetchClassesByProgramme(val);
        setClasses(
          classesRes.data.map((c) => ({
            value: c.class_arm_id,
            label: c.class_code,
            arm_names: c.arm_names,
          })),
        );
        setClassLevel(''); // reset class when programme changes
      } catch (error) {
        console.error('Failed to fetch classes', error);
      }
    }
  }, []);

  const handleFetchDrilldown = async (type) => {
    const payload = {
      filters: {
        programme_id: programme,
        class_arm_id: classLevel,
        type,
      },
    };
    const res = await fetchDrilldownStudents(payload);
    return res?.data || [];
  };

  // find the selected class label for display
  const selectedClassName = useMemo(() => {
    const cls = classes.find((c) => c.value === classLevel);
    return cls ? `${cls.label} ${cls.arm_names}` : '';
  }, [classes, classLevel]);

  const handleDownloadExcel = async () => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    try {
      notify.info('Generating Excel...');
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
        },
      };

      const blob = await generateClassLedgerExcel(payload);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment_list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      notify.error('Failed to generate Excel');
    }
  };

  const handlePrintPaymentList = async () => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    try {
      notify.info('Preparing print view...');
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
        },
      };

      const { students, class_name, sess_term, school_name } =
        await printClassLedgerPaymentList(payload);

      const rows = students
        .map(
          (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${[s.fname, s.lname, s.mname].filter(Boolean).join(' ')}</td>
        <td>${Number(s.total_compulsory).toLocaleString()}</td>
        <td>${Number(s.total_optional).toLocaleString()}</td>
        <td>${Number(s.total_payable).toLocaleString()}</td>
        <td>${Number(s.total_paid).toLocaleString()}</td>
        <td class="${s.total_balance > 0 ? 'owing' : 'cleared'}">
          ${Number(s.total_balance).toLocaleString()}
        </td>
      </tr>
    `,
        )
        .join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Payment List - ${class_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 24px; }
    h2, h3, p { text-align: center; margin-bottom: 4px; }
    h2 { font-size: 16px; text-transform: uppercase; }
    h3 { font-size: 14px; }
    p  { font-size: 12px; color: #444; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #1a1a2e; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .owing   { font-weight: 600; color: #dc2626; }
    .cleared { font-weight: 600; color: #16a34a; }
    .footer  { margin-top: 24px; font-size: 11px; color: #888; text-align: center; }
    @media print {
      body { padding: 8px; }
      .no-print { display: none !important; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h2>Payment List</h2>
  <h2>${school_name}</h2>
  <h3>Class: ${class_name}</h3>
  <p>Session Term: ${sess_term}</p>

  <div class="no-print" style="text-align:right; margin-bottom:12px;">
    <button onclick="window.print()"
      style="padding:8px 18px; background:#1a1a2e; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px;">
      🖨️ Print
    </button>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Student Name</th>
        <th>Compulsory Bill (₦)</th>
        <th>Optional Bill (₦)</th>
        <th>Total Payable (₦)</th>
        <th>Total Paid (₦)</th>
        <th>Balance (₦)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

      const printWindow = window.open('', '_blank');
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error(error);
      notify.error('Failed to load print view');
    }
  };

  const loadProgrammes = async () => {
    try {
      const res = await fetchProgrammes();
      setProgrammes(
        res.data.map((p) => ({
          value: p.id,
          label: p.programme_name,
        })),
      );
    } catch (error) {
      console.error('Failed to load programmes');
    }
  };

  const fetchClassLedgerData = async () => {
    if (!programme || !classLevel) {
      notify.warning('Please select Programme and Class');
      return;
    }

    setLoadingTable(true);
    setLoadingAnalytics(true);

    try {
      const payload = {
        filters: {
          programme_id: programme,
          class_arm_id: classLevel,
          payment_status: paymentStatusFilter,
          search: search,
          page: page + 1,
          per_page: rowsPerPage,
        },
      };

      // Fetch Analytics for Stat Cards
      const analyticsRes = await fetchClassLedgerAnalytics(payload);
      setAnalyticsData(analyticsRes);

      // Fetch Table Data
      const tableRes = await getClassStudentsPaymentStatus(payload);
      setLedgerData(tableRes.students?.data || []);
      setMeta(tableRes.students);
    } catch (error) {
      console.error(error);
      notify.error('Failed to load class ledger data');
    } finally {
      setLoadingTable(false);
      setLoadingAnalytics(false);
    }
  };

  const fetchAnalyticsOnly = async () => {
    if (!programme || !classLevel) return;

    setLoadingAnalytics(true);
    try {
      const payload = {
        filters: {
          progId: programme,
          class_arm_id: classLevel,
          payment_status: paymentStatusFilter || null,
          search: search,
        },
      };

      const analyticsRes = await fetchClassLedgerAnalytics(payload);
      setAnalyticsData(analyticsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Auto-select first Programme
  useEffect(() => {
    if (programmes.length > 0 && !programme) {
      const firstProg = programmes[0].value;
      setProgramme(firstProg);
      // handleFilterChange('programme', firstProg);

      // Fetch classes for first programme, then auto-select first class
      fetchClassesByProgramme(firstProg)
        .then((classesRes) => {
          const mapped = classesRes.data.map((c) => ({
            value: c.class_arm_id,
            label: c.class_code,
            arm_names: c.arm_names,
          }));
          setClasses(mapped);
          if (mapped.length > 0) {
            setClassLevel(mapped[0].value); // ← auto-select first class
          }
        })
        .catch((err) => console.error('Failed to fetch classes', err));
    }
  }, [programmes]);

  // Auto-load Analytics when Programme or Class changes
  useEffect(() => {
    if (programme && classLevel) {
      fetchAnalyticsOnly();
    }
  }, [programme, classLevel, paymentStatusFilter]);

  useEffect(() => {
    if (programme && classLevel && ledgerData.length > 0) {
      fetchClassLedgerData();
    }
  }, [page, rowsPerPage]);

  // Auto refresh analytics when payment status filter changes
  useEffect(() => {
    if (programme && classLevel) {
      fetchAnalyticsOnly();
    }
  }, [paymentStatusFilter]);

  useEffect(() => {
    loadProgrammes();
  }, []);

  const buildChartOptions = (categories) => ({
    chart: {
      type: chartType,
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: 'inherit',
      foreColor: isDark ? '#aaa' : '#64748B',
    },

    legend: {
      position: 'top', // 👈 key change
      horizontalAlign: 'center',
      fontSize: '13px',
      labels: {
        colors: isDark ? '#aaa' : '#64748B',
      },
    },

    plotOptions: {
      bar: { borderRadius: 3, columnWidth: '55%' },
    },

    dataLabels: { enabled: false },

    colors: ['#6366F1', '#22C55E', '#EF4444'],

    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDark ? '#aaa' : '#64748B',
          fontSize: '12px',
        },
      },
    },

    yaxis: {
      labels: {
        formatter: (val) =>
          val >= 1000000
            ? (val / 1000000).toFixed(1) + 'M'
            : val >= 1000
              ? (val / 1000).toFixed(0) + 'K'
              : val,
      },
    },

    grid: {
      borderColor: isDark ? '#333' : '#f1f1f1',
      strokeDashArray: 4,
    },

    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  });

  return (
    <PageContainer title="Class Ledger">
      <Breadcrumb title="Class Ledger" items={BCrumb} />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Invoice(Compulsory Bill)"
            value={`₦${(analyticsData?.total_comp_schedule || 0).toLocaleString()}`}
            valueColor="#5CB979"
            valueBg={isDark ? '#1e2a4a' : '#EEFAF3'}
            subStats={[
              {
                label: 'Total Paid',
                value: `₦${(analyticsData?.total_comp_transaction || 0).toLocaleString()}`,
              },
              {
                label: 'Balance',
                value: `₦${(analyticsData?.total_comp_balance || 0).toLocaleString()}`,
              },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Compulsory Fees');
              setChartType('bar');
              setIsCompulsory(true);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Compulsory Fees');
              setChartType('bar');
              setIsCompulsory(true);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Invoice (Optional Bill)"
            value={`₦${(analyticsData?.total_opt_schedule || 0).toLocaleString()}`}
            valueColor="#1F35B6"
            valueBg={isDark ? '#0d2e1e' : '#ECEFFF'}
            subStats={[
              {
                label: 'Total Paid',
                value: `₦${(analyticsData?.total_opt_transaction || 0).toLocaleString()}`,
              },
              {
                label: 'Balance',
                value: `₦${(analyticsData?.total_opt_balance || 0).toLocaleString()}`,
              },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Optional Fees');
              setChartType('bar');
              setIsOptional(true);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Optional Fees');
              setChartType('bar');
              setIsOptional(true);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StatCard
            title="Total Payable"
            value={`₦${(analyticsData?.outstanding_balance || 0).toLocaleString()}`}
            valueColor="#895CB9"
            valueBg={isDark ? '#0d2e1e' : '#F3EEFA'}
            subStats={[
              {
                label: 'Total Paid',
                value: `₦${(analyticsData?.total_transaction || 0).toLocaleString()}`,
              },
              {
                label: 'Balance',
                value: `₦${(analyticsData?.total_balance || 0).toLocaleString()}`,
              },
            ]}
            onIconClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Total Payable');
              setChartType('bar');
              setIsPayable(true);
            }}
            onClick={() => {
              setIsFeeModalOpen(true);
              setChartTitle('Total Payable');
              setChartType('bar');
              setIsPayable(true);
            }}
          />
        </Grid>
      </Grid>
      <ParentCard
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="h5"></Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                onClick={handleDownloadExcel}
              >
                View In CSV Format
              </Button>

              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                size="small"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                onClick={handlePrintPaymentList}
              >
                Print Payment List
              </Button>
            </Box>
          </Box>
        }
      >
        <Grid container spacing={3} sx={{ mb: 3, mt: 3 }} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Programme"
              size="small"
              value={programme}
              onChange={(e) => {
                const val = e.target.value;
                setProgramme(val);
                handleFilterChange('programme', val);
              }}
            >
              {programmes.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Class"
              size="small"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label} ({c.arm_names})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Payment Status"
              size="small"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Students</MenuItem>
              <MenuItem value="cleared">Payment List (Cleared)</MenuItem>
              <MenuItem value="owing">Debtor's List (Owing)</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              placeholder="Search by name"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 1 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: '40px' }}
              onClick={fetchClassLedgerData}
              disabled={!programme || !classLevel}
            >
              Fetch
            </Button>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell> Compulsory Bill</TableCell>
                <TableCell>Optional Bill</TableCell>
                <TableCell>Total Payable</TableCell>
                <TableCell>Total Paid</TableCell>
                <TableCell>Penalty</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingTable ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : ledgerData.length > 0 ? (
                ledgerData.map((student, index) => {
                  const user = student.users || student.user || {};
                  return (
                    <TableRow key={student.user_id || index} hover>
                      {/* <TableCell>{index + 1}</TableCell> */}
                      <TableCell>{(meta?.from || 0) + index}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={user.avatar} sx={{ width: 36, height: 36 }}>
                            {user.fname?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.full_name || `${user.fname} ${user.lname}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.user_id || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        ₦
                        {(
                          student.total_compulsory ||
                          student.total_compulsorys ||
                          0
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>₦{(student.total_optional || 0).toLocaleString()}</TableCell>
                      <TableCell>₦{(student.total_payable || 0).toLocaleString()}</TableCell>
                      <TableCell>₦{(student.total_paid || 0).toLocaleString()}</TableCell>
                      <TableCell>₦0</TableCell> {/* Penalty - add if available later */}
                      <TableCell>₦0</TableCell> {/* Discount - add if available later */}
                      <TableCell
                        sx={{
                          color: (student.total_balance || 0) > 0 ? 'error.main' : 'success.main',
                          fontWeight: 600,
                        }}
                      >
                        ₦{(student.total_balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setActiveRow(student);
                          }}
                        >
                          <IconDotsVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    No students found for the selected class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30, 50]}
                  count={meta?.total || 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 190 } }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
            }}
          >
            <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Student Ledger
          </MenuItem>

          <MenuItem>
            <PaymentsOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Pay for Student
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              if (activeRow) {
                window.open(
                  `/class-ledger/${activeRow.invoice_number}/${activeRow.user_id}/invoice`,
                  '_blank',
                );
              }
            }}
          >
            <EditNoteOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Update Invoice
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              if (activeRow) {
                window.open(
                  `/class-ledger/${activeRow.invoice_number}/${activeRow.user_id}/cash-post`,
                  '_blank',
                );
              }
            }}
          >
            <CurrencyExchangeOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Cash Posting
          </MenuItem>

          <MenuItem onClick={() => setAnchorEl(null)}>
            <AccountBalanceWalletOutlinedIcon fontSize="small" sx={{ color: '#6b7280', mr: 1 }} />
            Wallet Transaction
          </MenuItem>
        </Menu>
        <FeeChart
          open={isFeeModalOpen}
          onClose={() => {
            setIsFeeModalOpen(false);
            setIsCompulsory(false);
            setIsOptional(false);
            setIsPayable(false);
          }}
          title={chartTitle}
          chartType={chartType}
          chartOptions={buildChartOptions([selectedClassName])}
          isPayable={isPayable}
          isOptional={isOptional}
          isCompulsory={isCompulsory}
          analyticsData={analyticsData}
          className={selectedClassName}
          onFetchDrilldown={handleFetchDrilldown}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default ClassLedger;
