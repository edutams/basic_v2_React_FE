import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import AgentFormFields from './AgentFormFields';

const AgentForm = ({ formik, onCancel, actionType, loading, canSelectColor = true, canEditDomain = true }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted, validation errors:', formik.errors);
    console.log('Form values:', formik.values);
    console.log('Form touched:', formik.touched);
    console.log('Form isValid:', formik.isValid);
    
    if (!formik.isValid) {
      // Touch all fields to show validation errors
      Object.keys(formik.values).forEach(key => {
        formik.setFieldTouched(key, true);
      });
      return;
    }
    
    formik.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} mb={3}>
        <AgentFormFields
          formik={formik}
          canSelectColor={actionType !== 'update' && canSelectColor}
          canEditDomain={canEditDomain}
        />
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit" disabled={loading}>
          Cancel
        </Button>
        {actionType !== 'viewSchools' && (
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid}
            onClick={(e) => {
              console.log('Button clicked directly');
              if (!loading && formik.isValid) {
                handleSubmit(e);
              }
            }}
          >
            {loading ? 'Saving...' : (actionType === 'update' ? 'Update Organization' : 'Create Organization')}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default AgentForm;
