import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';

const StudentDetailModal = ({ open, onClose, student }) => {
  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Student Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>
              {student.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {student.name}
              </Typography>
              <Chip label={student.admissionNo} size="small" color="success" sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          <Typography variant="body2">
            <strong>Gender:</strong> {student.gender}
          </Typography>
          <Typography variant="body2">
            <strong>Current Class/Arm:</strong> {student.classArm}
          </Typography>
          <Typography variant="body2">
            <strong>Parent/Guardian:</strong> {student.guardianName} ({student.guardianPhone})
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailModal;
