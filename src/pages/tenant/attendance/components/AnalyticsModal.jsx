import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { AnalyticsOutlined as AnalyticsIcon } from '@mui/icons-material';

const AnalyticsModal = ({ open, onClose, title, content }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnalyticsIcon color="primary" />
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnalyticsModal;
