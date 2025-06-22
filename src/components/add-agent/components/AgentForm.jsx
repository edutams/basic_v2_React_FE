import React from 'react';
import {
  Grid,
  Box,
  Button,
} from '@mui/material';
import AgentFormFields from './AgentFormFields';
import ColorSchemeSelector from './ColorSchemeSelector';

const AgentForm = ({ formik, onCancel, actionType }) => {
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} mb={3}>
        <AgentFormFields formik={formik} />
        {actionType !== 'update' && <ColorSchemeSelector formik={formik} />}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }} color="inherit">
          Cancel
        </Button>
        {actionType !== 'viewSchools' && (
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {actionType === 'update' ? 'Update Agent' : 'Save'}
          </Button>
        )}
      </Box>
    </form>
  );
};

export default AgentForm;
