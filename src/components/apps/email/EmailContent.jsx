// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
  Grid,
  Tooltip,
  Paper,
  useTheme,
} from '@mui/material';
import { IconStar, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import emailIcon from 'src/assets/images/breadcrumb/emailSv.png';
import { EmailContext } from 'src/context/EmailContext';
import TiptapEdit from 'src/views/forms/form-tiptap/TiptapEdit';

const EmailContent = () => {
  const { selectedEmail, deleteEmail, toggleStar, toggleImportant, sendEmail } = useContext(EmailContext);
  const [show, setShow] = useState(false);
  const [editorContent, setEditorContent] = useState(''); // State to store Tiptap editor content
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

  // Handle sending the reply email
  const handleSendReply = () => {
    if (selectedEmail && editorContent) {
      const newEmail = {
        id: `${Date.now()}`, // Generate unique ID
        subject: `Re: ${selectedEmail.subject}`,
        message: editorContent, 
        from: selectedEmail.To, 
        to: selectedEmail.from,
        toName: selectedEmail.from, 
        sent: true,
        inbox: false,
        starred: false,
        important: false,
        label: selectedEmail.label || '',
        attchments: [], 
        time: new Date().toISOString(),
        emailExcerpt: editorContent.substring(0, 60),
      };
      // console.log('Sending email:', newEmail); // Debug log
      sendEmail(newEmail); 
      setShow(false); 
      setEditorContent(''); 
    } else {
      console.log('Cannot send: No selected email or empty content');
    }
  };

  
  const handleEditorChange = ({ editor }) => {
    setEditorContent(editor.getHTML()); 
  };

  if (!selectedEmail) {
    return (
      <Box p={3} height="50vh" display="flex" justifyContent="center" alignItems="center">
        <Box>
          <Typography variant="h4">Please Select a Mail</Typography>
          <br />
          <img src={emailIcon} alt="No email selected" width="250px" />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack p={2} gap={0} direction="row">
        <Tooltip title={selectedEmail.starred ? 'Unstar' : 'Star'}>
          <IconButton onClick={() => toggleStar(selectedEmail.id)}>
            <IconStar
              stroke={1.3}
              size="18"
              style={{
                fill: selectedEmail.starred ? warningColor : '',
                stroke: selectedEmail.starred ? warningColor : '',
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={selectedEmail.important ? 'Not Important' : 'Important'}>
          <IconButton onClick={() => toggleImportant(selectedEmail.id)}>
            <IconAlertCircle
              size="18"
              stroke={1.3}
              style={{
                fill: selectedEmail.important ? errorColor : '',
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
        {/* Email Detail page */}
        <Box display="flex" alignItems="center" sx={{ pb: 3 }}>
          <Avatar alt={selectedEmail.from} src={selectedEmail.thumbnail} />
          <Box sx={{ ml: 2 }}>
            <Typography variant="h5">{selectedEmail.from}</Typography>
            <Typography variant="subtitle2">{selectedEmail.to}</Typography>
          </Box>
          {/* <Chip
            label={selectedEmail.label}
            sx={{ ml: 'auto', height: '24px' }}
            size="small"
            color="primary"
          /> */}
        </Box>
        <Box sx={{ py: 2 }}>
          <Typography variant="h4">{selectedEmail.subject}</Typography>
        </Box>
       <Box
          sx={{
            py: 2,
            maxHeight: '400px', 
            overflowY: 'auto', 
            wordBreak: 'break-word', 
            '& img': {
              maxWidth: '100%', 
              height: 'auto',
            },
            '& pre': {
              whiteSpace: 'pre-wrap', 
              overflowX: 'auto', 
            },
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: selectedEmail.message || selectedEmail.emailContent }} />
        </Box>
      </Box>
      {selectedEmail?.attchments?.length === 0 ? null : (
        <>
          <Divider />
          <Box p={3}>
            <Typography variant="h5">Attachments ({selectedEmail?.attchments?.length})</Typography>
            <Grid container spacing={3}>
              {selectedEmail.attchments?.map((attach) => (
                <Grid key={attach.id} size={{ lg: 4 }}>
                  <Stack direction="row" gap={2} mt={2}>
                    <Avatar
                      variant="rounded"
                      sx={{ width: '48px', height: '48px', bgcolor: (theme) => theme.palette.grey[100] }}
                    >
                      <Avatar
                        src={attach.image}
                        alt="av"
                        variant="rounded"
                        sx={{ width: '24px', height: '24px' }}
                      />
                    </Avatar>
                    <Box mr="auto">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {attach.title}
                      </Typography>
                      <Typography variant="body2">{attach.fileSize}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Divider />
        </>
      )}
      <Box p={3}>
        <Stack direction="row" gap={2}>
          <Button variant="outlined" size="small" color="primary" onClick={toggleEditor}>
            Reply
          </Button>
          <Button variant="outlined" size="small">
            Forward
          </Button>
        </Stack>
        {/* Editor */}
        {show ? (
          <Box mt={3}>
            <Paper variant="">
              <TiptapEdit onUpdate={handleEditorChange} /> {/* Use onUpdate for Tiptap */}
              <Box p={2} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={handleSendReply}>
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default EmailContent;