import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getClassArms } from '../../../context/TenantContext/services/tenant.service';

const AddLearnerModal = ({
  open,
  onClose,
  classId,
  className,
  onSave,
  isLoading = false,
}) => {
  const [classArms, setClassArms] = useState([]);

  useEffect(() => {
    const fetchArms = async () => {
      if (classId) {
        try {
          const response = await getClassArms(classId);
          const arms = response?.data?.data || response?.data || response || [];
          setClassArms(arms);
        } catch (error) {
          console.error('Failed to fetch arms:', error);
        }
      }
    };
    fetchArms();
  }, [classId]);

  const formik = useFormik({
    initialValues: {
      learner_id: '',
      class_id: classId || '',
      class_arm_id: '',
      last_name: '',
      first_name: '',
      other_name: '',
      gender: '',
      date_of_birth: null,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave(values);
      onClose();
    },
  });

  const isValid =
    formik.values.last_name &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.class_arm_id;

  const renderTitle = () => (
    <>
      Add New Learner -{' '}
      <Typography component="span" color="primary" fontWeight={600}>
        {className}
      </Typography>
    </>
  );

  return (
    <ReusableModal open={open} onClose={onClose} title={renderTitle()} size="medium">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Learner ID"
              name="learner_id"
              value={formik.values.learner_id || ''}
              onChange={formik.handleChange}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField
                label="Last Name"
                name="last_name"
                value={formik.values.last_name || ''}
                onChange={formik.handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField
                label="First Name"
                name="first_name"
                value={formik.values.first_name || ''}
                onChange={formik.handleChange}
                fullWidth
                required
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField
                label="Middle Name"
                name="middle_name"
                value={formik.values.middle_name || ''}
                onChange={formik.handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formik.values.gender || ''}
                  onChange={formik.handleChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <DatePicker
                label="Date of Birth"
                value={formik.values.date_of_birth}
                onChange={(val) => formik.setFieldValue('date_of_birth', val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Box sx={{ flex: '1 1 45%' }}>
              <FormControl fullWidth>
                <InputLabel>Arm</InputLabel>
                <Select
                  name="class_arm_id"
                  value={formik.values.class_arm_id || ''}
                  onChange={formik.handleChange}
                  label="Arm"
                >
                  {classArms.map((arm) => (
                    <MenuItem key={arm.id} value={arm.id}>
                      {arm.display_name || arm.arm_names || `Arm ${arm.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !isValid}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    </ReusableModal>
  );
};

AddLearnerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.number,
  className: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddLearnerModal;