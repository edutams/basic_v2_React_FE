import { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Button, TextField, List, ListItem, ListItemText,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  CircularProgress, useTheme, Pagination, MenuItem, FormControl, InputLabel, Select,
  Divider, Stack, InputAdornment, Paper as PaperSurface,
} from '@mui/material';
import { IconInbox, IconSend, IconArchive, IconPencil, IconTrash, IconEye, IconArrowLeft, IconMail, IconMailForward, IconMailOpened, IconSearch, IconUsers, IconWand } from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import { usePermissions } from '@/context/TenantContext/permissions';
import StatCard from '@/components/shared/StatCard';

const emptyCompose = { subject: '', message: '', receivers: [] };
const emptyFilters = { userType: '', recipient: '', userCategory: '', userClass: '', search: '' };

const fullNameOf = (u) => u.fullname || [u.fname, u.mname, u.lname].filter(Boolean).join(' ') || u.email || String(u.id);

const normalizeUser = (u) => ({
  ...u,
  fullname: fullNameOf(u),
  userId: u.user_id || u.phone || '',
});

const MailTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { can } = usePermissions();
  const border = { border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' };

  const [view, setView] = useState('inbox');
  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ all: 0, term_message: 0, received: 0 });
  const [unread, setUnread] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState(emptyCompose);
  const [filters, setFilters] = useState(emptyFilters);
  const [classes, setClasses] = useState([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const emptyEmails = compose.receivers.filter((r) => !r.email);

  const loadClasses = useCallback(async () => {
    if (classesLoaded) return;
    try {
      const res = await communicationApi.smsClasses();
      const rows = Array.isArray(res.data) ? res.data : [];
      setClasses(rows);
      setClassesLoaded(true);
    } catch {
      /* ignore */
    }
  }, [classesLoaded]);

  useEffect(() => {
    if (composeOpen) loadClasses();
  }, [composeOpen, loadClasses]);

  const loadStats = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([communicationApi.mailStatistics(), communicationApi.mailUnreadCount()]);
      setStats(s.data?.data ?? s.data ?? {});
      setUnread(u.data?.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const loadList = useCallback(async (v = view, p = page) => {
    setLoading(true);
    try {
      const call = v === 'sent' ? communicationApi.mailSent : v === 'archive' ? communicationApi.mailArchive : communicationApi.mailInbox;
      const res = await call(p);
      const data = res.data ?? {};
      setList((data.data ?? []).map((row) => ({
        ...row,
        fullname: row.fullname ?? [row.fname, row.mname, row.lname].filter(Boolean).join(' '),
        userId: row.user_id ?? row.sender_user_id,
      })));
      setTotalPages(Math.max(1, data.last_page ?? 1));
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [view, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);

  const openView = async (row) => {
    try {
      const call = view === 'sent' ? communicationApi.mailViewSent : view === 'archive' ? communicationApi.mailViewArchive : communicationApi.mailViewInbox;
      const res = await call(row.id);
      const rows = Array.isArray(res.data) ? res.data : res.data?.data ?? [res.data];
      const m = rows[0] ?? row;
      setDetail({
        ...m,
        fullname: m.fullname ?? [m.fname, m.mname, m.lname].filter(Boolean).join(' '),
      });
      if (view === 'inbox') loadStats();
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to open message', 'error');
    }
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setSearchResults([]);
    setCompose((c) => ({ ...c, receivers: [] }));
  };

  const addReceivers = (users) => {
    const incoming = users.map(normalizeUser);
    const existing = new Set(compose.receivers.map((r) => r.id));
    const added = incoming.filter((u) => !existing.has(u.id));
    if (added.length < incoming.length) showSnack('Some users were already added', 'info');
    if (!added.length) return;
    setCompose((c) => ({ ...c, receivers: [...c.receivers, ...added] }));
    showSnack(`Added ${added.length} recipient${added.length === 1 ? '' : 's'}`);
  };

  const removeReceiver = (id) => {
    setCompose((c) => ({ ...c, receivers: c.receivers.filter((r) => r.id !== id) }));
  };

  const removeEmptyEmails = () => {
    setCompose((c) => ({ ...c, receivers: c.receivers.filter((r) => r.email) }));
    showSnack('Removed recipients without email', 'info');
  };

  const generateUsers = async () => {
    if (!filters.userType || !filters.recipient) {
      showSnack('Select User Type and User Group first', 'warning');
      return;
    }
    if (filters.userType === 'staff' && filters.recipient === 'group' && !filters.userCategory) {
      showSnack('Select Category for staff groups', 'warning');
      return;
    }
    if (
      filters.recipient === 'group'
      && (filters.userType === 'parent' || filters.userType === 'student' || filters.userCategory === 'teaching')
      && !filters.userClass
    ) {
      showSnack('Select a Class', 'warning');
      return;
    }
    setGenerating(true);
    try {
      const res = await communicationApi.smsUsers({ filters });
      const rows = Array.isArray(res.data) ? res.data : [];
      if (!rows.length) {
        showSnack('No users matched these filters', 'info');
        return;
      }
      addReceivers(rows);
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to fetch users', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSearch = async (term) => {
    const q = (term ?? filters.search).trim();
    if (!q || filters.recipient !== 'individual' || !filters.userType) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await communicationApi.smsUserSearch({ filters: { ...filters, search: q } });
      const rows = Array.isArray(res.data) ? res.data : [];
      setSearchResults(rows.map(normalizeUser));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const pickSearchResult = (user) => {
    addReceivers([user]);
    setFilters((f) => ({ ...f, search: '' }));
    setSearchResults([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      if (key === 'userType') {
        next.recipient = '';
        next.userCategory = '';
        next.userClass = '';
        next.search = '';
      }
      if (key === 'recipient') {
        next.userCategory = '';
        next.userClass = '';
        next.search = '';
      }
      return next;
    });
    setSearchResults([]);
  };

  const handleSend = async () => {
    if (!compose.receivers.length || !compose.subject.trim()) {
      showSnack('Subject and at least one receiver are required', 'warning');
      return;
    }
    try {
      await communicationApi.mailSave({
        subject: compose.subject,
        message: compose.message,
        receivers: compose.receivers,
      });
      showSnack('Mail sent successfully');
      closeCompose();
      loadStats();
      if (view === 'sent') loadList('sent', 1);
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to send mail', 'error');
    }
  };

  const closeCompose = () => {
    setComposeOpen(false);
    setCompose(emptyCompose);
    setFilters(emptyFilters);
    setSearchResults([]);
  };

  const runAction = async (action, id) => {
    try {
      await action(id);
      setDetail(null);
      loadList();
      loadStats();
      showSnack('Done');
    } catch (err) {
      showSnack(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const navItems = [
    { key: 'inbox', label: 'Inbox', icon: <IconInbox size={16} />, badge: unread },
    { key: 'sent', label: 'Sent Items', icon: <IconSend size={16} /> },
    { key: 'archive', label: 'Archived', icon: <IconArchive size={16} /> },
  ];

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={stats.all ?? 0} label="Total Messages" subtitle="All mail in your mailbox" icon={IconMail} colorIndex={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={stats.term_message ?? 0} label="This Term" subtitle="Messages this academic term" icon={IconMailForward} colorIndex={1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard count={stats.received ?? 0} label="Received" subtitle="Inbox messages received" icon={IconMailOpened} colorIndex={2} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} sx={{ p: 1.5, ...border }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<IconPencil size={16} />}
              onClick={() => setComposeOpen(true)}
              disabled={!can('messaging.create_mail')}
              sx={{ mb: 1.5, textTransform: 'none', fontWeight: 600 }}
            >
              Write New Email
            </Button>
            <List dense>
              {navItems.map((n) => (
                <ListItem
                  key={n.key}
                  button
                  selected={view === n.key && !detail}
                  onClick={() => { setView(n.key); setDetail(null); setPage(1); }}
                  sx={{ borderRadius: '8px', cursor: 'pointer' }}
                >
                  {n.icon}
                  <ListItemText primary={n.label} sx={{ ml: 1 }} />
                  {n.badge > 0 && <Chip size="small" color="primary" label={n.badge} />}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Paper elevation={0} sx={{ p: 2, minHeight: 360, ...border }}>
            {detail ? (
              <Box>
                <Button startIcon={<IconArrowLeft size={16} />} onClick={() => setDetail(null)} sx={{ mb: 1.5, textTransform: 'none' }}>
                  Back
                </Button>
                <Typography variant="h6" fontWeight={700}>{detail.subject}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  From: {detail.fullname || detail.email || '—'} · {detail.created_at}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', my: 2 }}>{detail.message}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {view === 'inbox' && can('messaging.archive_mail') && (
                    <Button size="small" variant="outlined" onClick={() => runAction(communicationApi.mailArchiveInbox, detail.id)}>Archive</Button>
                  )}
                  {view === 'sent' && (
                    <Button size="small" variant="outlined" onClick={() => runAction(communicationApi.mailArchiveSent, detail.id)}>Archive</Button>
                  )}
                  {view === 'archive' && (
                    <Button size="small" variant="outlined" onClick={() => runAction(communicationApi.mailRestoreArchive, detail.id)}>Restore</Button>
                  )}
                  {can('messaging.delete_mail') && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<IconTrash size={14} />}
                      onClick={() => runAction(
                        view === 'inbox' ? communicationApi.mailDeleteInbox
                          : view === 'sent' ? communicationApi.mailDeleteSent
                            : communicationApi.mailDeleteArchive,
                        detail.id,
                      )}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, textTransform: 'capitalize' }}>{view}</Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
                ) : list.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No messages.</Typography>
                ) : (
                  <List>
                    {list.map((row) => (
                      <ListItem
                        key={row.id}
                        button
                        onClick={() => openView(row)}
                        sx={{ borderRadius: '8px', cursor: 'pointer', mb: 0.5, border: '1px solid', borderColor: 'divider' }}
                        secondaryAction={<IconEye size={16} />}
                      >
                        <ListItemText
                          primary={<Typography fontWeight={row.is_read ? 400 : 700}>{row.subject}</Typography>}
                          secondary={`${row.fullname || row.email || '—'} · ${row.created_at}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {totalPages > 1 && (
                  <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} sx={{ mt: 1, display: 'flex', justifyContent: 'center' }} />
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={composeOpen} onClose={closeCompose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Compose Mail</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.6 }}>
                Recipients
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="mail-user-type-label">User Type</InputLabel>
                    <Select
                      labelId="mail-user-type-label"
                      label="User Type"
                      value={filters.userType}
                      onChange={(e) => handleFilterChange('userType', e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      <MenuItem value="parent">Parent</MenuItem>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {filters.userType && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="mail-user-group-label">User Group</InputLabel>
                      <Select
                        labelId="mail-user-group-label"
                        label="User Group"
                        value={filters.recipient}
                        onChange={(e) => handleFilterChange('recipient', e.target.value)}
                      >
                        <MenuItem value="">-- Select --</MenuItem>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="individual">Individual</MenuItem>
                        <MenuItem value="group">Group</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {filters.userType === 'staff' && filters.recipient === 'group' && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="mail-category-label">Category</InputLabel>
                      <Select
                        labelId="mail-category-label"
                        label="Category"
                        value={filters.userCategory}
                        onChange={(e) => handleFilterChange('userCategory', e.target.value)}
                      >
                        <MenuItem value="">-- Select --</MenuItem>
                        <MenuItem value="teaching">Teaching</MenuItem>
                        <MenuItem value="non-teaching">Non-Teaching</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {filters.recipient === 'group'
                  && (filters.userType === 'parent' || filters.userType === 'student' || filters.userCategory === 'teaching') && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="mail-class-label">Class</InputLabel>
                      <Select
                        labelId="mail-class-label"
                        label="Class"
                        value={filters.userClass}
                        onChange={(e) => handleFilterChange('userClass', e.target.value)}
                      >
                        <MenuItem value="">-- Select --</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.class_arm_id} value={cls.class_arm_id}>
                            {cls.class_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {filters.recipient === 'individual' && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Search"
                      placeholder="name, user ID or phone..."
                      value={filters.search}
                      onChange={(e) => {
                        handleFilterChange('search', e.target.value);
                        handleSearch(e.target.value);
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {searching ? <CircularProgress size={14} /> : <IconSearch size={16} />}
                          </InputAdornment>
                        ),
                      }}
                    />
                    {searchResults.length > 0 && (
                      <PaperSurface
                        elevation={6}
                        sx={{
                          mt: 0.5, maxHeight: 200, overflowY: 'auto', borderRadius: '10px', zIndex: 10, position: 'relative',
                        }}
                      >
                        <List dense disablePadding>
                          {searchResults.map((u) => (
                            <ListItem
                              key={u.id}
                              button
                              onClick={() => pickSearchResult(u)}
                              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                              <ListItemText
                                primary={u.fullname}
                                secondary={u.userId || u.email}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                                secondaryTypographyProps={{ fontSize: 12 }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </PaperSurface>
                    )}
                  </Grid>
                )}

                {(filters.recipient === 'all' || filters.recipient === 'group') && (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={generating ? <CircularProgress size={14} color="inherit" /> : <IconWand size={16} />}
                      onClick={generateUsers}
                      disabled={generating}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', minHeight: 40 }}
                    >
                      Generate
                    </Button>
                  </Grid>
                )}

                {filters.userType && (
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={resetFilters} sx={{ textTransform: 'none' }}>
                      Reset filters
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <IconUsers size={16} />
                  Selected recipients
                  <Chip size="small" label={compose.receivers.length} color="primary" variant="soft" />
                </Typography>
                {emptyEmails.length > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="error" fontWeight={700}>
                      {emptyEmails.length} user(s) with no email
                    </Typography>
                    <Button size="small" color="error" onClick={removeEmptyEmails} sx={{ textTransform: 'none', py: 0 }}>
                      Remove
                    </Button>
                  </Stack>
                )}
              </Stack>

              {!compose.receivers.length ? (
                <Box
                  sx={{
                    border: '1px dashed', borderColor: 'divider', borderRadius: '12px', py: 3, textAlign: 'center', bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No recipients yet. Use the filters above or search for individuals.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.5, maxHeight: 220, overflowY: 'auto',
                    border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'action.hover',
                  }}
                >
                  {compose.receivers.map((r) => (
                    <Chip
                      key={r.id}
                      label={r.email || `${r.fullname} (no email)`}
                      onDelete={() => removeReceiver(r.id)}
                      color={r.email ? 'primary' : 'default'}
                      variant={r.email ? 'soft' : 'outlined'}
                      sx={{ fontWeight: 600, maxWidth: 280 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Divider />

            <TextField
              fullWidth
              size="small"
              label="Subject"
              value={compose.subject}
              onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Message"
              value={compose.message}
              onChange={(e) => setCompose((c) => ({ ...c, message: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={closeCompose} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<IconSend size={16} />}
            onClick={handleSend}
            disabled={!compose.receivers.length || !compose.subject.trim()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MailTab;
