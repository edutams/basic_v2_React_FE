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
import { getClassArms, getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';

const AddLearnerModal = ({
  open,
  onClose,
  classId,        // optional — if omitted a class dropdown is shown
  className,
  onSave,
  isLoading = false,
}) => {
  const [classArms, setClassArms]   = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // load flat class list when no classId is pre-supplied
  useEffect(() => {
    if (classId || !open) return;
    getClassesWithDivisions()
      .then((data) => {
        const flat = [];
        (data || []).forEach((div) =>
          (div.programmes || []).forEach((prog) =>
            (prog.classes || []).forEach((cls) => {
              if (cls.status === 'active') {
                flat.push({
                  id: cls.id,
                  label: `${prog.programme_code} - ${cls.class_code}`,
                });
              }
            })
          )
        );
        setAllClasses(flat);
      })
      .catch(console.error);
  }, [open, classId]);

  // load arms whenever the effective classId changes
  const fetchArms = async (id) => {
    if (!id) { setClassArms([]); return; }
    try {
      const response = await getClassArms(id);
      setClassArms(response?.data?.data || response?.data || response || []);
    } catch (error) {
      console.error('Failed to fetch arms:', error);
    }
  };

  useEffect(() => {
    if (classId) fetchArms(classId);
  }, [classId]);

  const formik = useFormik({
    initialValues: {
      learner_id:   '',
      class_id:     classId || '',
      class_arm_id: '',
      last_name:    '',
      first_name:   '',
      middle_name:  '',
      gender:       '',
      date_of_birth: null,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave(values);
      onClose();
    },
  });

  // reset form every time the modal opens
  useEffect(() => {
    if (open) {
      formik.resetForm();
      setClassArms([]);
      if (classId) fetchArms(classId);
    }
  }, [open]);

  // when class_id changes inside the form (dropdown mode), reload arms
  const handleClassChange = (e) => {
    formik.setFieldValue('class_id', e.target.value);
    formik.setFieldValue('class_arm_id', '');
    fetchArms(e.target.value);
  };

  const isValid =
    formik.values.last_name &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.class_id &&
    formik.values.class_arm_id;

  const renderTitle = () =>
    classId ? (
      <>
        Add New Learner —{' '}
        <Typography component="span" color="primary" fontWeight={600}>
          {className}
        </Typography>
      </>
    ) : (
      'Add New Learner'
    );

  return (
    <ReusableModal open={open} onClose={onClose} title={renderTitle()} size="medium">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="form" onSubmit={formik.handleSubmit}>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Learner ID"
              name="learner_id"
              value={formik.values.learner_id}
              onChange={formik.handleChange}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="Last Name" name="last_name" value={formik.values.last_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="First Name" name="first_name" value={formik.values.first_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="Middle Name" name="middle_name" value={formik.values.middle_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formik.values.gender} onChange={formik.handleChange} label="Gender">
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

            {/* Class dropdown — only shown when classId is not pre-supplied */}
            {!classId && (
              <Box sx={{ flex: '1 1 45%' }}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select value={formik.values.class_id} onChange={handleClassChange} label="Class">
                    <MenuItem value="">Select Class</MenuItem>
                    {allClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Arm</InputLabel>
              <Select name="class_arm_id" value={formik.values.class_arm_id}
                onChange={formik.handleChange} label="Arm"
                disabled={!formik.values.class_id}>
                <MenuItem value="">Select Arm</MenuItem>
                {classArms.map((arm) => (
                  <MenuItem key={arm.id} value={arm.id}>
                    {arm.display_name || arm.arm_names || `Arm ${arm.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button variant="contained" type="submit" disabled={isLoading || !isValid}>
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
  classId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddLearnerModal;