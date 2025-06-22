import React, { useMemo } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const statesAndLGAs = {
  lagos: {
    name: 'Lagos',
    lgas: [
      'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
      'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
      'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
      'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
    ]
  },
  abuja: {
    name: 'Abuja (FCT)',
    lgas: [
      'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'
    ]
  },
  kano: {
    name: 'Kano',
    lgas: [
      'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure',
      'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa',
      'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa',
      'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya',
      'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda',
      'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono',
      'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada',
      'Ungogo', 'Warawa', 'Wudil'
    ]
  },
  rivers: {
    name: 'Rivers',
    lgas: [
      'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni',
      'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche',
      'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni',
      'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo',
      'Port Harcourt', 'Tai'
    ]
  },
  ogun: {
    name: 'Ogun',
    lgas: [
      'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North',
      'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North',
      'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon',
      'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside',
      'Remo North', 'Shagamu'
    ]
  }
};

const AgentFormFields = ({ formik }) => {
  const availableLGAs = useMemo(() => {
    const selectedState = formik.values.stateFilter;
    if (selectedState && statesAndLGAs[selectedState]) {
      return statesAndLGAs[selectedState].lgas;
    }
    return [];
  }, [formik.values.stateFilter]);

  const handleStateChange = (event) => {
    const newState = event.target.value;
    formik.setFieldValue('stateFilter', newState);
    formik.setFieldValue('lga', '');
  };

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
            {Object.entries(statesAndLGAs).map(([key, state]) => (
              <MenuItem key={key} value={key}>
                {state.name}
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
          disabled={!formik.values.stateFilter || availableLGAs.length === 0}
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
            {availableLGAs.map((lga) => (
              <MenuItem key={lga} value={lga}>
                {lga}
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
