import React, { useMemo, useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import locationApi from '../../../api/location';

const AgentFormFields = ({ formik }) => {
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const states = await locationApi.getStates();
        setStates(states);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = async (event) => {
    const newStateId = event.target.value;
    formik.setFieldValue('stateFilter', newStateId);
    formik.setFieldValue('lga', '');
    setLgas([]);

    if(newStateId){
        try {
            const lgas = await locationApi.getLgas(newStateId);
            setLgas(lgas);
        } catch (error) {
            console.error("Failed to fetch LGAs", error);
        }
    }
  };

  return (
    <>
      <Grid item size={{ xs: 12, md: 12, lg: 12 }}>
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

      <Grid item size={{ xs: 12, md: 12, sm: 4 ,lg:12}}>
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

      <Grid item size={{ xs: 12, md: 5, sm: 4 }}>
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

      <Grid item size={{ xs: 12, md: 4, sm: 4 }}>
        <FormControl
          fullWidth
          error={formik.touched.stateFilter && Boolean(formik.errors.stateFilter)}
        >
          <InputLabel>State</InputLabel>
          <Select
            name="stateFilter"
            value={formik.values.stateFilter}
            label="State"
            onChange={handleStateChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose State --</MenuItem>
            {states.map((state) => (
              <MenuItem key={state.id} value={state.id}>
                {state.stname}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.stateFilter && formik.errors.stateFilter && (
            <FormHelperText>{formik.errors.stateFilter}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item size={{ xs: 12, md: 3, sm: 4 }}>
        <FormControl
          fullWidth
          error={formik.touched.lga && Boolean(formik.errors.lga)}
          disabled={!formik.values.stateFilter || lgas.length === 0}
        >
          <InputLabel>LGA</InputLabel>
          <Select
            name="lga"
            value={formik.values.lga}
            label="LGA"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <MenuItem value="">-- Choose LGA --</MenuItem>
            {lgas.map((lga) => (
              <MenuItem key={lga.id} value={lga.id}>
                {lga.lganame}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.lga && formik.errors.lga && (
            <FormHelperText>{formik.errors.lga}</FormHelperText>
          )}
          {!formik.values.stateFilter && (
            <FormHelperText>Please select a state first</FormHelperText>
          )}
        </FormControl>
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
