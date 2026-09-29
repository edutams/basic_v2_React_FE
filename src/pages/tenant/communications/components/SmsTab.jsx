import { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Button, TextField, List, ListItem, ListItemText,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, useTheme, CircularProgress, Divider,
} from '@mui/material';
import { IconSend, IconTrash, IconSearch, IconHistory, IconPlus, IconShoppingCart, IconMessage2, IconCalendarStats, IconCoin } from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import StatCard from '@/components/shared/StatCard';

const CHARS_PER_PAGE = 160;

const SmsTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const border = { border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' };

  const [stats, setStats] = useState({ all: 0, term_message: 0, to_parents: 0, to_staff: 0, to_students: 0 });
  const [units, setUnits] = useState(0);
  const [filters, setFilters] = useState({ userType: 'parent', recipient: 'all', userClass: '', userCategory: 'teaching', search: '' });
  const [classes, setClasses] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [pricing, setPricing] = useState([]);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const loadCore = useCallback(async () => {
    try {
      const [s, sub, c] = await Promise.all([
        communicationApi.smsStatistics(),
        communicationApi.smsSubscription(),
        communicationApi.smsClasses(),
      ]);
      setStats(s.data?.data ?? {});
      const subRows = Array.isArray(sub.data) ? sub.data : [];
      setUnits(subRows[0]?.sms_units ?? 0);
      setClasses(Array.isArray(c.data) ? c.data : []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => { loadCore(); }, [loadCore]);

  const pages = message ? Math.max(1, Math.ceil(message.length / CHARS_PER_PAGE)) : 0;
  const unitCost = pages * recipients.length;

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await communicationApi.smsUsers(filters);
      const rows = Array.isArray(res.data) ? res.data : [];
      setRecipients(rows);
      showSnack(`Generated ${rows.length} recipient(s)`);
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to generate recipients', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const searchIndividual = async () => {
    try {
      const res = await communicationApi.smsUserSearch({ ...filters, recipient: 'individual', search: filters.search });
      const rows = Array.isArray(res.data) ? res.data : [];
      setRecipients(rows);
      if (!rows.length) showSnack('No matching users', 'warning');
    } catch (err) {
      showSnack(err.response?.data?.error || 'Search failed', 'error');
    }
  };

  const send = async () => {
    if (!message.trim() || recipients.length === 0) {
      showSnack('Message and recipients required', 'warning');
      return;
    }
    const phones = recipients.map((r) => r.phone).filter(Boolean);
    if (!phones.length) {
      showSnack('No recipients have phone numbers', 'warning');
      return;
    }
    setSending(true);
    try {
      const res = await communicationApi.smsSave({
        message,
        receivers: phones,
        recipient: recipients,
        unitUsed: unitCost,
      });
      const remaining = typeof res.data === 'number' ? res.data : res.data?.units ?? res.data;
      if (typeof remaining === 'number') setUnits(remaining);
      showSnack('SMS queued for delivery');
      setMessage('');
      setRecipients([]);
      loadCore();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to send SMS';
      showSnack(status === 250 ? msg : msg, 'error');
      if (status === 250) loadCore();
    } finally {
      setSending(false);
    }
  };

  const openBuy = async () => {
    setBuyOpen(true);
    try {
      const res = await communicationApi.smsPricing();
      setPricing(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPricing([]);
    }
  };

  const buy = async () => {
    if (!selectedPricing) return;
    try {
      const res = await communicationApi.smsTransactionCreate({
        id: selectedPricing.id,
        amount: selectedPricing.amount,
        units: selectedPricing.units,
      });
      const d = res.data ?? {};
      showSnack('Payment initialised — complete payment to receive units');
      if (d.trans_id) {
        window.open(
          `${import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL_LOCAL}/pay?ref=${d.trans_id}&amount=${d.amount}`,
          '_blank',
        );
      }
      setBuyOpen(false);
      setSelectedPricing(null);
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to start purchase', 'error');
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    try {
      const res = await communicationApi.smsTransactionsHistory({});
      setHistory(res.data?.data ?? (Array.isArray(res.data) ? res.data : []));
    } catch {
      setHistory([]);
    }
  };

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={stats.all ?? 0} label="Total SMS" subtitle="All messages sent" icon={IconMessage2} colorIndex={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={stats.term_message ?? 0} label="This Term" subtitle="Sent this academic term" icon={IconCalendarStats} colorIndex={2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={units} label="Remaining Units" subtitle="SMS units left on your plan" icon={IconCoin} colorIndex={1} />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" startIcon={<IconShoppingCart size={16} />} onClick={openBuy}>Buy Units</Button>
        <Button size="small" variant="outlined" startIcon={<IconHistory size={16} />} onClick={openHistory}>Transaction History</Button>
        <Chip label={`Units: ${units}`} color="success" variant="outlined" />
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, ...border }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>User Type</InputLabel>
              <Select value={filters.userType} label="User Type" onChange={(e) => setFilters((f) => ({ ...f, userType: e.target.value }))}>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Recipient</InputLabel>
              <Select value={filters.recipient} label="Recipient" onChange={(e) => setFilters((f) => ({ ...f, recipient: e.target.value }))}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {filters.userType === 'staff' && filters.recipient !== 'individual' && (
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filters.userCategory} label="Category" onChange={(e) => setFilters((f) => ({ ...f, userCategory: e.target.value }))}>
                  <MenuItem value="teaching">Teaching</MenuItem>
                  <MenuItem value="non-teaching">Non-Teaching</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {filters.userType === 'student' && filters.recipient !== 'individual' && (
            <Grid size={{ xs: 6, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filters.userClass} label="Class" onChange={(e) => setFilters((f) => ({ ...f, userClass: e.target.value }))}>
                  <MenuItem value="">All classes</MenuItem>
                  {classes.map((c) => (
                    <MenuItem key={c.class_arm_id ?? c.cID} value={c.class_arm_id ?? c.cID}>{c.class_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {filters.recipient === 'individual' ? (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search name / phone…"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchIndividual(); }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <Button fullWidth size="small" variant="outlined" onClick={searchIndividual}><IconSearch size={16} /></Button>
              </Grid>
            </>
          ) : (
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button fullWidth size="small" variant="contained" onClick={generate} disabled={generating} startIcon={generating ? <CircularProgress size={14} /> : <IconPlus size={16} />}>
                Generate
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 2, ...border }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Recipients ({recipients.length})
            </Typography>
            {recipients.some((r) => !r.phone) && (
              <Alert severity="warning" sx={{ mb: 1 }}>Some recipients are missing phone numbers.</Alert>
            )}
            <List dense sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {recipients.map((r, i) => (
                <ListItem
                  key={`${r.id}-${i}`}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => setRecipients((list) => list.filter((_, idx) => idx !== i))}>
                      <IconTrash size={14} />
                    </IconButton>
                  }
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', mb: 0.5 }}
                >
                  <ListItemText
                    primary={[r.fname, r.lname].filter(Boolean).join(' ') || r.fname}
                    secondary={r.phone || 'No phone'}
                    primaryTypographyProps={{ fontSize: 13 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
              ))}
              {recipients.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No recipients selected.</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 2, ...border }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Message</Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your SMS…"
              inputProps={{ maxLength: CHARS_PER_PAGE * 10 }}
            />
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {message.length} chars · {pages} page(s) · {recipients.length} recipient(s)
                </Typography>
                <Typography variant="body2" fontWeight={700} color={unitCost > units ? 'error' : 'success.main'}>
                  Units required: {unitCost}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<IconSend size={16} />}
                onClick={send}
                disabled={sending || !message.trim() || recipients.length === 0}
              >
                {sending ? 'Sending…' : 'Send SMS'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Buy SMS Units</DialogTitle>
        <DialogContent>
          <List>
            {pricing.map((p) => (
              <ListItem
                key={p.id}
                button
                selected={selectedPricing?.id === p.id}
                onClick={() => setSelectedPricing(p)}
                sx={{ borderRadius: '8px', border: '1px solid', borderColor: 'divider', mb: 1 }}
              >
                <ListItemText primary={`${p.units.toLocaleString()} units`} secondary={`₦${Number(p.amount).toLocaleString()}`} />
                <Chip size="small" label={`${Number(p.maximum_messages).toLocaleString()} msgs`} />
              </ListItem>
            ))}
            {pricing.length === 0 && <Typography color="text.secondary">No pricing available.</Typography>}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={buy} disabled={!selectedPricing}>Pay Now</Button>
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

export default SmsTab;
