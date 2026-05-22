import { useState, useEffect } from 'react';
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
  Checkbox,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { academicInfoValidationSchema } from './validation/academicInfoValidationSchema';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import { useNotification } from 'src/hooks/useNotification';

// ── Nigerian states + LGAs  ───────────────────────────────────────
const NIGERIA_STATES = [
  {
    name: 'Abia',
    lgas: [
      'Aba North',
      'Aba South',
      'Arochukwu',
      'Bende',
      'Ikwuano',
      'Isiala Ngwa North',
      'Isiala Ngwa South',
      'Isuikwuato',
      'Obi Ngwa',
      'Ohafia',
      'Osisioma',
      'Ugwunagbo',
      'Ukwa East',
      'Ukwa West',
      'Umuahia North',
      'Umuahia South',
      'Umu Nneochi',
    ],
  },
  {
    name: 'Adamawa',
    lgas: [
      'Demsa',
      'Fufure',
      'Ganye',
      'Gombi',
      'Hong',
      'Jada',
      'Lamurde',
      'Madagali',
      'Maiha',
      'Mayo Belwa',
      'Michika',
      'Mubi North',
      'Mubi South',
      'Numan',
      'Shelleng',
      'Song',
      'Toungo',
      'Yola North',
      'Yola South',
    ],
  },
  {
    name: 'Akwa Ibom',
    lgas: [
      'Abak',
      'Eastern Obolo',
      'Eket',
      'Esit Eket',
      'Essien Udim',
      'Etim Ekpo',
      'Etinan',
      'Ibeno',
      'Ibesikpo Asutan',
      'Ibiono-Ibom',
      'Ika',
      'Ikono',
      'Ikot Abasi',
      'Ikot Ekpene',
      'Ini',
      'Itu',
      'Mbo',
      'Mkpat-Enin',
      'Nsit-Atai',
      'Nsit-Ibom',
      'Nsit-Ubium',
      'Obot Akara',
      'Okobo',
      'Onna',
      'Oron',
      'Oruk Anam',
      'Udung-Uko',
      'Ukanafun',
      'Uruan',
      'Urue-Offong/Oruko',
      'Uyo',
    ],
  },
  {
    name: 'Anambra',
    lgas: [
      'Aguata',
      'Anambra East',
      'Anambra West',
      'Anaocha',
      'Awka North',
      'Awka South',
      'Ayamelum',
      'Dunukofia',
      'Ekwusigo',
      'Idemili North',
      'Idemili South',
      'Ihiala',
      'Njikoka',
      'Nnewi North',
      'Nnewi South',
      'Ogbaru',
      'Onitsha North',
      'Onitsha South',
      'Orumba North',
      'Orumba South',
      'Oyi',
    ],
  },
  {
    name: 'Bauchi',
    lgas: [
      'Alkaleri',
      'Bauchi',
      'Bogoro',
      'Damban',
      'Darazo',
      'Dass',
      'Gamawa',
      'Ganjuwa',
      'Giade',
      'Itas/Gadau',
      'Katagum',
      'Kirfi',
      'Misau',
      'Ningi',
      'Shira',
      'Tafawa Balewa',
      'Toro',
      'Warji',
      'Zaki',
    ],
  },
];

const EMPTY_FORM = {
  has_previous_school: false,
  previous_school_name: '',
  previous_school_state: '',
  previous_school_lga: '',
  previous_class: '',
  programme_id: '',
  class_id: '',
  boarding_status: '',
};

