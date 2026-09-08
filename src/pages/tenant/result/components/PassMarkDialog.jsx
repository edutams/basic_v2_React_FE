import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Grid, Alert,
} from '@mui/material';

const PassMarkDialog = ({ open, onClose, onSave, data, divisionName, isSchoolUser }) => {
  const [statePassMark, setStatePassMark] = useState('');
  const [schoolAdopted, setSchoolAdopted] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (open) {
      setStatePassMark(data?.statePassMark ?? '');
      setSchoolAdopted(data?.schoolAdopted ?? data?.statePassMark ?? '');
      setErrors([]);
    }
  }, [open, data]);

  const validate = () => {
    const errs = [];
    if (isSchoolUser) {
      if (schoolAdopted === '' || schoolAdopted === null) {
        errs.push('School pass mark is required');
      } else if (Number(schoolAdopted) < 0 || Number(schoolAdopted) > 100) {
        errs.push('School pass mark must be between 0 and 100');
      }
      if (statePassMark !== '' && schoolAdopted !== '' && Number(schoolAdopted) < Number(statePassMark)) {
        errs.push('School pass mark cannot be lower than state pass mark');
      }
    } else {
      if (statePassMark === '' || statePassMark === null) {
        errs.push('State pass mark is required');
      } else if (Number(statePassMark) < 0 || Number(statePassMark) > 100) {
        errs.push('Pass mark must be between 0 and 100');
      }
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ statePassMark: Number(statePassMark), schoolAdopted: schoolAdopted !== '' ? Number(schoolAdopted) : null });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Pass Mark Configuration — {divisionName}
      </DialogTitle>
      <DialogContent dividers>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </Alert>
        )}

        {isSchoolUser ? (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              State Pass Mark: <strong>{statePassMark || 'Not set'}</strong>
            </Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning" sx={{ mb: 1 }}>School Pass Mark</Alert>
                <TextField
                  label="School Pass Mark" fullWidth size="small" type="number"
                  placeholder="Enter School Pass Mark"
                  value={schoolAdopted}
                  onChange={(e) => setSchoolAdopted(e.target.value)}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>State Pass Mark</Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Pass Mark" fullWidth size="small" type="number"
                  placeholder="Enter Pass Mark"
                  value={statePassMark}
                  onChange={(e) => setStatePassMark(e.target.value)}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PassMarkDialog;
