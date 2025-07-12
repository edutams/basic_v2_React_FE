import React, { useState, useContext } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { IconStar, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import emailIcon from 'src/assets/images/breadcrumb/emailSv.png';
import { EmailContext } from 'src/context/EmailContext';
import TiptapEdit from 'src/views/forms/form-tiptap/TiptapEdit';
import { useTheme } from '@mui/material/styles';

const EmailContent = () => {
  const { selectedEmail, deleteEmail, toggleStar, toggleImportant, sendEmail } = useContext(
    EmailContext
  );
  const [show, setShow] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const theme = useTheme();
  const warningColor = theme.palette.warning.main;
  const errorColor = theme.palette.error.light;

  const handleDelete = () => {
    if (selectedEmail) {
      deleteEmail(selectedEmail.id);
    }
  };

  const toggleEditor = () => {
    setShow(!show);
  };

  const handleSendReply = () => {
    if (selectedEmail && editorContent && editorContent.trim() !== '' && editorContent !== '<p></p>') {
      const newEmail = {
        id: `${Date.now()}`,
        subject: `Re: ${selectedEmail.subject || 'No Subject'}`,
        message: editorContent,
        from: selectedEmail.to || 'current-user@example.com',
        to: selectedEmail.from || '',
        toName: selectedEmail.from || '',
        sent: true,
        inbox: false,
        starred: false,
        important: false,
        label: selectedEmail.label || '',
        attachments: [],
        time: new Date().toISOString(),
        emailExcerpt: editorContent.substring(0, 60),
      };
      try {
        sendEmail(newEmail);
        setShow(false);
        setEditorContent('');
        setSnackbarMessage('Email sent successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage('Failed to send email: ' + (error && error.message ? error.message : 'Unknown error'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage('Failed to send: Please select an email and enter content.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditorChange = ({ editor }) => {
    const content = editor.getHTML();
    setEditorContent(content);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Stack p={2} gap={0} direction="row">
        <Tooltip title={selectedEmail?.starred ? 'Unstar' : 'Star'}>
          <IconButton onClick={() => selectedEmail && toggleStar(selectedEmail.id)}>
            <IconStar
              stroke={1.3}
              size="18"
              style={{
                fill: selectedEmail?.starred ? warningColor : '',
                stroke: selectedEmail?.starred ? warningColor : '',
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={selectedEmail?.important ? 'Not Important' : 'Important'}>
          <IconButton onClick={() => selectedEmail && toggleImportant(selectedEmail.id)}>
            <IconAlertCircle
              size="18"
              stroke={1.3}
              style={{
                fill: selectedEmail?.important ? errorColor : '',
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={handleDelete}>
            <IconTrash size="18" stroke={1.3} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Divider />
      <Box p={3}>
        <Box display="flex" alignItems="center" sx={{ pb: 3 }}>
          <Avatar alt={selectedEmail?.from} src={selectedEmail?.thumbnail} />
          <Box sx={{ ml: 2 }}>
            <Typography variant="h5">{selectedEmail?.from || 'Unknown Sender'}</Typography>
            <Typography variant="subtitle2">{selectedEmail?.to}</Typography>
          </Box>
          {/* <Chip
            label={selectedEmail?.label || ''}
            sx={{ ml: 'auto', height: '24px' }}
            size="small"
            color="primary"
          /> */}
        </Box>
        <Box sx={{ py: 2 }}>
          <Typography variant="h4">{selectedEmail?.subject || 'No Subject'}</Typography>
        </Box>
        <Box sx={{ py: 2 }}>
          <div
            dangerouslySetInnerHTML={{ __html: selectedEmail?.message || selectedEmail?.emailContent || '' }}
          />
        </Box>
      </Box>
      {selectedEmail?.attachments?.length ? (
        <>
          <Divider />
          <Box p={3}>
            <Typography variant="h5">Attachments ({selectedEmail?.attachments?.length})</Typography>
            <Grid container spacing={3}>
              {selectedEmail?.attachments?.map((attach) => (
                <Grid key={attach.id || Math.random()} xs={12} lg={4}>
                  <Stack direction="row" gap={2} mt={2}>
                    <Avatar
                      variant="rounded"
                      sx={{ width: '48px', height: '48px', bgcolor: theme.palette.grey[100] }}
                    >
                      <Avatar
                        src={attach.image}
                        alt={attach.title}
                        variant="rounded"
                        sx={{ width: '24px', height: '24px' }}
                      />
                    </Avatar>
                    <Box mr="auto">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {attach.title || 'Untitled'}
                      </Typography>
                      <Typography variant="body2">{attach.fileSize || 'Unknown size'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
        </>
      ) : null}
      <Box p={3}>
        <Stack direction="row" gap={2}>
          <Button variant="outlined" size="small" color="primary" onClick={toggleEditor}>
            Reply
          </Button>
          <Button variant="outlined" size="small">
            Forward
          </Button>
        </Stack>
        {show ? (
          <Box mt={3}>
            <Paper variant="elevation">
              <TiptapEdit onUpdate={handleEditorChange} />
              <Box p={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log('Send button clicked');
                    handleSendReply();
                  }}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailContent;