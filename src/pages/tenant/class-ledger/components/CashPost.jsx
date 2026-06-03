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

  /* RENDER TABLE */
  const renderTable = (type, data) => {
    const discountGlobal = type === 'comp' ? compDiscountGlobal : optDiscountGlobal;
    const penaltyGlobal = type === 'comp' ? compPenaltyGlobal : optPenaltyGlobal;

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 600 }}>
            COMPULSORY FEES
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Discount</Typography>
              <Switch
                checked={compDiscountGlobal}
                onChange={(e) => setCompDiscountGlobal(e.target.checked)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Penalty</Typography>
              <Switch
                checked={compPenaltyGlobal}
                onChange={(e) => setCompPenaltyGlobal(e.target.checked)}
              />
            </Box>
          </Box>
        </Box>
        {renderTable('comp', compFees)}

        {/* OPTIONAL */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mt: 4,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 600 }}>
            OPTIONAL FEES
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Discount</Typography>
              <Switch
                checked={optDiscountGlobal}
                onChange={(e) => setOptDiscountGlobal(e.target.checked)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Penalty</Typography>
              <Switch
                checked={optPenaltyGlobal}
                onChange={(e) => setOptPenaltyGlobal(e.target.checked)}
              />
            </Box>
          </Box>
        </Box>
        {renderTable('opt', optFees)}
      </Box>
    </PageContainer>
  );
};

export default CashPost;
