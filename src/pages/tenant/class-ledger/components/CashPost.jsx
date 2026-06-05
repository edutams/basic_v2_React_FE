import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import {
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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  useTheme,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';


/* ================= DATA ================= */
const dummyStudentData = {
  id: 1,
  studentName: 'Blessing Okafor Chidi',
  admissionNumber: 'JG-STA/2025/0334',
  class: 'JSS 3 Emerald',
  session: '2025/2026',
  avatar:
    'https://ik.imagekit.io/edx82gwzy/istockphoto-1332100919-612x612.jpg?updatedAt=1710424155848',
};

const baseFees = [
  {
    id: 1,
    description: 'Tuition',
    amount: 185000,
    discount: 0,
    penalty: 0,
    installment: 'Full',
  },
  {
    id: 2,
    description: 'Development Levy',
    amount: 25000,
    discount: 0,
    penalty: 0,
    installment: 'Full',
  },
  { id: 3, description: 'Books', amount: 45500, discount: 0, penalty: 0, installment: 'Full' },
  { id: 4, description: 'Uniform', amount: 18000, discount: 0, penalty: 0, installment: 'Full' },
];

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Bursary' },
  { to: '/class-ledger', title: 'Class Ledger' },
  { title: 'Cash Posting' },
];

/* ================= COMPONENT ================= */
const CashPost = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedTerm, setSelectedTerm] = useState('Second Term');
  const [selectedSession, setSelectedSession] = useState('Session 2025/2026');
  const [selectedPurpose, setSelectedPurpose] = useState('');

  const [compFees, setCompFees] = useState(baseFees);
  const [optFees, setOptFees] = useState(baseFees);

  /* GLOBAL SWITCHES */
  const [compDiscountGlobal, setCompDiscountGlobal] = useState(false);
  const [compPenaltyGlobal, setCompPenaltyGlobal] = useState(false);
  const [optDiscountGlobal, setOptDiscountGlobal] = useState(false);
  const [optPenaltyGlobal, setOptPenaltyGlobal] = useState(false);

  /* UPDATE FIELD */
  const updateFee = (type, id, key, value) => {
    const setter = type === 'comp' ? setCompFees : setOptFees;
    setter((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, [key]: value };
        
        // Prevent negative values for discount and penalty
        const discount = Math.max(0, Number(updated.discount || 0));
        const penalty = Math.max(0, Number(updated.penalty || 0));
        
        updated.discount = discount;
        updated.penalty = penalty;
        updated.payable = updated.amount - discount + penalty;
        return updated;
      })
    );
  };

  const format = (n) => new Intl.NumberFormat('en-NG').format(n || 0);
  /* SECTION HEADER BLOCK */
      const renderHeaderBlock = ({ title, borderLeftColor, icon, action }) => {
          return (
              <Paper
                  elevation={0}
                  sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' },
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 2,
                      gap: { xs: 2, sm: 0 },
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                      borderLeft: `5px solid ${borderLeftColor}`,
                      borderRadius: '8px',
                  }}
              >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                          sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 38,
                              height: 38,
                              borderRadius: '8px',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                              color: isDark ? '#cbd5e1' : '#64748b',
                          }}
                      >
                          {icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} color={isDark ? '#f1f5f9' : '#334155'}>
                          {title}
                      </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{action}</Box>
              </Paper>
          );
      };

  /* RENDER TABLE */
  const renderTable = (type, data) => {
    const discountGlobal = type === 'comp' ? compDiscountGlobal : optDiscountGlobal;
    const penaltyGlobal = type === 'comp' ? compPenaltyGlobal : optPenaltyGlobal;

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2,mb:3 }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? '#222' : '#fafafa' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              {/* DISCOUNT */}
              <TableCell align="center">Discount</TableCell>
              {/* PENALTY */}
              <TableCell align="center">Penalty</TableCell>
              {/* INSTALLMENT */}
              <TableCell align="center">Installment</TableCell>
              <TableCell align="right">Payable</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((fee, i) => {
              // If global is ON, force all row switches to be ON and disable row switches
              // If global is OFF, let individual switches work independently
              const discountRowEnabled = discountGlobal ? true : !!fee.discountEnabled;
              const penaltyRowEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;
              const discountFieldEnabled = discountGlobal ? true : !!fee.discountEnabled;
              const penaltyFieldEnabled = penaltyGlobal ? true : !!fee.penaltyEnabled;

              return (
                <TableRow key={fee.id} hover>
                  <TableCell>{String(i + 1).padStart(2, '0')}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell align="right">{format(fee.amount)}</TableCell>

                  {/* ================= DISCOUNT ================= */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        size="small"
                        checked={discountRowEnabled}
                        disabled={discountGlobal} // Disable individual switch if global is ON
                        onChange={(e) =>
                          updateFee(type, fee.id, 'discountEnabled', e.target.checked)
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled={!discountFieldEnabled}
                        value={fee.discount}
                        onChange={(e) => updateFee(type, fee.id, 'discount', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  </TableCell>

                  {/* ================= PENALTY ================= */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        size="small"
                        checked={penaltyRowEnabled}
                        disabled={penaltyGlobal} // Disable individual switch if global is ON
                        onChange={(e) =>
                          updateFee(type, fee.id, 'penaltyEnabled', e.target.checked)
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        sx={{ width: 80 }}
                        disabled={!penaltyFieldEnabled}
                        value={fee.penalty}
                        onChange={(e) => updateFee(type, fee.id, 'penalty', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  </TableCell>

                  {/* ================= INSTALLMENT ================= */}
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={fee.installment}
                        onChange={(e) => updateFee(type, fee.id, 'installment', e.target.value)}
                      >
                        <MenuItem value="Full">Full</MenuItem>
                        <MenuItem value="Partial">Partial</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {format(fee.payable)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                    >
                      Post Cash
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <PageContainer title="Cash Posting">
      <Breadcrumb title="Cash Posting" items={BCrumb} />
      <Box title="">
        {/* HEADER - Student Info & Filters */}
        <Grid
          container
          spacing={2}
          sx={{
            mb: 4,
            mt: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
            borderRadius: 3,
          }}
          alignItems="stretch"
        >
          {/* LEFT SIDE - Student Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                height: '100%',
              }}
            >
              <Avatar
                src={dummyStudentData.avatar}
                alt={dummyStudentData.studentName}
                sx={{ width: 64, height: 64 }}
              >
                <PersonOutlineIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {dummyStudentData.studentName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    {dummyStudentData.admissionNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {dummyStudentData.class}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT SIDE - Filters */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid
              container
              spacing={2}
              sx={{
                p: 3,
                height: '100%',
              }}
              alignItems="center"
              justifyContent="center"
            >
              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Term</InputLabel>
                  <Select
                    value={selectedTerm}
                    label="Term"
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    <MenuItem value="First Term">First Term</MenuItem>
                    <MenuItem value="Second Term">Second Term</MenuItem>
                    <MenuItem value="Third Term">Third Term</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Session</InputLabel>
                  <Select
                    value={selectedSession}
                    label="Session"
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    <MenuItem value="Session 2024/2025">Session 2024/2025</MenuItem>
                    <MenuItem value="Session 2025/2026">Session 2025/2026</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Payment Purpose</InputLabel>
                  <Select
                    value={selectedPurpose}
                    label="Payment Purpose"
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                  >
                    <MenuItem value="">Select Purpose</MenuItem>
                    <MenuItem value="School Fees">School Fees</MenuItem>
                    <MenuItem value="Examination">Examination</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                <Button variant="contained" fullWidth sx={{ height: '40px' }}>
                  Fetch
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* COMPULSORY */}
         {renderHeaderBlock({
                    title: 'Compulsory Payment',
                    borderLeftColor: '#10b981',
                    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
                    action: (
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            alignItems: 'center', 
                            gap: { xs: 1.5, sm: 3 },
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>Discount</Typography>
                                <Switch
                                    size="small"
                                    checked={compDiscountGlobal}
                                    onChange={(e) => setCompDiscountGlobal(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#8338ec',
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>Penalty</Typography>
                                <Switch
                                    size="small"
                                    checked={compPenaltyGlobal}
                                    onChange={(e) => setCompPenaltyGlobal(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#8338ec',
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    ),
                })}
        {renderTable('comp', compFees)}

        {/* OPTIONAL */}
        {renderHeaderBlock({
                    title: 'Optional Payment',
                    borderLeftColor: '#3b82f6',
                    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
                    action: (
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            alignItems: 'center', 
                            gap: { xs: 1.5, sm: 3 },
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>Discount</Typography>
                                <Switch
                                    size="small"
                                    checked={optDiscountGlobal}
                                    onChange={(e) => setOptDiscountGlobal(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#8338ec',
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>Penalty</Typography>
                                <Switch
                                    size="small"
                                    checked={optPenaltyGlobal}
                                    onChange={(e) => setOptPenaltyGlobal(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#8338ec',
                                            '& + .MuiSwitch-track': {
                                                backgroundColor: '#8338ec',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    ),
                })}
        {renderTable('opt', optFees)}
      </Box>
    </PageContainer>
  );
};

export default CashPost;
