import React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Paper,
  Divider,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const colors = [
  '#7F8C8D',
  '#BDC3C7',
  '#1ABC9C',
  '#3498DB',
  '#F1C40F',
  '#E67E22',
  '#E74C3C',
  '#ECF0F1',
  '#9B59B6',
  '#34495E',
  '#2C3E50',
  '#95A5A6',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#D35400',
  '#C0392B',
  '#F39C12',
  '#2ECC71',
];

const ColorSelector = ({ label, value, onChange }) => (
  <Grid item xs={12} md={4}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        onClick={() => onChange('')}
      >
        Default
      </Button>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {colors.map((color, index) => (
          <Box
            key={index}
            onClick={() => onChange(color)}
            sx={{
              width: 24,
              height: 24,
              bgcolor: color,
              borderRadius: '50%',
              border: value === color ? '3px solid #1976d2' : '1px solid #ccc',
              cursor: 'pointer',
              mx: 'auto',
              transition: 'border 0.2s ease',
              '&:hover': {
                border: '2px solid #1976d2',
              },
            }}
          />
        ))}
      </Box>
      {value && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Selected:
          </Typography>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: value,
              borderRadius: '50%',
              border: '1px solid #ccc',
            }}
          />
          <Typography variant="caption" color="textSecondary">
            {value}
          </Typography>
        </Box>
      )}
    </Paper>
  </Grid>
);

import { useState } from 'react';

const AddAgentModal = ({ open, onClose, handleRefresh }) => {

  const [headerColor, setHeaderColor] = useState('');
  const [sidebarColor, setSidebarColor] = useState('');
  const [bodyColor, setBodyColor] = useState('');
  const [formData, setFormData] = useState({
    s_n: 0,
    organizationName: '',
    organizationTitle: '',
    agentDetails: '',
    contactDetails: '',
    agentPhone: '',
    contactAddress: '',
    stateFilter: '',
    lga: '',
    performance: '',
    gateway: '',
    colourScheme: '',
    status: '',
    action: '',
  });

  const resetForm = () => {
    setFormData({
      s_n: 0,
      organizationName: '',
      organizationTitle: '',
      agentDetails: '',
      contactDetails: '',
      agentPhone: '',
      contactAddress: '',
      stateFilter: '',
      lga: '',
      performance: '',
      gateway: '',
      colourScheme: '',
      status: '',
      action: '',
    });
  }


  const handleSaveClick = () => {
    const updatedData = {
      ...formData,
      performance: 'N/A',
      gateway: 'N/A',
      colourScheme: bodyColor || 'Default',
      headerColor: headerColor || 'Default',
      sidebarColor: sidebarColor || 'Default',
      status: 'Inactive',
      action: 'Edit',
      s_n: formData.s_n += 1,
    };


    setFormData(updatedData);
    handleRefresh(updatedData);
    resetForm();
    setHeaderColor('');
    setSidebarColor('');
    setBodyColor('');
    onClose();
  };
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Create Agent
        </Typography>
        <Divider sx={{ mb: 2 }} />
  
        <Grid container spacing={2} mb={3}>
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <TextField
              label="Organization Name"
              fullWidth
              value={formData.organizationName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, organizationName: e.target.value }))
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <TextField
              label="Organization Title"
              fullWidth
              value={formData.organizationTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, organizationTitle: e.target.value }))
              }
            />
          </Grid>
  
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <TextField
              label="Agent Name"
              fullWidth
              value={formData.agentDetails}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, agentDetails: e.target.value }))
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <TextField
              label="Agent Email"
              fullWidth
              value={formData.contactDetails}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactDetails: e.target.value }))
              }
            />
          </Grid>
  
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <TextField
              label="Agent Phone"
              placeholder="(+234)-801-2345-678"
              fullWidth
              value={formData.agentPhone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, agentPhone: e.target.value }))
              }
            />
          </Grid>
  
          <Grid item size={{ xs: 12, md: 12, sm: 4 }}>
            <TextField
              label="Contact Address"
              fullWidth
              value={formData.contactAddress}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactAddress: e.target.value }))
              }
            />
          </Grid>
  
          <Grid item size={{ xs: 12, md: 6, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>State Filter</InputLabel>
              <Select
                value={formData.stateFilter}
                label="State Filter"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stateFilter: e.target.value }))
                }
              >
                <MenuItem value="">-- Choose --</MenuItem>
                <MenuItem value="lagos">Lagos</MenuItem>
                <MenuItem value="abuja">Abuja</MenuItem>
              </Select>
            </FormControl>
          </Grid>
  
          <Grid item xs={12} sm={3} md={6}>
            <TextField
              label="Lga"
              fullWidth
              value={formData.lga}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lga: e.target.value }))
              }
            />
          </Grid>
  
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <ColorSelector
                label="Choose Header Color Scheme"
                value={headerColor}
                onChange={(color) => setHeaderColor(color)}
              />
              <ColorSelector
                label="Choose Sidebar Color Scheme"
                value={sidebarColor}
                onChange={(color) => setSidebarColor(color)}
              />
              <ColorSelector
                label="Choose Body Color Scheme"
                value={bodyColor}
                onChange={(color) => setBodyColor(color)}
              />
            </Grid>
          </Grid>
        </Grid>
  
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveClick}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
  
};

export default AddAgentModal;
