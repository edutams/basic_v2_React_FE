import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { wardValidationSchema } from './validation/wardValidationSchema';

const NIGERIA_STATES = [
  { name: 'Abia',        lgas: ['Aba North','Aba South','Arochukwu','Bende','Ikwuano','Isiala Ngwa North','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'] },
  { name: 'Adamawa',     lgas: ['Demsa','Fufure','Ganye','Gombi','Hong','Jada','Lamurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'] },
  { name: 'Akwa Ibom',   lgas: ['Abak','Eastern Obolo','Eket','Esit Eket','Essien Udim','Etim Ekpo','Etinan','Ibeno','Ibesikpo Asutan','Ibiono-Ibom','Ika','Ikono','Ikot Abasi','Ikot Ekpene','Ini','Itu','Mbo','Mkpat-Enin','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot Akara','Okobo','Onna','Oron','Oruk Anam','Udung-Uko','Ukanafun','Uruan','Urue-Offong/Oruko','Uyo'] },
  { name: 'Anambra',     lgas: ['Aguata','Anambra East','Anambra West','Anaocha','Awka North','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'] },
];

const EMPTY_FORM = {
  surname: '',
  first_name: '',
  other_name: '',
  dob: '',
  gender: '',
  state_of_origin: '',
  lga: '',
  home_address: '',
};

const WardDetailForm = ({ initialValues, onSubmit, onBack, isLoading = false }) => {
  const [lgas, setLgas] = useState([]);

  const formik = useFormik({
    initialValues: initialValues ?? EMPTY_FORM,
    validationSchema: wardValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    formik.setFieldValue('state_of_origin', stateName);
    formik.setFieldValue('lga', '');
    const found = NIGERIA_STATES.find((s) => s.name === stateName);
    setLgas(found?.lgas ?? []);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Tell us about your ward
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Basic information
      </Typography>

      <Grid container spacing={2}>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Surname"
            name="surname"
            value={formik.values.surname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.surname && Boolean(formik.errors.surname)}
            helperText={formik.touched.surname && formik.errors.surname}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="First name"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Other name"
            name="other_name"
            value={formik.values.other_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Date of Birth"
            name="dob"
            type="date"
            value={formik.values.dob}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={formik.touched.dob && Boolean(formik.errors.dob)}
            helperText={formik.touched.dob && formik.errors.dob}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
            <InputLabel>Select Gender</InputLabel>
            <Select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Select Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.state_of_origin && Boolean(formik.errors.state_of_origin)}
          >
            <InputLabel>State of Origin</InputLabel>
            <Select
              name="state_of_origin"
              value={formik.values.state_of_origin}
              onChange={handleStateChange}
              onBlur={formik.handleBlur}
              label="State of Origin"
            >
              {NIGERIA_STATES.map((s) => (
                <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.lga && Boolean(formik.errors.lga)}
            disabled={lgas.length === 0}
          >
            <InputLabel>LGA of Origin</InputLabel>
            <Select
              name="lga"
              value={formik.values.lga}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="LGA of Origin"
            >
              {lgas.map((l) => (
                <MenuItem key={l} value={l}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Home Address"
            name="home_address"
            value={formik.values.home_address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={2}
            error={formik.touched.home_address && Boolean(formik.errors.home_address)}
            helperText={formik.touched.home_address && formik.errors.home_address}
          />
        </Grid>

      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button variant="contained" type="submit" disabled={isLoading || !formik.isValid}>
          {isLoading ? 'Saving...' : 'Save and Continue'}
        </Button>
      </Box>
    </Box>
  );
};

WardDetailForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default WardDetailForm;
