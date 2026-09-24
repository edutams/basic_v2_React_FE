import { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, Snackbar, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, useTheme,
} from '@mui/material';
import { IconShoppingCart, IconHistory, IconBrandWhatsapp, IconCoin, IconMessageCircle } from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import StatCard from '@/components/shared/StatCard';

const WhatsAppTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [pricing, setPricing] = useState([]);
  const [selected, setSelected] = useState(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const loadPricing = useCallback(async () => {
    try {
      const res = await communicationApi.whatsappPricing();
      setPricing(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPricing([]);
    }
  }, []);

  useEffect(() => { loadPricing(); }, [loadPricing]);

  const buy = async () => {
    if (!selected) return;
    try {
      const res = await communicationApi.smsTransactionCreate({
        id: selected.id,
        amount: selected.amount,
        units: selected.units,
      });
      const d = res.data ?? {};
      showSnack('Payment initialised');
      if (d.trans_id) {
        window.open(
          `${import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL_LOCAL}/pay?ref=${d.trans_id}&amount=${d.amount}`,
          '_blank',
        );
      }
      setBuyOpen(false);
      setSelected(null);
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to start purchase', 'error');
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    try {
      const res = await communicationApi.smsTransactionsHistory({ status: 'approved' });
      setHistory(res.data?.data ?? (Array.isArray(res.data) ? res.data : []));
    } catch {
      setHistory([]);
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5 }}>
        Send student results to parents via WhatsApp. Compose and send bulk result messages from Result Manager → Result Messaging.
      </Alert>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={pricing.length} label="Unit Packages" subtitle="WhatsApp packages available" icon={IconBrandWhatsapp} colorIndex={1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={pricing.reduce((sum, p) => sum + Number(p.units || 0), 0).toLocaleString()} label="Total Units" subtitle="Across all packages" icon={IconCoin} colorIndex={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={pricing.reduce((sum, p) => sum + Number(p.maximum_messages || 0), 0).toLocaleString()} label="Max Messages" subtitle="Theoretical capacity" icon={IconMessageCircle} colorIndex={2} />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" startIcon={<IconShoppingCart size={16} />} onClick={() => { setBuyOpen(true); loadPricing(); }}>
          Buy WhatsApp Units
        </Button>
        <Button size="small" variant="outlined" startIcon={<IconHistory size={16} />} onClick={openHistory}>
          Transaction History
        </Button>
        <Chip label="Result WhatsApp lives under Result Messaging" size="small" variant="outlined" />
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>WhatsApp Unit Packages</Typography>
        <Grid container spacing={1.5}>
          {pricing.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: '#94a3b8',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#DCFCE7', color: isDark ? '#fff' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconBrandWhatsapp size={22} />
                  </Box>
                  <Chip size="small" label={`${Number(p.maximum_messages).toLocaleString()} msgs`} variant="outlined" />
                </Box>
                <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#16A34A' }}>
                  {Number(p.units).toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#4B5563' }}>units</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 700, mt: 0.5 }}>₦{Number(p.amount).toLocaleString()}</Typography>
                <Button fullWidth size="small" variant="contained" sx={{ mt: 1, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }} onClick={() => setSelected(p) || setBuyOpen(true)}>
                  Select Package
                </Button>
              </Paper>
            </Grid>
          ))}
          {pricing.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>No WhatsApp pricing configured.</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Buy WhatsApp Units</DialogTitle>
        <DialogContent>
          <List>
            {pricing.map((p) => (
              <ListItem
                key={p.id}
                button
                selected={selected?.id === p.id}
                onClick={() => setSelected(p)}
                sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider', mb: 1 }}
              >
                <ListItemText primary={`${p.units.toLocaleString()} units`} secondary={`₦${Number(p.amount).toLocaleString()}`} />
              </ListItem>
            ))}
            {pricing.length === 0 && <Typography color="text.secondary">No pricing available.</Typography>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={buy} disabled={!selected}>Pay Now</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction History</DialogTitle>
        <DialogContent>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['Trans ID', 'Amount', 'Units', 'Status', 'Date'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((t) => (
                  <TableRow key={t.trans_id} hover>
                    <TableCell>{t.trans_id}</TableCell>
                    <TableCell>₦{Number(t.amount).toLocaleString()}</TableCell>
                    <TableCell>{Number(t.units).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.trans_status}
                        color={t.trans_status === 'approved' ? 'success' : t.trans_status === 'declined' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{t.trans_date}</TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">No transactions.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WhatsAppTab;
