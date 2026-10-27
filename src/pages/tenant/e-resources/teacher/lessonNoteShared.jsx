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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  IconFileUpload,
  IconMessageCircle2,
  IconRefresh,
  IconSend,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
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
  // Uploaded files are stored (and returned by the API) as bare relative
  // paths like "lessons/123.docx" — no leading slash or http(s) origin —
  // so this must not require one, or those uploads fall through to a
  // plain "open in a new tab" link instead of the inline preview.
  return /\.(docx?|pdf|pptx?|xlsx?)($|\?)/i.test(text);
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
      <Alert
        severity="warning"
        sx={{
          width: '100%',
          borderRadius: 1,
          // Orange alert (not the theme's yellow warning colour).
          bgcolor: 'rgba(230,81,0,0.10)',
          color: '#E65100',
          border: '1px solid rgba(230,81,0,0.35)',
          '& .MuiAlert-icon': { color: '#E65100', opacity: 1 },
        }}
      >
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
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
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

// Deterministic avatar colour per sender — same person always gets the same
// tint, so a thread stays easy to scan without needing real profile photos.
const AVATAR_PALETTE = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FFEDD5', color: '#EA580C' },
  { bg: '#FCE7F3', color: '#DB2777' },
  { bg: '#CCFBF1', color: '#0D9488' },
];

const avatarScheme = (seed) => {
  const text = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

const initialsOf = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
};

const relativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await tenantForumApi.deleteMessage({ id });
      notify.success('Message deleted successfully');
      await loadMessages();
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Unable to delete message'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      {/* ── Header: icon badge, title, live status, refresh ───────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.25}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(37,99,235,0.1)',
              color: '#2563EB',
            }}
          >
            <IconMessageCircle2 size={15} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>
              Class Interaction
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
              {messages.length === 0
                ? 'No messages yet'
                : `${messages.length} message${messages.length === 1 ? '' : 's'} · updates live`}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={loadMessages} disabled={busy} aria-label="Refresh discussion">
          {busy ? <CircularProgress size={14} /> : <IconRefresh size={15} />}
        </IconButton>
      </Stack>

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 1, borderRadius: '8px' }}
          action={<Button color="inherit" size="small" onClick={loadMessages}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {/* ── Message list ───────────────────────────────────────────────── */}
      <Box
        ref={listRef}
        sx={{
          maxHeight: height,
          minHeight: 180,
          overflowY: 'auto',
          bgcolor: '#F8FAFC',
          border: '1px solid #EEF2F6',
          borderRadius: '10px',
          p: 1.25,
        }}
      >
        {messages.length === 0 && !busy && (
          <Stack alignItems="center" spacing={0.75} sx={{ py: 3.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#E2E8F0',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconMessageCircle2 size={20} />
            </Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" textAlign="center">
              Start the conversation
            </Typography>
            <Typography variant="caption" color="text.disabled" textAlign="center" sx={{ maxWidth: 220 }}>
              Questions, clarifications and comments on this lesson will show up here for the whole class.
            </Typography>
          </Stack>
        )}

        <Stack spacing={1.25}>
          {messages.map((message) => {
            const parsed = parseChatMessage(message.message);
            const mine = user?.id != null && String(message.sender_id) === String(user.id);
            const senderName = message.user
              ? `${message.user.fname ?? ''} ${message.user.lname ?? ''}`.trim() || 'Participant'
              : 'Participant';
            const scheme = avatarScheme(message.sender_id);

            return (
              <Stack
                key={message.id}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{ flexDirection: mine ? 'row-reverse' : 'row' }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: mine ? '#2563EB' : scheme.bg,
                    color: mine ? '#fff' : scheme.color,
                    flexShrink: 0,
                  }}
                >
                  {initialsOf(senderName)}
                </Avatar>

                <Box sx={{ maxWidth: '78%', minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    justifyContent={mine ? 'flex-end' : 'flex-start'}
                    sx={{ mb: 0.25 }}
                  >
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#475569' }}>
                      {mine ? 'You' : senderName}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>
                      {relativeTime(message.created_at)}
                    </Typography>
                  </Stack>

                  {parsed.media && (
                    <Box
                      sx={{ maxWidth: '100%', mb: 0.5, '& img, & video': { maxWidth: '100%', borderRadius: '8px' } }}
                      dangerouslySetInnerHTML={{ __html: parsed.media }}
                    />
                  )}

                  {parsed.text && (
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.75,
                        borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        bgcolor: mine ? '#2563EB' : '#ffffff',
                        color: mine ? '#ffffff' : '#1e293b',
                        border: mine ? 'none' : '1px solid #E5E7EB',
                        boxShadow: mine ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
                        wordBreak: 'break-word',
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, lineHeight: 1.5 }}>{parsed.text}</Typography>
                    </Box>
                  )}

                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent={mine ? 'flex-end' : 'flex-start'}
                    sx={{ mt: 0.25 }}
                  >
                    {mine ? (
                      <Button
                        size="small"
                        onClick={() => handleDelete(message.id)}
                        disabled={deletingId === message.id}
                        startIcon={
                          deletingId === message.id ? (
                            <CircularProgress size={10} color="inherit" />
                          ) : (
                            <IconTrash size={11} />
                          )
                        }
                        sx={{ minWidth: 0, py: 0, px: 0.5, fontSize: 10, color: '#94A3B8', textTransform: 'none' }}
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => setReplyTarget({ text: parsed.text })}
                        sx={{ minWidth: 0, py: 0, px: 0.5, fontSize: 10, color: '#2563EB', textTransform: 'none' }}
                      >
                        Reply
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      {/* ── Reply preview ──────────────────────────────────────────────── */}
      {replyTarget && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mt: 1,
            px: 1.25,
            py: 0.6,
            borderRadius: '8px',
            bgcolor: 'rgba(37,99,235,0.06)',
            borderLeft: '3px solid #2563EB',
          }}
        >
          <Typography sx={{ fontSize: 11, color: '#475569', flex: 1 }} noWrap>
            Replying to: <strong>{replyTarget.text || 'File'}</strong>
          </Typography>
          <IconButton size="small" onClick={() => setReplyTarget(null)}>
            <IconX size={13} />
          </IconButton>
        </Stack>
      )}

      {/* ── Composer ───────────────────────────────────────────────────── */}
      <Stack direction="row" spacing={1} mt={1.25} alignItems="center">
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message for the class..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '999px', bgcolor: '#fff', fontSize: 12.5 } }}
        />
        <IconButton
          onClick={handleSend}
          disabled={sending || !text.trim() || !modelId}
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            bgcolor: '#2563EB',
            color: '#fff',
            '&:hover': { bgcolor: '#1D4ED8' },
            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
          }}
          aria-label="Send message"
        >
          {sending ? <CircularProgress size={16} color="inherit" /> : <IconSend size={16} />}
        </IconButton>
      </Stack>
    </Box>
  );
};
