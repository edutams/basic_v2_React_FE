import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack, Skeleton, Alert, Divider } from '@mui/material';
import { Email as EmailIcon, Sms as SmsIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import guardianApi from '@/api/tenant/guardians/parentApi';

const CHANNEL_ICON = { email: EmailIcon, sms: SmsIcon, whatsapp: WhatsAppIcon };

const STATUS_COLOR = { sent: 'success', failed: 'error', pending: 'warning' };

/** Shows two distinct, clearly-labeled things: this guardian's own
 * sent-message history (from the Send Message action), and the per-ward
 * email/SMS notification-preference records created when a ward gets
 * linked — the latter are delivery-preference placeholders, not a message
 * log, so they're never presented as if they were one. */
const CommunicationLogContent = ({ guardian }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    if (!guardian?.user_id) return;
    setLoading(true);
    setError(null);
    guardianApi
      .getCommunicationLog(guardian.user_id)
      .then((res) => {
        setMessages(res?.data?.data?.messages ?? []);
        setPreferences(res?.data?.data?.notification_preferences ?? []);
      })
      .catch(() => setError('Failed to load communication log'))
      .finally(() => setLoading(false));
  }, [guardian?.user_id]);

  if (loading) {
    return (
      <Stack spacing={1}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Messages Sent
        </Typography>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No messages sent to this guardian yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {messages.map((m) => {
              const Icon = CHANNEL_ICON[m.channel] || EmailIcon;
              return (
                <Box key={m.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                      {m.channel}
                    </Typography>
                    <Chip
                      label={m.status}
                      size="small"
                      color={STATUS_COLOR[m.status] || 'default'}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                      {dayjs(m.created_at).format('D MMM YYYY, h:mm A')}
                    </Typography>
                  </Stack>
                  {m.subject && (
                    <Typography variant="body2" fontWeight={600}>
                      {m.subject}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {m.message}
                  </Typography>
                  {m.error && (
                    <Typography variant="caption" color="error">
                      {m.error}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
          Notification Preferences
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
          Per-ward fee-invoice delivery records — not a message log.
        </Typography>
        {preferences.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No invoice notification records for this guardian's wards yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {preferences.map((p) => (
              <Stack
                key={p.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
              >
                <Chip
                  label={p.type}
                  size="small"
                  sx={{ textTransform: 'uppercase', height: 20, fontSize: '0.65rem' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {p.ward_name || 'Ward'} — {p.target || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {[p.session_name, p.term_name].filter(Boolean).join(' ')}
                  </Typography>
                </Box>
                <Chip label={p.status} size="small" color={STATUS_COLOR[p.status] || 'default'} />
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

CommunicationLogContent.propTypes = {
  guardian: PropTypes.object,
};

export default CommunicationLogContent;