const AcademicInfoForm = ({ initialValues, onSubmit, onBack, isLoading = false }) => {
  const notify = useNotification();

  // ── State ─────────────────────────────────────────────────────────────────
  const [programmes, setProgrammes] = useState([]); // [{id, label, classes:[]}]
  const [classes, setClasses] = useState([]); // filtered by selected programme
  const [lgas, setLgas] = useState([]); // filtered by selected state

  // ── Load programmes on mount ──────────────────────────────────────────────
  useEffect(() => {
    getClassesWithDivisions()
      .then((data) => {
        const flat = [];
        (data || []).forEach((division) => {
          (division.programmes || []).forEach((prog) => {
            flat.push({
              id: prog.id,
              label: prog.programme_code || prog.programme_name,
              classes: (prog.classes || []).map((cls) => ({
                id: cls.id,
                label: cls.class_code || cls.class_name,
              })),
            });
          });
        });
        setProgrammes(flat);
      })
      .catch(() => notify.error('Failed to load programmes'));
  }, []);

  // ── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: initialValues ?? EMPTY_FORM,
    validationSchema: academicInfoValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => onSubmit(values),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStateChange = (e) => {
    const stateName = e.target.value;
    formik.setFieldValue('previous_school_state', stateName);
    formik.setFieldValue('previous_school_lga', '');
    const found = NIGERIA_STATES.find((s) => s.name === stateName);
    setLgas(found?.lgas ?? []);
  };

  const handleProgrammeChange = (e) => {
    const progId = e.target.value;
    formik.setFieldValue('programme_id', progId);
    formik.setFieldValue('class_id', '');
    const found = programmes.find((p) => String(p.id) === String(progId));
    setClasses(found?.classes ?? []);
  };

  // Restore classes when editing with an existing programme_id
  useEffect(() => {
    if (formik.values.programme_id && programmes.length > 0) {
      const found = programmes.find((p) => String(p.id) === String(formik.values.programme_id));
      setClasses(found?.classes ?? []);
    }
  }, [programmes]);

  const hasPrev = formik.values.has_previous_school;
  const fe = formik.errors;
  const ft = formik.touched;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Academic information
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ── Previous school ── */}
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Previous school information
      </Typography>

      {/* Toggle row */}
      <Alert
        severity="info"
        sx={{
          mb: 2.5,
          bgcolor: '#F0F9FF',
          '& .MuiAlert-message': { width: '100%', p: 0 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">Does your ward have Previous school information</Typography>
          <Checkbox
            name="has_previous_school"
            checked={formik.values.has_previous_school}
            onChange={formik.handleChange}
            color="primary"
            sx={{ p: 0.5 }}
          />
        </Box>
      </Alert>

      {/* Previous school fields */}
      {hasPrev && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Previous school name"
              name="previous_school_name"
              value={formik.values.previous_school_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={ft.previous_school_name && Boolean(fe.previous_school_name)}
              helperText={ft.previous_school_name && fe.previous_school_name}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl
              fullWidth
              error={ft.previous_school_state && Boolean(fe.previous_school_state)}
            >
              <InputLabel>State</InputLabel>
              <Select
                name="previous_school_state"
                value={formik.values.previous_school_state}
                onChange={handleStateChange}
                onBlur={formik.handleBlur}
                label="State"
              >
                {NIGERIA_STATES.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl
              fullWidth
              error={ft.previous_school_lga && Boolean(fe.previous_school_lga)}
              disabled={lgas.length === 0}
            >
              <InputLabel>LGA</InputLabel>
              <Select
                name="previous_school_lga"
                value={formik.values.previous_school_lga}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="LGA"
              >
                {lgas.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Previous Class"
              name="previous_class"
              value={formik.values.previous_class}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={ft.previous_class && Boolean(fe.previous_class)}
              helperText={ft.previous_class && fe.previous_class}
            />
          </Grid>
        </Grid>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* ── Intending class ── */}
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Intending Class
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={ft.programme_id && Boolean(fe.programme_id)}>
            <InputLabel>Programme</InputLabel>
            <Select
              name="programme_id"
              value={formik.values.programme_id}
              onChange={handleProgrammeChange}
              onBlur={formik.handleBlur}
              label="Programme"
            >
              {programmes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={ft.class_id && Boolean(fe.class_id)}
            disabled={classes.length === 0}
          >
            <InputLabel>Class Choice</InputLabel>
            <Select
              name="class_id"
              value={formik.values.class_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Class Choice"
            >
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={ft.boarding_status && Boolean(fe.boarding_status)}>
            <InputLabel>Boarding Status</InputLabel>
            <Select
              name="boarding_status"
              value={formik.values.boarding_status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Boarding Status"
            >
              <MenuItem value="day">Day Student</MenuItem>
              <MenuItem value="boarding">Boarding Student</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Footer — matches ParentForm action row */}
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

AcademicInfoForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AcademicInfoForm;
