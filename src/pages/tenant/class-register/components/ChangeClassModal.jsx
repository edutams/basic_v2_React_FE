import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ChangeClassModal = ({ open, onClose, student, onSubmit }) => {
  const [newClass, setNewClass] = useState('');

  const handleSave = () => {
    if (onSubmit) {
      onSubmit(student?.id, newClass);
    }
    onClose();
  };

  const handleEnter = () => {
    setNewClass(student?.classArm || '');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Change Student Class</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Transfer <strong>{student?.name}</strong> to a different class or arm.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>New Class</InputLabel>
            <Select value={newClass} label="New Class" onChange={(e) => setNewClass(e.target.value)}>
              <MenuItem value="Pry 1">Pry 1</MenuItem>
              <MenuItem value="Pry 2">Pry 2</MenuItem>
              <MenuItem value="Pry 3">Pry 3</MenuItem>
              <MenuItem value="Pry 4 (Diamond)">Pry 4 (Diamond)</MenuItem>
              <MenuItem value="Pry 5">Pry 5</MenuItem>
              <MenuItem value="Pry 6">Pry 6</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeClassModal;
