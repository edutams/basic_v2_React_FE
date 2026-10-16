import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconFileUpload, IconRefresh, IconSend, IconTrash, IconUpload } from '@tabler/icons-react';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import useNotification from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import { tenantForumApi } from '@/api/tenant/e-resources/browseApi';
import tenantApi, { getApiBaseURL } from '@/api/tenant/tenant_api';

export const FORUM_SCOPE = 'lessonNote';

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read the selected file'));
    reader.readAsDataURL(file);
  });

export const aiErrorMessage = (err, fallback = 'The AI service could not be reached. Please try again shortly.') => {
  const status = err?.response?.status;
  if (status === 503) return fallback;
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (status === 404 ? 'Scheme of work not found.' : fallback)
  );
};

export const apiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || err?.response?.data?.error || fallback;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderInlineMarkdown = (text) => {
  let html = escapeHtml(text);
  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    '<img src="$2" alt="$1" width="100%" />',
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/`([^`]+)`/g, '$1');
  return html;
};

export const markdownToHtml = (markdown) => {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let listType = null;
  let codeBlock = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  lines.forEach((line) => {
    if (/^\s*```/.test(line)) {
      if (codeBlock === null) {
        closeList();
        codeBlock = [];
        out.push('<pre>');
      } else {
        out.push(escapeHtml(codeBlock.join('\n')));
        out.push('</pre>');
        codeBlock = null;
      }
      return;
    }
    if (codeBlock !== null) {
      codeBlock.push(line);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length + 2, 6);
      out.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      closeList();
      out.push('<hr />');
      return;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeList();
      out.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      return;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.*)$/);
    if (unordered) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      out.push(`<li>${renderInlineMarkdown(unordered[1])}</li>`);
      return;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      out.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
      return;
    }

    closeList();
    out.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  if (codeBlock !== null) {
    out.push(escapeHtml(codeBlock.join('\n')));
    out.push('</pre>');
  }
  closeList();
  return out.join('');
};

export const looksLikeHtml = (content) => /<\/?[a-z][^>]*>/i.test(String(content || ''));

export const richContentToHtml = (content) => {
  if (!content) return '';
  const text = String(content).trim();
  if (!text) return '';
  const html = looksLikeHtml(text) ? text : markdownToHtml(text);
  return sanitizeHtml(html);
};

export const isDocumentLink = (content) => {
  const text = String(content || '').trim();
  if (!text || /^data:/i.test(text)) return false;
  const hasOrigin = /^https?:\/\//i.test(text) || text.startsWith('/');
  return hasOrigin && /\.(docx?|pdf|pptx?|xlsx?)($|\?)/i.test(text);
};

export const toAbsoluteUrl = (path) => {
  const text = String(path || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `${window.location.origin}/${text.replace(/^\/+/, '')}`;
};

// Map a tenant_asset() URL (…/asset?path=lessons/123.docx) onto the
// authenticated tenant-API file endpoint. Raw asset URLs are cross-origin
// (different hosts in dev and prod), so browser fetch() is blocked by CORS —
// going through the API reuses the app's Bearer auth + CORS setup instead.
export const lessonFileApiPath = (url) => {
  const text = String(url || '').trim();
  if (!text) return '';
  try {
    const parsed = new URL(text, window.location.origin);
    // stancl tenancy asset URLs look like /tenancy/assets/lessons/123.docx;
    // some deployments use ?path=lessons/123.docx instead.
    const path = (parsed.searchParams.get('path') || parsed.pathname)
      .replace(/^\/+/, '')
      .replace(/^tenancy\/assets\//, '')
      .replace(/^storage\//, '');
    if (path.startsWith('lessons/')) {
      return `/e-resources/lesson-note/file?path=${encodeURIComponent(path)}`;
    }
  } catch {
    /* not parseable — fall through */
  }
  return '';
};

export const getYouTubeId = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  const match = text.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?\s]+)/);
  if (match) return match[1];
  if (/^[\w-]{6,}$/.test(text)) return text;
  return null;
};

export const firstFileUrl = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) return payload[0] ?? null;
  const values = Object.values(payload).find((value) => Array.isArray(value));
  return values && values.length ? values[0] : null;
};

