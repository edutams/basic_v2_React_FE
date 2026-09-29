import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, TextField, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Chip, IconButton, InputAdornment, Snackbar, Alert, CircularProgress, useTheme, Divider,
} from '@mui/material';
import { IconSend, IconSearch, IconTrash, IconPaperclip } from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import { useTenantAuth } from '@/hooks/useTenantAuth';

const ChatTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useTenantAuth();
  const border = { border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' };

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const loadUsers = useCallback(async (q = '') => {
    setLoadingUsers(true);
    try {
      const res = await communicationApi.chatUsers(q);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChat = async (u) => {
    setReceiver(u);
    setLoadingMsgs(true);
    try {
      const res = await communicationApi.chatMessages(u.id);
      setMessages(res.data?.message ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const send = async () => {
    if (!draft.trim() || !receiver) return;
    setSending(true);
    try {
      const res = await communicationApi.chatCreate(receiver.id, draft.trim());
      const created = res.data?.message;
      if (created) setMessages((m) => [...m, created]);
      setDraft('');
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to send', 'error');
    } finally {
      setSending(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !receiver) return;
    if (file.size > 2 * 1024 * 1024) {
      showSnack('File too large (max 2MB)', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await communicationApi.chatFile(reader.result, receiver.id);
        const created = res.data?.message;
        if (created) setMessages((m) => [...m, created]);
      } catch (err) {
        showSnack(err.response?.data?.error || 'File type not supported', 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeMsg = async (id) => {
    try {
      await communicationApi.chatDelete(id);
      setMessages((m) => m.filter((x) => x.id !== id));
    } catch (err) {
      showSnack(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const currentUserId = user?.id ?? user?.user_id;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 1.5, ...border }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); loadUsers(e.target.value); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
              }}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">Users</Typography>
            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
            ) : (
              <List dense sx={{ maxHeight: 420, overflowY: 'auto' }}>
                {users.map((u) => (
                  <ListItem
                    key={u.id}
                    button
                    selected={receiver?.id === u.id}
                    onClick={() => openChat(u)}
                    sx={{ borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar src={u.avatar ? undefined : undefined} sx={{ width: 32, height: 32 }}>
                        {(u.fname || '?').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={[u.fname, u.lname].filter(Boolean).join(' ')}
                      secondary={u.user_id || u.phone || u.email}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItem>
                ))}
                {!loadingUsers && users.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No users found.</Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 0, display: 'flex', flexDirection: 'column', height: 480, ...border }}>
            {receiver ? (
              <>
                <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 30, height: 30 }}>{(receiver.fname || '?').charAt(0).toUpperCase()}</Avatar>
                  <Typography fontWeight={700}>{[receiver.fname, receiver.lname].filter(Boolean).join(' ')}</Typography>
                  <Chip size="small" label={receiver.user_id || receiver.phone || ''} variant="outlined" />
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {loadingMsgs ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                  ) : messages.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>No messages yet. Say hello!</Typography>
                  ) : (
                    messages.map((m) => {
                      const mine = Number(m.from) === Number(currentUserId) || m.from === currentUserId;
                      return (
                        <Box
                          key={m.id}
                          sx={{
                            alignSelf: mine ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            px: 1.5, py: 1, borderRadius: '12px',
                            bgcolor: mine ? 'primary.main' : isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                            color: mine ? 'primary.contrastText' : 'text.primary',
                            position: 'relative',
                          }}
                        >
                          {m.message?.includes('<') ? (
                            <Box dangerouslySetInnerHTML={{ __html: m.message }} sx={{ img: { maxWidth: '100%', borderRadius: 1 } }} />
                          ) : (
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.message}</Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>{m.created_at}</Typography>
                            <IconButton size="small" onClick={() => removeMsg(m.id)} sx={{ p: 0.25, color: 'inherit', opacity: 0.7 }}>
                              <IconTrash size={12} />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </Box>
                <Divider />
                <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                  <input type="file" hidden ref={fileRef} accept="image/*,application/pdf,video/*" onChange={onFile} />
                  <IconButton onClick={() => fileRef.current?.click()} size="small"><IconPaperclip size={18} /></IconButton>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  />
                  <IconButton color="primary" onClick={send} disabled={sending || !draft.trim()}>
                    {sending ? <CircularProgress size={18} /> : <IconSend size={18} />}
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                Select a user to start chatting
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatTab;
