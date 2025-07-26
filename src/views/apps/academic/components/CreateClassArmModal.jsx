import React from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ReusableModal from 'src/components/shared/ReusableModal';

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

const CreateClassArmModal = ({ open, onClose, onSave }) => {
  const [selectedClass, setSelectedClass] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [selectedArms, setSelectedArms] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);

  const arms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const handleArmChange = (arm, checked) => {
    if (checked) {
      setSelectedArms(prev => [...prev, arm]);
    } else {
      setSelectedArms(prev => prev.filter(a => a !== arm));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedArms([...arms]);
    } else {
      setSelectedArms([]);
    }
  };

  const handleSave = () => {
    const classArmData = {
      class: selectedClass,
      status,
      arms: selectedArms,
    };
    onSave(classArmData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedClass('');
    setStatus('');
    setSelectedArms([]);
    setSelectAll(false);
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title="Create Class Arm"
      size="medium"
      maxWidth="md"
    >
      <Box sx={{ p: 3 }}>
        {/* Attached Class Arm Dropdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
            Attached Class Arm
          </Typography>
          <StyledFormControl fullWidth>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              displayEmpty
              sx={{ height: 48 }}
            >
              <MenuItem value="" disabled>
                --Choose--
              </MenuItem>
              <MenuItem value="KG">KG</MenuItem>
              <MenuItem value="Nursery">Nursery</MenuItem>
              <MenuItem value="Primary">Primary</MenuItem>
            </Select>
          </StyledFormControl>
        </Box>

        {/* Status Dropdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
            Status
          </Typography>
          <StyledFormControl fullWidth>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
              sx={{ height: 48 }}
            >
              <MenuItem value="" disabled>
                --Choose--
              </MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </StyledFormControl>
        </Box>

        {/* System Arms */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
            System Arms
          </Typography>
          
          <StyledInfoBox>
            <Typography variant="body2">
              Select arms to be attached to class
            </Typography>
          </StyledInfoBox>

          {/* Select All */}
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

          {/* Arms Grid */}
          <Grid container spacing={1}>
            {arms.map((arm) => (
              <Grid item xs={2} key={arm}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedArms.includes(arm)}
                      onChange={(e) => handleArmChange(arm, e.target.checked)}
                    />
                  }
                  label={arm}
                  sx={{ 
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Action Buttons */}
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
            variant="contained"
            onClick={handleSave}
            disabled={!selectedClass || !status || selectedArms.length === 0}
            sx={{
              backgroundColor: '#7C3AED',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#6d28d9',
              },
            }}
          >
            Attach Class Arm
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

export default CreateClassArmModal;