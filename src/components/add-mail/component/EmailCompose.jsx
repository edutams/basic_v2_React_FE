// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState, useContext } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  Slide,
  TextField,
  DialogContent,
  DialogActions,
  DialogContentText,
  Typography,
  Grid,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { EmailContext } from 'src/context/EmailContext';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const EmailCompose = ({ onClose }) => {
  const { sendEmail, setFilter } = useContext(EmailContext); // <-- get setFilter from context
  const [form, setForm] = useState({
    recipientType: '',
    agent: '',
    level: '',
    level2: '',
    search: '',
    category: '',
    to: '',
    subject: '',
    message: '',
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Compose the new email object
    const newEmail = {
      to: form.to,
      toName: form.to,
      subject: form.subject,
      message: form.message,
      attachment: form.attachment,
    };
    sendEmail(newEmail);
    setFilter('sent');
    if (onClose) onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
      <Grid container spacing={2} mb={2}>
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="recipient-type-label">Recipient Type</InputLabel>
            <Select
              labelId="recipient-type-label"
              id="recipient-type"
              name="recipientType"
              value={form.recipientType}
              label="Recipient Type"
              onChange={handleChange}
            >
              <MenuItem value="Agents">Agents</MenuItem>
              <MenuItem value="Students">Students</MenuItem>
              <MenuItem value="Parents">Parents</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="agent-label">Agents</InputLabel>
            <Select
              labelId="agent-label"
              id="agent"
              name="agent"
              value={form.agent}
              label="Agents"
              onChange={handleChange}
            >
              <MenuItem value="Agent 1">Agent 1</MenuItem>
              <MenuItem value="Agent 2">Agent 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={form.category}
              label="Category"
              onChange={handleChange}
            >
              <MenuItem value="Level 1">Level 1</MenuItem>
              <MenuItem value="Level 2">Level 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="level2-label">Level 2</InputLabel>
            <Select
              labelId="level2-label"
              id="level2"
              name="level2"
              value={form.level2}
              label="Level 2"
              onChange={handleChange}
            >
              <MenuItem value="Level 2A">Level 2A</MenuItem>
              <MenuItem value="Level 2B">Level 2B</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Search for Recipients..."
            name="search"
            value={form.search}
            onChange={handleChange}
            variant="outlined"
            sx={{ bgcolor: 'white', mb: 2 }}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            id="to-text"
            name="to"
            fullWidth
            size="small"
            label="To"
            value={form.to}
            onChange={handleChange}
            variant="outlined"
            sx={{ bgcolor: 'white', mb: 2 }}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            id="subject-text"
            name="subject"
            fullWidth
            size="small"
            label="Subject"
            value={form.subject}
            onChange={handleChange}
            variant="outlined"
            sx={{ bgcolor: 'white', mb: 2 }}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <TextField
            id="message-text"
            name="message"
            label="Write a message"
            multiline
            fullWidth
            size="small"
            rows={4}
            value={form.message}
            onChange={handleChange}
            variant="outlined"
            sx={{ bgcolor: 'white', mb: 2 }}
          />
        </Grid>
        <Grid item size={{ xs: 12, md: 12, sm: 6 }}>
          <input
            type="file"
            id="upload-text"
            name="attachment"
            style={{
              display: 'block',
              marginBottom: 16,
              width: '100%',
              background: 'white',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #e0e0e0',
            }}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default EmailCompose;