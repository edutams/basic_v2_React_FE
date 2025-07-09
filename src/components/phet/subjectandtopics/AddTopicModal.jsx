import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem } from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ReusableModal from 'src/components/shared/ReusableModal';

const AddTopicModal = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        code: initialData.code || '',
        status: initialData.status || 'active',
      });
    } else {
      setForm({ name: '', code: '', status: 'active' });
    }
  }, [initialData, open]);

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
    <ReusableModal open={open} onClose={onClose} title={initialData ? 'Edit Topic' : 'Add New Topic'} size="small">
      <form onSubmit={handleSubmit}>
        <CustomTextField
          label="Topic Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <CustomTextField
          label="Topic Code"
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
            {initialData ? 'Update Topic' : 'Add Topic'}
          </Button>
        </Box>
      </form>
    </ReusableModal>
  );
};

export default AddTopicModal; 