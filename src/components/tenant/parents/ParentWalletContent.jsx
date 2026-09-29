import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import guardianApi from '@/api/tenant/guardians/parentApi';

const naira = (n) => `₦${(Number(n) || 0).toLocaleString()}`;

const StatTile = ({ title, value, icon, color, bgColor, note }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      border: '1px solid',
      borderColor: 'divider',
      flex: 1,
    }}
  >
    <Box
      sx={{
        bgcolor: bgColor,
        color,
        p: 1.5,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      {value === null ? (
        <Typography variant="caption" color="text.disabled">
          {note}
        </Typography>
      ) : (
        <Typography variant="h6" color={color} fontWeight={700}>
          {naira(value)}
        </Typography>
      )}
    </Box>
  </Box>
);

StatTile.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  note: PropTypes.string,
};

const ParentWalletContent = ({ guardian, onClose }) => {
  const guardianName = guardian?.user
    ? `${guardian.user.fname} ${guardian.user.lname}`
    : 'Guardian';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guardian?.user_id) return;
    setError(null);
    setLoading(true);
    guardianApi
      .getWalletOverview(guardian.user_id)
      .then((res) => setData(res?.data?.data ?? null))
      .catch(() => setError('Failed to load wallet & transactions.'))
      .finally(() => setLoading(false));
  }, [guardian?.user_id]);

  const parent = data?.parent;
  const wards = data?.wards ?? [];
  const totalPaidAcrossWards = wards.reduce((sum, w) => sum + (w.total_paid || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountBalanceWalletOutlinedIcon fontSize="small" />
        <Typography variant="h6">
          Wallet & Transactions —{' '}
          <Typography component="span" color="primary" fontWeight={600}>
            {parent?.name || guardianName}
          </Typography>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <StatTile
              title="Wallet Balance"
              value={parent?.wallet ? parent.wallet.balance : null}
              note="No SkoolPay wallet yet"
              icon={<AccountBalanceWalletOutlinedIcon />}
              color="primary.main"
              bgColor="primary.light"
            />
            <StatTile
              title="Total Inflow"
              value={parent?.wallet ? parent.wallet.total_inflow : null}
              note="No wallet data yet"
              icon={<TrendingUpOutlinedIcon />}
              color="success.main"
              bgColor="#ebfaf2"
            />
            <StatTile
              title="Total Outflow"
              value={parent?.wallet ? parent.wallet.total_outflow : null}
              note="No wallet data yet"
              icon={<TrendingDownOutlinedIcon />}
              color="warning.main"
              bgColor="#fff4e5"
            />
          </Box>

          {parent?.wallet && (parent.wallet.account_number || parent.wallet.bank_name) && (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50'),
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Bank
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {parent.wallet.bank_name || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Account Number
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {parent.wallet.account_number || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Account Name
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {parent.wallet.account_name || '—'}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Wards ({wards.length}) — {naira(totalPaidAcrossWards)} paid in total
          </Typography>

          {wards.length === 0 ? (
            <Alert severity="info">No wards linked to this guardian yet.</Alert>
          ) : (
            wards.map((ward) => (
              <Accordion key={ward.id} variant="outlined" sx={{ mb: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
                    <Avatar src={ward.avatar || undefined} sx={{ width: 36, height: 36 }}>
                      <PersonOutlineIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {ward.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[ward.admission_no, ward.class_label].filter(Boolean).join(' • ')}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${naira(ward.total_paid)} paid`}
                      size="small"
                      color={ward.total_paid > 0 ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }} align="right">
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ward.transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                No payments yet.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          ward.transactions.map((row) => (
                            <TableRow key={row.bulk_order_id} hover>
                              <TableCell sx={{ fontSize: '0.78rem' }}>
                                {row.trans_date ? dayjs(row.trans_date).format('MMM D, YYYY') : '—'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.78rem' }}>{row.description || '—'}</TableCell>
                              <TableCell sx={{ fontSize: '0.78rem' }}>{row.payment_type || '—'}</TableCell>
                              <TableCell sx={{ fontSize: '0.78rem' }} align="right">
                                {naira(row.amount)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </>
      )}

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" size="small" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Box>
  );
};

ParentWalletContent.propTypes = {
  guardian: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ParentWalletContent;
