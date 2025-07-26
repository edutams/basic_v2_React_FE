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

const CreateClassArmModal = ({ open, onClose, onSave, programme, editMode = false, initialData = null }) => {
  const [selectedClass, setSelectedClass] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [selectedArms, setSelectedArms] = React.useState([]);
  const [selectAll, setSelectAll] = React.useState(false);

  const arms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
      // Default options for other programmes
      return [
        { value: 'KG', label: 'KG' },
        { value: 'Nursery', label: 'Nursery' },
        { value: 'Pre-Nursery', label: 'Pre-Nursery' },
      ];
    }
  };

  const classOptions = getClassOptions();

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

  // Initialize form with existing data when editing
  React.useEffect(() => {
    if (editMode && initialData) {
      setSelectedClass(initialData.name || '');
      setStatus(initialData.status || '');
      setSelectedArms(initialData.arms || []);
      setSelectAll(initialData.arms?.length === arms.length);
    } else if (!editMode) {
      setSelectedClass('');
      setStatus('');
      setSelectedArms([]);
      setSelectAll(false);
    }
  }, [editMode, initialData, open]);

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={editMode ? "Edit Class Arm" : "Create Class Arm"}
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
              {classOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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
            {editMode ? "Update Class Arm" : "Attach Class Arm"}
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

export default CreateClassArmModal;
