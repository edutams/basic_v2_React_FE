import React from 'react';
import {
  Grid,
  TextField,
} from '@mui/material';

const AgentFormFields = ({ formik }) => {
  return (
    <>
      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <TextField
          key="organizationName"
          label="Organization Name"
          fullWidth
          name="organizationName"
          value={formik.values.organizationName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.organizationName && Boolean(formik.errors.organizationName)}
          helperText={formik.touched.organizationName && formik.errors.organizationName}
        />
      </Grid>
      
      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <TextField
          key="organizationTitle"
          label="Organization Title"
          fullWidth
          name="organizationTitle"
          value={formik.values.organizationTitle}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.organizationTitle && Boolean(formik.errors.organizationTitle)}
          helperText={formik.touched.organizationTitle && formik.errors.organizationTitle}
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <TextField
          key="agentDetails"
          label="Agent Name"
          fullWidth
          name="agentDetails"
          value={formik.values.agentDetails}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.agentDetails && Boolean(formik.errors.agentDetails)}
          helperText={formik.touched.agentDetails && formik.errors.agentDetails}
        />
      </Grid>
      
      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <TextField
          key="contactDetails"
          label="Agent Email"
          fullWidth
          name="contactDetails"
          type="email"
          value={formik.values.contactDetails}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.contactDetails && Boolean(formik.errors.contactDetails)}
          helperText={formik.touched.contactDetails && formik.errors.contactDetails}
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
        <TextField
          key="agentPhone"
          label="Agent Phone"
          placeholder="+234-801-234-5678"
          fullWidth
          name="agentPhone"
          value={formik.values.agentPhone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.agentPhone && Boolean(formik.errors.agentPhone)}
          helperText={formik.touched.agentPhone && formik.errors.agentPhone}
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
        <TextField
          key="contactAddress"
          label="Contact Address"
          fullWidth
          name="contactAddress"
          multiline
          rows={2}
          value={formik.values.contactAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.contactAddress && Boolean(formik.errors.contactAddress)}
          helperText={formik.touched.contactAddress && formik.errors.contactAddress}
        />
      </Grid>
    </>
  );
};

export default AgentFormFields;
