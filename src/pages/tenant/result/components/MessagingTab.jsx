import { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, useTheme,
} from '@mui/material';
import { IconMail, IconMessage, IconSend } from '@tabler/icons-react';

const dummySessionTerms = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
];
const dummyClasses = [
  { id: 1, name: 'JSS 1A' }, { id: 2, name: 'JSS 2A' }, { id: 3, name: 'SS 1A' }, { id: 4, name: 'SS 2A' },
];

const initialHistory = [
  { id: 1, class: 'JSS 1A', session_term: '2025/2026 - First Term', recipients: 42, channel: 'SMS', sent_at: '2026-07-01 10:30', status: 'delivered' },
  { id: 2, class: 'JSS 1A', session_term: '2025/2026 - First Term', recipients: 42, channel: 'Email', sent_at: '2026-07-01 10:35', status: 'delivered' },
  { id: 3, class: 'JSS 2A', session_term: '2025/2026 - First Term', recipients: 38, channel: 'SMS', sent_at: '2026-07-01 11:00', status: 'delivered' },
  { id: 4, class: 'SS 1A', session_term: '2025/2026 - First Term', recipients: 35, channel: 'WhatsApp', sent_at: '2026-07-02 09:15', status: 'pending' },
  { id: 5, class: 'SS 2A', session_term: '2025/2026 - First Term', recipients: 30, channel: 'SMS', sent_at: '2026-07-02 09:30', status: 'delivered' },
  { id: 6, class: 'SS 2A', session_term: '2025/2026 - First Term', recipients: 30, channel: 'Email', sent_at: '2026-07-02 10:00', status: 'failed' },
];

const MessagingTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [history, setHistory] = useState(initialHistory);
  const [sendDialog, setSendDialog] = useState({ open: false, channel: '' });
  const [sendForm, setSendForm] = useState({ session_term: 1, class: 1 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSend = () => {
    const classObj = dummyClasses.find(c => c.id === sendForm.class);
    const stObj = dummySessionTerms.find(s => s.id === sendForm.session_term);
    const newEntry = {
      id: Date.now(),
      class: classObj?.name || 'JSS 1A',
      session_term: stObj?.label || '2025/2026 - First Term',
      recipients: Math.floor(Math.random() * 20) + 30,
      channel: sendDialog.channel,
      sent_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'delivered',
    };
    setHistory([newEntry, ...history]);
    setSendDialog({ open: false, channel: '' });
    setSendForm({ session_term: '', class: '' });
    showSnackbar(`Results sent via ${sendDialog.channel} successfully!`);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Send result notifications to students and parents via SMS, Email, or WhatsApp.
      </Alert>

      {/* ── Action Buttons ──────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" size="small" startIcon={<IconMail size={16} />} onClick={() => setSendDialog({ open: true, channel: 'Email' })}>
          Send via Email
        </Button>
        <Button variant="outlined" size="small" startIcon={<IconSend size={16} />} onClick={() => setSendDialog({ open: true, channel: 'SMS' })}>
          Send via SMS
        </Button>
        <Button variant="outlined" size="small" startIcon={<IconMessage size={16} />} onClick={() => setSendDialog({ open: true, channel: 'WhatsApp' })}>
          Send via WhatsApp
        </Button>
      </Box>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h4" fontWeight={700} color="primary">{history.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Messages Sent</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h4" fontWeight={700} color="success.main">{history.filter(h => h.status === 'delivered').length}</Typography>
            <Typography variant="body2" color="text.secondary">Delivered</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' }}>
            <Typography variant="h4" fontWeight={700} color="error.main">{history.filter(h => h.status === 'failed').length}</Typography>
            <Typography variant="body2" color="text.secondary">Failed</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── History Table ───────────────────────────────────── */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Session/Term</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Recipients</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Channel</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Sent At</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((h, i) => (
              <TableRow key={h.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{h.class}</TableCell>
                <TableCell>{h.session_term}</TableCell>
                <TableCell align="center">{h.recipients}</TableCell>
                <TableCell>
                  <Chip
                    label={h.channel}
                    size="small"
                    color={h.channel === 'SMS' ? 'info' : h.channel === 'Email' ? 'primary' : 'success'}
                  />
                </TableCell>
                <TableCell>{h.sent_at}</TableCell>
                <TableCell>
                  <Chip label={h.status} size="small" color={h.status === 'delivered' ? 'success' : h.status === 'failed' ? 'error' : 'warning'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Send Dialog ─────────────────────────────────────── */}
      <Dialog open={sendDialog.open} onClose={() => setSendDialog({ open: false, channel: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Send Results via {sendDialog.channel}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session/Term</InputLabel>
                <Select value={sendForm.session_term} label="Session/Term" onChange={e => setSendForm({ ...sendForm, session_term: e.target.value })}>
                  {dummySessionTerms.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={sendForm.class} label="Class" onChange={e => setSendForm({ ...sendForm, class: e.target.value })}>
                  {dummyClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog({ open: false, channel: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleSend} disabled={!sendForm.session_term || !sendForm.class}>
            Send via {sendDialog.channel}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagingTab;
