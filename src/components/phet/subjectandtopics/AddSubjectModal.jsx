import React, { useState } from 'react';
import { Box, Button, MenuItem } from '@mui/material';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import ReusableModal from 'src/components/shared/ReusableModal';
import { subjectValidationSchema } from './validation/subjectValidationSchema';

const AddSubjectModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    code: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await subjectValidationSchema.validate(form, { abortEarly: false });
      setErrors({});
      onSubmit(form);
      setForm({ name: '', code: '', status: 'active' });
    } catch (validationError) {
      if (validationError.inner) {
        const formErrors = {};
        validationError.inner.forEach((err) => {
          formErrors[err.path] = err.message;
        });
        setErrors(formErrors);
      }
    }
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
          sx={{ mb: 2 }}
          error={!!errors.name}
          helperText={errors.name}
        />
        <CustomTextField
          label="Subject Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.code}
          helperText={errors.code}
        />
        <CustomTextField
          select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.status}
          helperText={errors.status}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </CustomTextField>
        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button onClick={onClose}  variant="outlined" type="button">
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