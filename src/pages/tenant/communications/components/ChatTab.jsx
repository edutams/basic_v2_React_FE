import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, TextField, List, ListItemAvatar, ListItemText, ListItemButton,
  Avatar, Chip, IconButton, InputAdornment, Snackbar, Alert, CircularProgress, useTheme, Divider, Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconSend, IconSearch, IconTrash, IconPaperclip, IconPencilPlus, IconCornerUpLeft, IconX, IconChecks } from '@tabler/icons-react';
import communicationApi from '@/api/tenant/communication/communicationApi';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { getEcho, leaveChannel } from '@/utils/echo';

const stripHtml = (s = '') => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || 'Attachment';

// Ids are UUIDs in most tenants but historically numeric in some — compare
// both ways so `mine` and read receipts agree on which bubbles are ours.
const sameId = (a, b) => a === b || Number(a) === Number(b);

// Laravel errors return `message`, our endpoints return `error` — surface
// whichever is present instead of always blaming the file type.
const apiError = (err, fallback) =>
  err?.response?.data?.error || err?.response?.data?.message || fallback;

const ChatTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useTenantAuth();
  const border = { border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: '10px' };
  const currentUserId = user?.id ?? user?.user_id;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState(null);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // showAllUsers toggles between "conversations" (default — only users the
  // caller has chatted with) and the full directory for starting new chats.
  const loadUsers = useCallback(async (q = '', showAllUsers = false) => {
    setLoadingUsers(true);
    try {
      const res = await communicationApi.chatUsers(q, showAllUsers);
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
    setReplyTo(null);
    setChannel(null);
    setLoadingMsgs(true);
    try {
      const res = await communicationApi.chatMessages(u.id);
      setMessages(res.data?.message ?? []);
      setChannel(res.data?.channel ?? null);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Realtime: the API hands back the conversation's channel name, so a message
  // sent by the other side lands here without reloading the chat. Echo appends
  // our own sends too — hence the id de-duplication. The same channel carries
  // read receipts, which is what turns our double check green.
  useEffect(() => {
    if (!channel) return undefined;

    const echo = getEcho();
    if (!echo) return undefined;

    echo
      .channel(channel)
      .listen('.App\\Events\\ChatEvent', ({ message }) => {
        if (!message?.id) return;
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        // The chat is on screen, so acknowledge it now — getMessages() only
        // marks read when the conversation is (re)opened, which would leave
        // the sender's tick grey until they refreshed.
        if (message.from && !sameId(message.from, currentUserId)) {
          communicationApi.chatMarkRead([message.id], message.from).catch(() => {});
        }
      })
      .listen('.App\\Events\\ChatReadEvent', ({ ids }) => {
        if (!Array.isArray(ids) || ids.length === 0) return;
        setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, is_read: 1 } : m)));
      });

    return () => leaveChannel(channel);
  }, [channel, currentUserId]);

  const send = async () => {
    if (!draft.trim() || !receiver) return;
    setSending(true);
    try {
      const res = await communicationApi.chatCreate(receiver.id, draft.trim(), replyTo?.id);
      const created = res.data?.message;
      if (created) setMessages((m) => [...m, created]);
      setDraft('');
      setReplyTo(null);
    } catch (err) {
      showSnack(apiError(err, 'Failed to send'), 'error');
    } finally {
      setSending(false);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !receiver) return;
    // Matches the backend's 5MB decoded cap (and stays under post_max_size=8M,
    // which base64 inflates by ~33%).
    if (file.size > 5 * 1024 * 1024) {
      showSnack('File too large (max 5MB)', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await communicationApi.chatFile(reader.result, receiver.id, replyTo?.id);
        const created = res.data?.message;
        if (created) setMessages((m) => [...m, created]);
        setReplyTo(null);
      } catch (err) {
        showSnack(apiError(err, 'Attachment failed to upload'), 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startReply = (m) => setReplyTo(m);

  const jumpTo = (id) =>
    document.getElementById(`chat-msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const quotedSender = (m) =>
    Number(m.from) === Number(currentUserId)
      ? 'You'
      : [m.userFrom?.fname, m.userFrom?.lname].filter(Boolean).join(' ') || 'Unknown';

  const removeMsg = async (id) => {
    try {
      await communicationApi.chatDelete(id);
      setMessages((m) => m.filter((x) => x.id !== id));
    } catch (err) {
      showSnack(apiError(err, 'Delete failed'), 'error');
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 1.5, ...border }}>
            <TextField
              fullWidth
              size="small"
              placeholder={showAllUsers ? 'Search all users…' : 'Search conversations…'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); loadUsers(e.target.value, showAllUsers); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
              }}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {showAllUsers ? 'All users' : 'Conversations'}
              </Typography>
              <Button
                size="small"
                startIcon={<IconPencilPlus size={14} />}
                onClick={() => {
                  const next = !showAllUsers;
                  setShowAllUsers(next);
                  loadUsers(search, next);
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                {showAllUsers ? 'Back to chats' : 'New chat'}
              </Button>
            </Box>
            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
            ) : (
              <List dense sx={{ maxHeight: 420, overflowY: 'auto' }}>
                {users.map((u) => (
                  <ListItemButton
                    key={u.id}
                    selected={receiver?.id === u.id}
                    onClick={() => openChat(u)}
                    sx={{
                      borderRadius: '8px',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) },
                      '&.Mui-selected': {
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
                        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.3) },
                      },
                    }}
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
                  </ListItemButton>
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
                      const mine = sameId(m.from, currentUserId);
                      const quoted = m.replyTo;
                      return (
                        <Box
                          key={m.id}
                          id={`chat-msg-${m.id}`}
                          sx={{
                            alignSelf: mine ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: mine ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              px: 1.5, py: 1, borderRadius: '12px',
                              bgcolor: mine ? 'primary.main' : isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                              color: mine ? 'primary.contrastText' : 'text.primary',
                              overflow: 'hidden',
                            }}
                          >
                            {quoted && (
                              <Box
                                onClick={() => jumpTo(quoted.id)}
                                title="Jump to original message"
                                sx={{
                                  mb: 0.75, px: 1, py: 0.5, cursor: 'pointer',
                                  borderLeft: 3,
                                  borderColor: mine ? 'primary.contrastText' : 'primary.main',
                                  bgcolor: mine ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                                  borderRadius: '6px',
                                }}
                              >
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: 10, opacity: 0.9 }}>
                                  {quotedSender(quoted)}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', fontSize: 11, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {stripHtml(quoted.message)}
                                </Typography>
                              </Box>
                            )}
                            {m.message?.includes('<') ? (
                              <Box dangerouslySetInnerHTML={{ __html: m.message }} sx={{ img: { maxWidth: '100%', borderRadius: 1 } }} />
                            ) : (
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.message}</Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25, px: 0.5, color: 'text.secondary' }}>
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>{m.created_at}</Typography>
                            <IconButton size="small" title="Reply" onClick={() => startReply(m)} sx={{ p: 0.25 }}>
                              <IconCornerUpLeft size={12} />
                            </IconButton>
                            <IconButton size="small" title="Delete" onClick={() => removeMsg(m.id)} sx={{ p: 0.25 }}>
                              <IconTrash size={12} />
                            </IconButton>
                            {mine && (
                              <Box
                                component="span"
                                title={Number(m.is_read) === 1 ? 'Read' : 'Delivered'}
                                sx={{ display: 'inline-flex', alignItems: 'center', px: 0.25 }}
                              >
                                <IconChecks
                                  size={14}
                                  strokeWidth={2.4}
                                  color={Number(m.is_read) === 1 ? (isDark ? '#4ADE80' : '#16A34A') : 'currentColor'}
                                  style={{ opacity: Number(m.is_read) === 1 ? 1 : 0.55 }}
                                />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </Box>
                <Divider />
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {replyTo && (
                    <Box
                      onClick={() => jumpTo(replyTo.id)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 1, cursor: 'pointer',
                        borderLeft: 3, borderColor: 'primary.main', borderRadius: '8px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="primary" fontWeight={700} sx={{ display: 'block' }}>
                          {Number(replyTo.from) === Number(currentUserId)
                            ? 'Replying to your message'
                            : `Replying to ${quotedSender(replyTo)}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {stripHtml(replyTo.message)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        title="Cancel reply"
                        onClick={(e) => { e.stopPropagation(); setReplyTo(null); }}
                        sx={{ p: 0.25 }}
                      >
                        <IconX size={14} />
                      </IconButton>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <input type="file" hidden ref={fileRef} accept="image/*,application/pdf,video/*" onChange={onFile} />
                    <IconButton onClick={() => fileRef.current?.click()} size="small"><IconPaperclip size={18} /></IconButton>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={replyTo ? 'Type a reply…' : 'Type a message…'}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                        if (e.key === 'Escape') setReplyTo(null);
                      }}
                    />
                    <IconButton color="primary" onClick={send} disabled={sending || !draft.trim()}>
                      {sending ? <CircularProgress size={18} /> : <IconSend size={18} />}
                    </IconButton>
                  </Box>
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
