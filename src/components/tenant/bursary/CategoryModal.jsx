import { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from '@/components/shared/ReusableModal';

const CategoryModal = ({ open, onClose, onSave, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [category, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await onSave(formData);
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={category ? 'Edit Payment Category' : 'Add Payment Category'}
      size="medium"
      showCloseButton={true}
      showDivider={true}
    >
      <Stack spacing={3}>
        <TextField
          label="Category Name"
          fullWidth
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="e.g., Returning Students"
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={formData.description}
          onChange={handleChange('description')}
          error={!!errors.description}
          helperText={errors.description}
          placeholder="Describe who this category applies to"
        />

        <TextField
          select
          label="Status"
          fullWidth
          value={formData.status}
          onChange={handleChange('status')}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>

        <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} sx={{ fontWeight: 600 }}>
            {loading ? 'Saving...' : `${category ? 'Update' : 'Add'} Category`}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

CategoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  category: PropTypes.object,
};

export default CategoryModal;
