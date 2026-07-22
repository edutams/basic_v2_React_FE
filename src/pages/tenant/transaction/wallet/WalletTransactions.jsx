import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

import PageContainer from '@/components/container/PageContainer';
import ParentCard from '@/components/shared/ParentCard';
import { fetchWalletTransactions } from '@/api/tenant/bursary/transactionApi';

const WalletTransactions = () => {
  const [searchParams] = useSearchParams();

  const wallet_account_no = searchParams.get('wallet_account_no');

  const [loading, setLoading] = useState(true);

  const [wallet, setWallet] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const formatCurrency = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

  useEffect(() => {
    if (!wallet_account_no) return;

    loadWallet();
  }, [wallet_account_no]);

  const loadWallet = async () => {
    setLoading(true);

    try {
      const res = await fetchWalletTransactions(wallet_account_no);

      if (res.success) {
        setWallet(res.wallet);
        setTransactions(res.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Wallet Transactions">
      <ParentCard title="Wallet Transactions">
        {loading ? (
          <Box py={8} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} mb={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" gap={2} alignItems="center">
                      <Avatar src={wallet?.avatar} sx={{ width: 70, height: 70 }} />

                      <Box>
                        <Typography variant="h5">{wallet?.name}</Typography>

                        <Typography color="text.secondary">{wallet?.learner_id}</Typography>

                        <Typography color="text.secondary">{wallet?.class}</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">Wallet Account</Typography>

                        <Typography fontWeight={700}>{wallet?.wallet_account_no}</Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">Wallet Balance</Typography>

                        <Typography fontWeight={700} color="success.main">
                          {formatCurrency(wallet?.balance)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={8}>
                        No wallet transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{index + 1}</TableCell>

                        <TableCell>{dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>

                        <TableCell>{row.reference}</TableCell>

                        <TableCell>{row.description}</TableCell>

                        <TableCell align="right">
                          {row.type === 'CREDIT' ? formatCurrency(row.amount) : '-'}
                        </TableCell>

                        <TableCell align="right">
                          {row.type === 'DEBIT' ? formatCurrency(row.amount) : '-'}
                        </TableCell>

                        <TableCell align="right">{formatCurrency(row.balance_after)}</TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              row.status === 'SUCCESS'
                                ? 'success'
                                : row.status === 'PENDING'
                                  ? 'warning'
                                  : 'error'
                            }
                            label={row.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default WalletTransactions;
