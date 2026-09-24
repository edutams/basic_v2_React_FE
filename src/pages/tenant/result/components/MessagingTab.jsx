import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress, TextField,
  Checkbox, ListItemText, LinearProgress, Paper, useTheme, Avatar, IconButton, Tooltip,
  Stack, Divider,
} from '@mui/material';
import {
  IconMail, IconMessage, IconSend, IconTrash, IconMailForward, IconDeviceMobileMessage,
  IconBrandWhatsapp, IconUsers, IconFilter, IconRefresh, IconAlertCircle, IconCircleCheck,
  IconClock, IconUpload, IconDownload,
} from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import { fetchSessionTerms, fetchActiveTenantSessionTerm } from '@/api/tenant/session-term/sessionTermApi';
import StatCard from '@/components/shared/StatCard';

const CHANNELS = {
  Email: {
    key: 'email',
    color: 'primary',
    icon: IconMailForward,
    buttonIcon: <IconMail size={16} />,
    variant: 'contained',
    contactField: 'res_email',
    contactLabel: 'Email address',
    contactPlaceholder: 'parent@email.com',
  },
  SMS: {
    key: 'sms',
    color: 'info',
    icon: IconDeviceMobileMessage,
    buttonIcon: <IconSend size={16} />,
    variant: 'outlined',
    contactField: 'res_msg_phone_number',
    contactLabel: 'Phone number',
    contactPlaceholder: '234…',
  },
  WhatsApp: {
    key: 'whatsapp',
    color: 'success',
    icon: IconBrandWhatsapp,
    buttonIcon: <IconMessage size={16} />,
    variant: 'outlined',
    contactField: 'res_whatsapp_phone_number',
    contactLabel: 'WhatsApp number',
    contactPlaceholder: '234…',
  },
};

const cellHeaderSx = {
  fontWeight: 700,
  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
  borderBottom: '1px solid',
  borderColor: 'divider',
};

const contactValue = (row, channel) => row[CHANNELS[channel]?.contactField] ?? '';

const MessagingTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBorder = {
    borderRadius: '14px',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const [sessionTerms, setSessionTerms] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sendDialog, setSendDialog] = useState({ open: false, channel: '' });
  const [form, setForm] = useState({ sessTermId: '', progId: '', classArmIds: [] });
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [contactEdits, setContactEdits] = useState({});
  const [sending, setSending] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [stats, setStats] = useState({ Email: null, SMS: null, WhatsApp: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const channelKey = (name) => CHANNELS[name]?.key ?? name.toLowerCase();

  const loadBase = useCallback(async () => {
    try {
      const [st, progs, active] = await Promise.all([
        fetchSessionTerms(),
        communicationApi.resultProgrammes(),
        fetchActiveTenantSessionTerm().catch(() => null),
      ]);
      const stRows = st?.data ?? [];
      setSessionTerms(stRows);
      setProgrammes(Array.isArray(progs.data) ? progs.data : []);
      const activeRow = active?.data ?? active?.status ? (active?.data ?? active) : null;
      const activeId = activeRow?.id ?? stRows.find((s) => s.status === 'active')?.id ?? '';
      setForm((f) => ({ ...f, sessTermId: activeId || '' }));
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to load form data', 'error');
    }
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);

  const loadClasses = async (progId) => {
    try {
      const res = await communicationApi.resultClasses(progId);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setClasses([]);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const results = await Promise.all(
        Object.values(CHANNELS).map((c) => communicationApi.resultAnalytic(c.key).catch(() => ({ data: {} }))),
      );
      const next = {};
      Object.keys(CHANNELS).forEach((name, i) => {
        next[name] = results[i].data ?? null;
      });
      setStats(next);
    } catch {
      /* ignore */
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const openDialog = (channel) => {
    setRows([]);
    setSelected([]);
    setContactEdits({});
    setSendDialog({ open: true, channel });
    if (form.progId) loadClasses(form.progId);
  };

  const populate = async () => {
    const { channel } = sendDialog;
    if (!form.sessTermId || !form.progId || !form.classArmIds.length) {
      showSnackbar('Select session-term, programme and class(es)', 'warning');
      return;
    }
    setPopulating(true);
    try {
      const filter = {
        sessTermId: form.sessTermId,
        progId: form.progId,
        classArmId: form.classArmIds.length === 1 ? form.classArmIds[0] : undefined,
        classDescId: form.classArmIds.length === 1 ? form.classArmIds[0] : undefined,
      };
      await communicationApi.resultPopulate(channelKey(channel), filter);
      const res = await communicationApi.resultFetch(channelKey(channel), filter);
      const data = res.data?.data ?? [];
      setRows(data);
      setSelected(data.map((r) => r.res_msg_id));
      const edits = {};
      data.forEach((r) => { edits[r.res_msg_id] = contactValue(r, channel); });
      setContactEdits(edits);
      showSnackbar(`Loaded ${data.length} student(s)`);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.response?.data?.error || 'Failed to load students', 'error');
    } finally {
      setPopulating(false);
    }
  };

  const removeRow = async (row) => {
    const { channel } = sendDialog;
    try {
      await communicationApi.resultDelete(channelKey(channel), { id: row.res_msg_id, reg_id: row.reg_id });
      setRows((r) => r.filter((x) => x.res_msg_id !== row.res_msg_id));
      setSelected((s) => s.filter((id) => id !== row.res_msg_id));
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const saveContact = async (row) => {
    const { channel } = sendDialog;
    const value = contactEdits[row.res_msg_id] ?? '';
    if (value === contactValue(row, channel)) return;
    try {
      if (channel === 'Email') {
        await communicationApi.resultEditEmail({ id: row.res_msg_id, email: value });
      } else {
        await communicationApi.resultUpdatePhone(channelKey(channel), { id: row.res_msg_id, phone: value });
      }
      setRows((rs) => rs.map((r) => (r.res_msg_id === row.res_msg_id
        ? { ...r, [CHANNELS[channel].contactField]: value }
        : r)));
      showSnackbar('Contact updated');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update contact', 'error');
    }
  };

  const send = async () => {
    const { channel } = sendDialog;
    const payloadRows = rows
      .filter((r) => selected.includes(r.res_msg_id))
      .map((r) => ({
        ...r,
        [CHANNELS[channel].contactField]: contactEdits[r.res_msg_id] ?? contactValue(r, channel),
      }));
    if (!payloadRows.length) {
      showSnackbar('No students selected', 'warning');
      return;
    }
    const missing = payloadRows.filter((r) => !contactValue(r, channel) && !(CHANNELS[channel].contactField in r && r[CHANNELS[channel].contactField]));
    if (missing.length) {
      showSnackbar(`${missing.length} selected student(s) are missing a ${CHANNELS[channel].contactLabel}`, 'warning');
      return;
    }
    setSending(true);
    try {
      if (channel === 'Email') {
        await communicationApi.resultSend('email', payloadRows);
        showSnackbar('Emails queued for sending');
      } else if (channel === 'SMS') {
        const phones = payloadRows.filter((r) => r.res_msg_phone_number);
        await communicationApi.resultSend('sms', {
          data: phones,
          remain_unit_balance: 0,
          filter: { sessTermId: form.sessTermId },
        });
        showSnackbar(`SMS queued for ${phones.length} student(s)`);
      } else {
        const res = await communicationApi.resultSend('whatsapp', { data: payloadRows });
        showSnackbar(res.data?.message || 'WhatsApp messages queued');
      }
      loadStats();
      setSendDialog({ open: false, channel: '' });
      setRows([]);
      setSelected([]);
      setContactEdits({});
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.response?.data?.error || 'Send failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleAll = () => {
    setSelected(selected.length === rows.length && rows.length > 0 ? [] : rows.map((r) => r.res_msg_id));
  };

  const toggleRow = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const activeTermCount = (name) => {
    const s = stats[name];
    if (!s) return 0;
    if (name === 'WhatsApp') return s.total_active_sess_term_result_whatsapp ?? s.total_active_sess_term_result_sms ?? 0;
    if (name === 'Email') return s.total_active_sess_term_result_email ?? s.total_active_sess_term_result_sms ?? 0;
    return s.total_active_sess_term_result_sms ?? 0;
  };

  const allTimeCount = (name) => {
    const s = stats[name];
    if (!s) return 0;
    if (name === 'WhatsApp') return s.total_result_whatsapp ?? s.total_result_sms ?? 0;
    if (name === 'Email') return s.total_result_email ?? s.total_result_sms ?? 0;
    return s.total_result_sms ?? 0;
  };

  const filtersReady = Boolean(form.sessTermId && form.progId && form.classArmIds.length);
  const dialogChannel = CHANNELS[sendDialog.channel];
  const allSelected = rows.length > 0 && selected.length === rows.length;
  const someSelected = selected.length > 0 && selected.length < rows.length;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px' }}>
        Send result notifications to students and parents via SMS, Email, or WhatsApp. Choose a channel, load recipients for a class, review the list, then send.
      </Alert>

      {/* ── Stats ─────────────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            count={`${activeTermCount('Email')} / ${allTimeCount('Email')}`}
            label="Emails"
            subtitle="Active term / all-time"
            icon={IconMailForward}
            colorIndex={0}
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            count={`${activeTermCount('SMS')} / ${allTimeCount('SMS')}`}
            label="SMS"
            subtitle="Active term / all-time"
            icon={IconDeviceMobileMessage}
            colorIndex={1}
            loading={statsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            count={`${activeTermCount('WhatsApp')} / ${allTimeCount('WhatsApp')}`}
            label="WhatsApp"
            subtitle="Active term / all-time"
            icon={IconBrandWhatsapp}
            colorIndex={2}
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* ── Filters + Channel readiness (one card) ───── */}
      <Paper elevation={0} sx={{ ...cardBorder, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconFilter size={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={700}>Recipient Filters</Typography>
          <Chip
            size="small"
            label={filtersReady ? 'Ready' : 'Incomplete'}
            color={filtersReady ? 'success' : 'default'}
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
          <Tooltip title="Reload stats">
            <IconButton size="small" onClick={loadStats}><IconRefresh size={16} /></IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session-Term</InputLabel>
                <Select
                  value={form.sessTermId}
                  label="Session-Term"
                  onChange={(e) => setForm((f) => ({ ...f, sessTermId: e.target.value }))}
                >
                  {sessionTerms.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session?.session_name ?? s.display_name ?? s.term_name} — {s.term?.term_name ?? s.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={form.progId}
                  label="Programme"
                  onChange={(e) => {
                    setForm((f) => ({ ...f, progId: e.target.value, classArmIds: [] }));
                    loadClasses(e.target.value);
                  }}
                >
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.programme_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class(es)</InputLabel>
                <Select
                  multiple
                  value={form.classArmIds}
                  label="Class(es)"
                  onChange={(e) => setForm((f) => ({ ...f, classArmIds: e.target.value }))}
                  renderValue={(v) => {
                    const names = classes.filter((c) => v.includes(c.class_arm_id ?? c.cID)).map((c) => c.class_name);
                    return names.length ? names.join(', ') : `${v.length} selected`;
                  }}
                >
                  {classes.map((c) => {
                    const id = c.class_arm_id ?? c.cID;
                    return (
                      <MenuItem key={id} value={id}>
                        <Checkbox checked={form.classArmIds.includes(id)} />
                        <ListItemText primary={c.class_name} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1}>
                {Object.entries(CHANNELS).map(([name, cfg]) => (
                  <Button
                    key={name}
                    fullWidth
                    variant={cfg.variant}
                    size="medium"
                    startIcon={cfg.buttonIcon}
                    onClick={() => openDialog(name)}
                    disabled={!filtersReady}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    {name}
                  </Button>
                ))}
              </Stack>
            </Grid>
          </Grid>
          {!filtersReady && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Select a session-term, programme and at least one class to enable channel buttons.
            </Typography>
          )}
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
          <IconSend size={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={700}>Channel Readiness</Typography>
          <Chip size="small" label={`${Object.keys(CHANNELS).length} channels`} variant="outlined" sx={{ ml: 'auto' }} />
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap', '& .MuiTableCell-root': { py: 1, px: 1.5 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={cellHeaderSx} width="5%">#</TableCell>
                <TableCell sx={cellHeaderSx} width="18%">Channel</TableCell>
                <TableCell sx={cellHeaderSx} width="18%">Active Term</TableCell>
                <TableCell sx={cellHeaderSx} width="18%">All-time</TableCell>
                <TableCell sx={cellHeaderSx} width="26%">Status</TableCell>
                <TableCell sx={cellHeaderSx} width="15%" align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(CHANNELS).map(([name, cfg], i) => {
                const active = activeTermCount(name);
                const total = allTimeCount(name);
                const Icon = cfg.icon;
                return (
                  <TableRow key={name} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32, height: 32, borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)'
                              : cfg.color === 'primary' ? '#DBEAFE'
                                : cfg.color === 'info' ? '#DBEAFE' : '#DCFCE7',
                            color: isDark ? '#fff'
                              : cfg.color === 'success' ? '#16A34A' : '#2563EB',
                          }}
                        >
                          <Icon size={18} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{name}</Typography>
                          <Typography variant="caption" color="text.secondary">Channel {i + 1}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={name}
                        size="small"
                        color={cfg.color}
                        variant="outlined"
                        icon={<cfg.icon size={14} />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">{active}</Typography>
                      <Typography variant="caption" color="text.secondary">queued this term</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{total}</Typography>
                      <Typography variant="caption" color="text.secondary">messages sent</Typography>
                    </TableCell>
                    <TableCell>
                      {statsLoading ? (
                        <CircularProgress size={16} />
                      ) : active > 0 ? (
                        <Chip
                          icon={<IconCircleCheck size={14} />}
                          label={`${active} ready`}
                          size="small"
                          color="success"
                          variant="soft"
                        />
                      ) : (
                        <Chip
                          icon={<IconClock size={14} />}
                          label="No recipients loaded"
                          size="small"
                          color="warning"
                          variant="soft"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        color={cfg.color}
                        startIcon={<Icon size={14} />}
                        onClick={() => openDialog(name)}
                        disabled={!filtersReady}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                      >
                        Send via {name}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Send dialog ───────────────────────────────── */}
      <Dialog
        open={sendDialog.open}
        onClose={() => setSendDialog({ open: false, channel: '' })}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          {dialogChannel && <dialogChannel.icon size={22} />}
          Send Results via {sendDialog.channel}
          {rows.length > 0 && (
            <Chip
              size="small"
              label={`${selected.length} / ${rows.length} selected`}
              color="primary"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '12px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session-Term</InputLabel>
                <Select
                  value={form.sessTermId}
                  label="Session-Term"
                  onChange={(e) => setForm((f) => ({ ...f, sessTermId: e.target.value }))}
                >
                  {sessionTerms.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.session?.session_name ?? s.display_name ?? s.term_name} — {s.term?.term_name ?? s.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select
                  value={form.progId}
                  label="Programme"
                  onChange={(e) => {
                    setForm((f) => ({ ...f, progId: e.target.value, classArmIds: [] }));
                    loadClasses(e.target.value);
                  }}
                >
                  {programmes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.programme_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class(es)</InputLabel>
                <Select
                  multiple
                  value={form.classArmIds}
                  label="Class(es)"
                  onChange={(e) => setForm((f) => ({ ...f, classArmIds: e.target.value }))}
                  renderValue={(v) => {
                    const names = classes.filter((c) => v.includes(c.class_arm_id ?? c.cID)).map((c) => c.class_name);
                    return names.length ? names.join(', ') : `${v.length} selected`;
                  }}
                >
                  {classes.map((c) => {
                    const id = c.class_arm_id ?? c.cID;
                    return (
                      <MenuItem key={id} value={id}>
                        <Checkbox checked={form.classArmIds.includes(id)} />
                        <ListItemText primary={c.class_name} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={populate}
                  disabled={populating || !form.sessTermId || !form.progId || !form.classArmIds.length}
                  startIcon={populating ? <CircularProgress size={14} color="inherit" /> : <IconDownload size={16} />}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                >
                  {populating ? 'Loading students…' : 'Load Students'}
                </Button>
                {rows.length > 0 && (
                  <>
                    <Chip
                      icon={<IconUsers size={14} />}
                      label={`${rows.length} student(s)`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${selected.length} selected`}
                      size="small"
                      color={selected.length ? 'primary' : 'default'}
                      variant="soft"
                    />
                    <Button size="small" onClick={toggleAll} sx={{ textTransform: 'none' }}>
                      {allSelected ? 'Clear selection' : 'Select all'}
                    </Button>
                  </>
                )}
              </Box>
              {populating && <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />}
            </Grid>

            {rows.length > 0 && (
              <Grid size={12}>
                <TableContainer
                  sx={{
                    maxHeight: 360,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px',
                    overflowX: 'auto',
                  }}
                >
                  <Table stickyHeader size="small" sx={{ whiteSpace: 'nowrap', '& .MuiTableCell-root': { py: 0.75, px: 1.25 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={cellHeaderSx}>
                          <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={toggleAll}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={cellHeaderSx}>#</TableCell>
                        <TableCell sx={cellHeaderSx}>Student</TableCell>
                        <TableCell sx={cellHeaderSx}>{dialogChannel?.contactLabel ?? 'Contact'}</TableCell>
                        <TableCell sx={cellHeaderSx}>Reg. No</TableCell>
                        <TableCell sx={cellHeaderSx}>Status</TableCell>
                        <TableCell sx={cellHeaderSx} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r, idx) => {
                        const isSelected = selected.includes(r.res_msg_id);
                        const name = [r.fname, r.mname, r.lname].filter(Boolean).join(' ');
                        const initials = `${(r.fname || '?').charAt(0)}${(r.lname || '').charAt(0)}`.toUpperCase();
                        const status = (r.res_msg_status || 'pending').toLowerCase();
                        return (
                          <TableRow
                            key={r.res_msg_id}
                            hover
                            selected={isSelected}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => toggleRow(r.res_msg_id)}
                          >
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleRow(r.res_msg_id)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">{idx + 1}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 30, height: 30, fontSize: 12, borderRadius: '8px', bgcolor: 'primary.main' }}>
                                  {initials}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>{name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {r.userid || r.user_id || '—'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <TextField
                                size="small"
                                value={contactEdits[r.res_msg_id] ?? ''}
                                placeholder={dialogChannel?.contactPlaceholder}
                                onChange={(e) => setContactEdits((ed) => ({ ...ed, [r.res_msg_id]: e.target.value }))}
                                onBlur={() => saveContact(r)}
                                error={!(contactEdits[r.res_msg_id] ?? '').trim()}
                                helperText={!(contactEdits[r.res_msg_id] ?? '').trim() ? 'Required' : ' '}
                                sx={{ minWidth: 180, '& .MuiFormHelperText-root': { mx: 0, mt: 0, mb: -0.5 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {r.reg_id || r.userid || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={status === 'sent' || status === 'delivered'
                                  ? <IconCircleCheck size={14} />
                                  : status === 'failed'
                                    ? <IconAlertCircle size={14} />
                                    : <IconClock size={14} />}
                                label={status}
                                size="small"
                                color={status === 'sent' || status === 'delivered' ? 'success' : status === 'failed' ? 'error' : 'warning'}
                                variant="soft"
                              />
                            </TableCell>
                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="Remove from list">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeRow(r)}
                                  sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                  <IconTrash size={15} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {rows.length === 0 && !populating && (
              <Grid size={12}>
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '10px' }}>
                  <IconUpload size={44} color={isDark ? '#fff' : '#94a3b8'} style={{ marginBottom: 10 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={600}>
                    No recipients loaded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Pick a session-term, programme and class(es), then click Load Students.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setSendDialog({ open: false, channel: '' })}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={dialogChannel?.color || 'primary'}
            onClick={send}
            disabled={sending || rows.length === 0 || selected.length === 0}
            startIcon={sending ? <CircularProgress size={14} color="inherit" /> : dialogChannel?.buttonIcon}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3 }}
          >
            {sending
              ? 'Sending…'
              : `Send ${selected.length} via ${sendDialog.channel}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagingTab;
