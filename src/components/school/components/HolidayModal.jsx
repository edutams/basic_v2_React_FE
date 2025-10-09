import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, IconButton, Card, Chip } from '@mui/material';
import { IconTrash } from '@tabler/icons';
import ReusableModal from '../../shared/ReusableModal';
import PropTypes from 'prop-types';

const HolidayModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  mode = 'create',
  activeTerm = 'First',
}) => {
  useEffect(() => {
    console.log('HolidayModal activeTerm changed:', activeTerm);
  }, [activeTerm]);

  React.useEffect(() => {
    if (mode === 'edit' && initialValues && Object.keys(initialValues).length > 0) {
      setHolidayForms([
        {
          id: 1,
          holiday_date: initialValues.holiday_date || '',
          holiday_description: initialValues.holiday_description || '',
        },
      ]);
    } else if (mode === 'create') {
      setHolidayForms([
        {
          id: 1,
          holiday_date: '',
          holiday_description: '',
        },
      ]);
    }
  }, [initialValues, mode, open]);

  const [holidayForms, setHolidayForms] = useState([
    {
      id: 1,
      holiday_date: initialValues.holiday_date || '',
      holiday_description: initialValues.holiday_description || '',
    },
  ]);

  const handleAddMore = () => {
    const newForm = {
      id: Date.now(),
      holiday_date: '',
      holiday_description: '',
    };
    setHolidayForms([...holidayForms, newForm]);
  };

  const handleRemoveForm = (formId) => {
    if (holidayForms.length > 1) {
      setHolidayForms(holidayForms.filter((form) => form.id !== formId));
    }
  };

  const handleFormChange = (formId, field, value) => {
    setHolidayForms(
      holidayForms.map((form) => (form.id === formId ? { ...form, [field]: value } : form)),
    );
  };

  const handleSave = () => {
    const validForms = holidayForms.filter((form) => form.holiday_date && form.holiday_description);

    if (validForms.length > 0) {
      if (mode === 'edit') {
        // For edit
        onSubmit(validForms[0]);
      } else {
        // For create
        validForms.forEach((form) => {
          onSubmit(form);
        });
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const renderHolidayContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography>{mode === 'edit'}</Typography>

      {mode === 'create' && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleAddMore}>
            Add More
          </Button>
        </Box>
      )}

      <Card variant="outlined" sx={{ p: 2, width: '100%' }}>
        {holidayForms.map((form, index) => (
          <Box key={form.id} sx={{ mb: index < holidayForms.length - 1 ? 2 : 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Date"
                  type="date"
                  value={form.holiday_date}
                  onChange={(e) => handleFormChange(form.id, 'holiday_date', e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="Description"
                  value={form.holiday_description}
                  onChange={(e) => handleFormChange(form.id, 'holiday_description', e.target.value)}
                  fullWidth
                  placeholder="Enter holiday description"
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                {holidayForms.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveForm(form.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <IconTrash size={16} />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Box>
        ))}
      </Card>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={holidayForms.every((form) => !form.holiday_date || !form.holiday_description)}
        >
          {mode === 'edit' ? 'Update' : 'Save'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={
        mode === 'edit' ? (
          <>
            Edit Holiday -{' '}
            <Box
              component="span"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              {activeTerm} Term
            </Box>
          </>
        ) : (
          <>
            Set Holiday -{' '}
            <Typography
              component="span"
              color="primary.main"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              {activeTerm} Term
            </Typography>
          </>
        )
      }
      size="medium"
      disableEnforceFocus
      disableAutoFocus
    >
      {renderHolidayContent()}
    </ReusableModal>
  );
};

HolidayModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']),
  activeTerm: PropTypes.string,
};

export default HolidayModal;