export const RichContentView = ({ content, emptyMessage = 'No content has been added yet.' }) => {
  const html = useMemo(() => richContentToHtml(content), [content]);

  if (!content) {
    return (
      <Alert severity="info" sx={{ width: '100%' }}>
        {emptyMessage}
      </Alert>
    );
  }

  if (isDocumentLink(content)) {
    return <DocxPreview url={content} />;
  }

  return (
    <Box
      className="rich-lesson-content"
      sx={{
        '& h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1, fontWeight: 700 },
        '& p': { my: 1, lineHeight: 1.7 },
        '& ul, & ol': { pl: 3, my: 1 },
        '& li': { mb: 0.5 },
        '& blockquote': {
          my: 1.5,
          pl: 2,
          borderLeft: 4,
          borderColor: 'divider',
          color: 'text.secondary',
        },
        '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
        '& a': { color: 'primary.main' },
        '& hr': { my: 2, border: 0, borderTop: '1px solid', borderColor: 'divider' },
        typography: 'body2',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Inline document preview — React counterpart of the Vue app's VueDocPreview
// (vue-doc-preview) used in LessonPlanIndexx / LessonNoteIndexx.
// Uploaded .docx files render in place via docx-preview; PDFs embed inline.
// Files are fetched through the tenant API (Bearer auth + CORS) rather than
// the raw tenant_asset() URL, which browsers block as a cross-origin fetch.
// ─────────────────────────────────────────────────────────────────────────────
export const DocxPreview = ({ url, height = 480 }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const absoluteUrl = url ? toAbsoluteUrl(url) : '';
  const apiPath = url ? lessonFileApiPath(url) : '';
  const isPdf = /\.pdf($|\?)/i.test(String(url || ''));
  const pdfSrc = apiPath ? `${getApiBaseURL()}${apiPath}` : absoluteUrl;

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!url || !el || isPdf) return undefined;

    setLoading(true);
    setFailed(false);

    (async () => {
      try {
        let buffer;
        if (apiPath) {
          const res = await tenantApi.get(apiPath, { responseType: 'arraybuffer' });
          buffer = res.data;
        } else {
          const res = await fetch(absoluteUrl, { credentials: 'same-origin' });
          if (!res.ok) throw new Error('Unable to download the document');
          buffer = await res.arrayBuffer();
        }
        if (cancelled) return;
        const { renderAsync } = await import('docx-preview');
        if (cancelled || !containerRef.current) return;
        await renderAsync(buffer, containerRef.current, undefined, {
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
        });
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (el) el.innerHTML = '';
    };
  }, [url, apiPath, absoluteUrl, isPdf]);

  if (!url) return null;

  // PDFs render directly in an embedded frame.
  if (isPdf) {
    return (
      <Box
        component="iframe"
        title="document-preview"
        src={pdfSrc}
        sx={{ width: '100%', height, border: 1, borderColor: 'divider', borderRadius: 1 }}
      />
    );
  }

  if (failed) {
    return (
      <Alert severity="warning" sx={{ width: '100%', borderRadius: 1 }}>
        The document preview could not be loaded.
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Loading document preview…
          </Typography>
        </Stack>
      )}
      <Box
        ref={containerRef}
        className="docx-preview-container"
        sx={{
          maxHeight: height,
          overflowY: 'auto',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          '& .docx-wrapper': { bgcolor: 'transparent', p: 2 },
          '& iframe': { width: '100%', minHeight: height, border: 0 },
        }}
      />
    </Box>
  );
};

const parseChatMessage = (raw) => {
  if (!raw) return { text: '', media: '' };
  if (typeof raw === 'object') return { text: raw.text ?? '', media: raw.media ?? '' };
  try {
    const parsed = JSON.parse(raw);
    return { text: parsed?.text ?? '', media: parsed?.media ?? '' };
  } catch {
    return { text: String(raw), media: '' };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// File-upload modal — replicates basic's AddLessonPlan / AddLessonNote /
// AddVideo modals: pick a file, read it as a base64 data URL, hand it to the
// parent's upload handler. Used for "Create from scratch" / "Re-upload".
// ─────────────────────────────────────────────────────────────────────────────
export const LessonUploadModal = ({
  open,
  onClose,
  title = 'Upload file',
  subtitle = '',
  accept = '.doc,.docx',
  uploadLabel = 'file',
  maxMB = 10,
  onUpload,
}) => {
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError('');
      setBusy(false);
    }
  }, [open]);

  const handlePick = (e) => {
    setFile(e.target.files?.[0] ?? null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError(`Choose a ${uploadLabel} before uploading.`);
      return;
    }
    if (maxMB && file.size > maxMB * 1024 * 1024) {
      setError(`The selected ${uploadLabel} is larger than ${maxMB} MB. Please choose a smaller file.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await onUpload(dataUrl);
      setFile(null);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, `Unable to upload the ${uploadLabel}. Please try again.`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}>
            <IconFileUpload size={20} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            display: 'block',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: '12px',
            p: 3,
            mt: 1,
            textAlign: 'center',
            cursor: busy ? 'not-allowed' : 'pointer',
            bgcolor: 'action.hover',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#14B8A6', bgcolor: 'rgba(20,184,166,0.06)' },
          }}
        >
          <input
            id={inputId}
            hidden
            type="file"
            accept={accept}
            disabled={busy}
            onChange={handlePick}
          />
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(20,184,166,0.12)', color: '#14B8A6', mx: 'auto', mb: 1.5 }}>
            <IconUpload size={24} />
          </Avatar>
          {file ? (
            <>
              <Typography variant="body2" fontWeight={700} color="#14B8A6">
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click to change file
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight={700}>
                Click to choose a {uploadLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {subtitle || `Accepted: ${accept}`}
              </Typography>
            </>
          )}
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={busy || !file}
          startIcon={busy ? <CircularProgress size={15} color="inherit" /> : <IconUpload size={16} />}
          sx={{ bgcolor: '#14B8A6', '&:hover': { bgcolor: '#0D9488' }, minWidth: 130 }}
        >
          {busy ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ForumThread = ({ modelId, height = 380 }) => {
  const notify = useNotification();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const listRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!modelId) {
      setMessages([]);
      return;
    }
    setBusy(true);
    try {
      const res = await tenantForumApi.getMessages({ model_id: modelId, scope: FORUM_SCOPE });
      setMessages(Array.isArray(res) ? res : []);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to load the discussion thread.'));
    } finally {
      setBusy(false);
    }
  }, [modelId]);

  useEffect(() => {
    loadMessages();
    if (!modelId) return undefined;
    const timer = setInterval(loadMessages, 20000);
    return () => clearInterval(timer);
  }, [loadMessages, modelId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value || !modelId) return;
    setSending(true);
    try {
      await tenantForumApi.sendMessage({
        model_id: modelId,
        scope: FORUM_SCOPE,
        message: value,
        reply: replyTarget ? `${replyTarget.text || 'File'} ` : null,
      });
      setText('');
      setReplyTarget(null);
      await loadMessages();
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Unable to send message'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setBusy(true);
    try {
      await tenantForumApi.deleteMessage({ id: deletingId });
      notify.success('Message deleted successfully');
      setDeletingId(null);
      await loadMessages();
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Unable to delete message'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2">Class Interaction</Typography>
        <IconButton size="small" onClick={loadMessages} disabled={busy} aria-label="Refresh discussion">
          {busy ? <CircularProgress size={16} /> : <IconRefresh size={16} />}
        </IconButton>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 1 }} action={<Button color="inherit" onClick={loadMessages}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <List
        ref={listRef}
        sx={{
          maxHeight: height,
          minHeight: 180,
          overflowY: 'auto',
          bgcolor: 'background.default',
          borderRadius: 1,
          p: 1,
        }}
      >
        {messages.length === 0 && !busy && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No messages yet. Start the discussion for this lesson.
          </Typography>
        )}
        {messages.map((message) => {
          const parsed = parseChatMessage(message.message);
          const mine = user?.id != null && String(message.sender_id) === String(user.id);
          return (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: mine ? 'flex-end' : 'flex-start',
                px: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {message.user ? `${message.user.fname ?? ''} ${message.user.lname ?? ''}`.trim() : 'Participant'}
              </Typography>
              {parsed.media && (
                <Box sx={{ maxWidth: '100%', '& img, & video': { maxWidth: '100%' } }} dangerouslySetInnerHTML={{ __html: parsed.media }} />
              )}
              {parsed.text && (
                <Paper
                  variant="outlined"
                  sx={{
                    px: 1,
                    py: 0.5,
                    mt: 0.25,
                    bgcolor: mine ? 'primary.light' : 'grey.100',
                    color: mine ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="body2">{parsed.text}</Typography>
                </Paper>
              )}
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Typography variant="caption" color="text.disabled">
                  {message.created_at ? new Date(message.created_at).toLocaleString() : ''}
                </Typography>
                {mine && (
                  <IconButton size="small" onClick={() => setDeletingId(message.id)} aria-label="Delete message">
                    <IconTrash size={13} />
                  </IconButton>
                )}
                {!mine && (
                  <Button size="small" sx={{ minWidth: 0, py: 0, textTransform: 'none' }} onClick={() => setReplyTarget({ text: parsed.text })}>
                    Reply
                  </Button>
                )}
              </Stack>
            </ListItem>
          );
        })}
      </List>

      {replyTarget && (
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
            Replying to: {replyTarget.text || 'File'}
          </Typography>
          <Button size="small" onClick={() => setReplyTarget(null)}>
            Cancel
          </Button>
        </Stack>
      )}

      <Stack direction="row" spacing={1} mt={1}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          variant="contained"
          disabled={sending || !text.trim() || !modelId}
          onClick={handleSend}
          startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <IconSend size={15} />}
        >
          Send
        </Button>
      </Stack>

      {deletingId && (
        <Alert
          severity="warning"
          sx={{ mt: 1 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button color="inherit" size="small" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button color="error" size="small" onClick={handleDelete}>
                Delete
              </Button>
            </Stack>
          }
        >
          Delete this message permanently?
        </Alert>
      )}
    </Box>
  );
};
