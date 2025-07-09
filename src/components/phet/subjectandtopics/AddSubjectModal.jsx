import React, { useState } from 'react';
import { Box, Button, MenuItem } from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ReusableModal from 'src/components/shared/ReusableModal';

const AddSubjectModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', code: '', status: 'active' });
  };

  return (
    <ReusableModal open={open} onClose={onClose} title="Add New Subject" size="small">
      <form onSubmit={handleSubmit}>
        <CustomTextField
          label="Subject Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <CustomTextField
          label="Subject Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <CustomTextField
          select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </CustomTextField>
        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button onClick={onClose} color="inherit" variant="outlined" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Subject
          </Button>
        </Box>
      </form>
    </ReusableModal>
  );
};

export default AddSubjectModal; 