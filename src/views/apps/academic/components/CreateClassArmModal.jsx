import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';

// Styled components
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f5f5f5',
    '& fieldset': {
      border: 'none',
    },
  },
}));

const StyledInfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#e0f7fa',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  color: '#00695c',
}));

// Validation schema
const classArmValidationSchema = Yup.object({
  selectedClass: Yup.string().required('Class is required'),
  status: Yup.string().required('Status is required'),
  selectedArms: Yup.array()
    .min(1, 'At least one arm must be selected')
    .required('Arms are required'),
});

const CreateClassArmModal = ({ open, onClose, onSave, programme, editMode = false, initialData = null }) => {
  // List of arms
  const arms = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ];

  // Define class options based on programme type
  const getClassOptions = () => {
    const programmeName = programme?.name?.toLowerCase() || '';
    if (programmeName.includes('primary')) {
      return [
        { value: 'Primary 1', label: 'Primary 1' },
        { value: 'Primary 2', label: 'Primary 2' },
        { value: 'Primary 3', label: 'Primary 3' },
        { value: 'Primary 4', label: 'Primary 4' },
        { value: 'Primary 5', label: 'Primary 5' },
        { value: 'Primary 6', label: 'Primary 6' },
      ];
    } else if (programmeName.includes('junior') || programmeName.includes('jss')) {
      return [
        { value: 'Junior Secondary 1', label: 'Junior Secondary 1' },
        { value: 'Junior Secondary 2', label: 'Junior Secondary 2' },
        { value: 'Junior Secondary 3', label: 'Junior Secondary 3' },
      ];
    } else if (programmeName.includes('senior') || programmeName.includes('sss')) {
      return [
        { value: 'Senior Secondary 1', label: 'Senior Secondary 1' },
        { value: 'Senior Secondary 2', label: 'Senior Secondary 2' },
        { value: 'Senior Secondary 3', label: 'Senior Secondary 3' },
      ];
    } else {
      return [
        { value: 'KG', label: 'KG' },
        { value: 'Nursery 1', label: 'Nursery 1' },
        { value: 'Nursery 2', label: 'Nursery 2' },
      ];
    }
  };

  const classOptions = getClassOptions();

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      selectedClass: '',
      status: '',
      selectedArms: [],
    },
    validationSchema: classArmValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const classArmData = {
        class: values.selectedClass,
        status: values.status,
        arms: values.selectedArms,
        id: initialData?.id || Date.now(), // Include ID for editing
      };
      onSave(classArmData);
      handleClose();
    },
  });

  // Handle "Select All" checkbox
  const handleSelectAll = (checked) => {
    formik.setFieldValue('selectedArms', checked ? arms : []);
    formik.setFieldTouched('selectedArms', true);
  };

  // Handle individual arm checkbox changes
  const handleArmChange = (arm, checked) => {
    const updatedArms = checked
      ? [...formik.values.selectedArms, arm]
      : formik.values.selectedArms.filter((a) => a !== arm);
    formik.setFieldValue('selectedArms', updatedArms);
    formik.setFieldTouched('selectedArms', true);
  };

  // Handle modal close and form reset
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Sync initialData when editing
  useEffect(() => {
    if (editMode && initialData && open) {
      formik.setValues({
        selectedClass: initialData.name || '',
        status: initialData.status || '',
        selectedArms: initialData.arms || [],
      });
    } else if (!editMode && open) {
      formik.resetForm();
    }
  }, [editMode, initialData, open]);

  // Derive selectAll state
  const selectAll = formik.values.selectedArms.length === arms.length && arms.length > 0;

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={editMode ? 'Edit Class Arm' : 'Create Class Arm'}
      size="medium"
      maxWidth="md"
    >
      <Box>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
              <StyledFormControl
                fullWidth
                error={formik.touched.selectedClass && Boolean(formik.errors.selectedClass)}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  name="selectedClass"
                  value={formik.values.selectedClass}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  displayEmpty
                  sx={{ height: 48 }}
                >
                  {classOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.selectedClass && formik.errors.selectedClass && (
                  <FormHelperText>{formik.errors.selectedClass}</FormHelperText>
                )}
              </StyledFormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledFormControl
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{ height: 48 }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </StyledFormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledInfoBox>
                <Typography variant="body2">Select arms to be attached to class</Typography>
              </StyledInfoBox>
              <FormControl
                error={formik.touched.selectedArms && Boolean(formik.errors.selectedArms)}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  }
                  label="Select All"
                  sx={{ mb: 2, fontWeight: 500 }}
                />
                <Grid container spacing={1}>
                  {arms.map((arm) => (
                    <Grid item xs={2} key={arm}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formik.values.selectedArms.includes(arm)}
                            onChange={(e) => handleArmChange(arm, e.target.checked)}
                          />
                        }
                        label={arm}
                        sx={{
                          m: 0,
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.875rem',
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                {formik.touched.selectedArms && formik.errors.selectedArms && (
                  <FormHelperText>{formik.errors.selectedArms}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                textTransform: 'none',
                borderColor: '#d1d5db',
                color: '#6b7280',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                formik.isSubmitting ||
                !formik.values.selectedClass ||
                !formik.values.status ||
                formik.values.selectedArms.length === 0
              }
              sx={{
                backgroundColor: '#7C3AED',
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#6d28d9',
                },
              }}
            >
              {editMode ? 'Update Class Arm' : 'Attach Class Arm'}
            </Button>
          </Box>
        </form>
      </Box>
    </ReusableModal>
  );
};

CreateClassArmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  programme: PropTypes.shape({
    name: PropTypes.string,
  }),
  editMode: PropTypes.bool,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    status: PropTypes.string,
    arms: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

CreateClassArmModal.defaultProps = {
  editMode: false,
  initialData: null,
  programme: null,
};

export default CreateClassArmModal;