import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Button,
  TextField,
  Grid,
  Paper,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';


const infoBoxStyle = {
  bgcolor: '#e6f4ff',
  color: '#333',
  borderRadius: 1,
  p: 2,
  mb: 3,
  fontSize: '0.875rem',
};

const SetCommissionModal = ({ open, onClose, selectedAgent, onSave }) => {
  const [maxCommission, setMaxCommission] = useState(100);
  const [remainingCommission, setRemainingCommission] = useState(100);

  const validationSchema = yup.object({
    commissionPercentage: yup
      .number()
      .min(0, 'Minimum is 0%')
      .max(100, 'Maximum is 100%')
      .required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      commissionPercentage: selectedAgent?.commissionPercentage || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedAgent = {
        ...selectedAgent,
        commissionPercentage: values.commissionPercentage,
        lastCommissionUpdate: new Date().toISOString(),
      };
      onSave(updatedAgent);
      onClose();
    },
  });

  useEffect(() => {
    const refCommission = selectedAgent?.referrerCommission || 100;
    setMaxCommission(refCommission);
    const current = formik.values.commissionPercentage || 0;
    setRemainingCommission(refCommission - current);
  }, [formik.values.commissionPercentage, selectedAgent]);

  const handleInputChange = (e) => {
    const val = Math.max(0, Math.min(maxCommission, Number(e.target.value)));
    formik.setFieldValue('commissionPercentage', val);
    setRemainingCommission(maxCommission - val);
  };

  return (
    <Box>
      <Box sx={infoBoxStyle}>
          For every school you or agent(s) under you register, you are allotted 100% as commission.
          Whatever percentage you set as commission for the agent(s) under you, will be deducted
          from the total percentage allotted to you.
        </Box>

        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 12 }}>
            <TextField
              label="Referrer Name"
              value={selectedAgent?.referrerName || 'Crownbirth Limited'}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 12 }}>
            <TextField
              label="Referrer Commission %"
              value={selectedAgent?.referrerCommission || 100}
              fullWidth
              InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              variant="outlined"
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 12 }}>
            <FormControl fullWidth>
              <OutlinedInput
                placeholder="Set Commission %"
                value={formik.values.commissionPercentage}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
                endAdornment={<InputAdornment position="end">of 100%</InputAdornment>}
                error={formik.touched.commissionPercentage && Boolean(formik.errors.commissionPercentage)}
                type="number"
              />
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#f9a825',
              color: '#fff',
              '&:hover': { bgcolor: '#f57f17' },
            }}
            disabled={!formik.isValid}
          >
            Update
          </Button>
        </Box>
      </Box>
  );
};

export default SetCommissionModal;
