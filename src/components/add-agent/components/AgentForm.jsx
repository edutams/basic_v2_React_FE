import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import AgentFormFields from './AgentFormFields';

const AgentForm = ({ formik, onCancel, actionType, loading, canSelectColor = true, canEditDomain = true }) => {
  return (
    <form onSubmit={formik.handleSubmit}>
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
            disabled={loading}
          >
            {loading ? 'Saving...' : (actionType === 'update' ? 'Update Organization' : 'Create Organization')}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default AgentForm;
