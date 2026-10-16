import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Stack,
  Skeleton,
} from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import guardianApi from '@/api/tenant/guardians/parentApi';
import { useNotification } from '@/hooks/useNotification';

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

/** Sends a one-off message to one or more guardians over Email/SMS/WhatsApp
 * — each guardian's send is independent, so one guardian missing an email
 * (say) doesn't stop the rest from receiving it. */
const SendMessageModal = ({ open, onClose, guardians = [], onSent }) => {
  const notify = useNotification();
  const [channels, setChannels] = useState(['email']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (open) {
      setChannels(['email']);
      setSubject('');
      setMessage('');
      setResults(null);
    }
  }, [open]);

  const toggleChannel = (value) => {
    setChannels((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  };

  const recipientLabel =
    guardians.length === 1
      ? guardians[0]?.user
        ? `${guardians[0].user.fname} ${guardians[0].user.lname}`
        : 'this guardian'
      : `${guardians.length} selected guardians`;

  const handleSend = async () => {
    if (channels.length === 0 || !message.trim() || (channels.includes('email') && !subject.trim())) {
      notify.error('Pick at least one channel, a message, and a subject if email is selected.');
      return;
    }

    setSending(true);
    try {
      const outcomes = await Promise.allSettled(
        guardians.map((g) => guardianApi.sendMessage(g.user_id, { channels, subject, message })),
      );
      const failed = outcomes.filter((o) => o.status === 'rejected').length;
      setResults({ total: guardians.length, failed });

      if (failed === 0) {
        notify.success('Message sent');
      } else {
        notify.error(`${failed} of ${guardians.length} guardian(s) could not be reached`);
      }
      onSent?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <ReusableModal open={open} onClose={onClose} title="Send Message" subtitle={`To: ${recipientLabel}`} size="medium">
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Channels
          </Typography>
          <FormGroup row>
            {CHANNELS.map((c) => (
              <FormControlLabel
                key={c.value}
                control={<Checkbox checked={channels.includes(c.value)} onChange={() => toggleChannel(c.value)} />}
                label={c.label}
              />
            ))}
          </FormGroup>
        </Box>

        {channels.includes('email') && (
          <TextField
            label="Subject"
            fullWidth
            size="small"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        )}

        <TextField
          label="Message"
          fullWidth
          multiline
          minRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        {results && (
          <Alert severity={results.failed === 0 ? 'success' : 'warning'}>
            {results.failed === 0
              ? `Sent to all ${results.total} guardian(s).`
              : `${results.total - results.failed} of ${results.total} sent successfully.`}
          </Alert>
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="contained" color="inherit" size="small" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSend} disabled={sending}>
            {sending ? <Skeleton width={60} height={20} animation="wave" /> : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

SendMessageModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guardians: PropTypes.array,
  onSent: PropTypes.func,
};

export default SendMessageModal;
