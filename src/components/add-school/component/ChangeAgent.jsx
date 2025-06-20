
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from '@mui/material';

const ChangeAgentModal = ({ open, onClose, agentList = [], selectedAgent, onAgentChange, onSubmit }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          maxWidth: 500,
          mx: 'auto',
          mt: 10,
          bgcolor: 'white',
          borderRadius: 2,
          p: 3,
          outline: 'none',
        }}
      >
        <Typography variant="h3" gutterBottom>
          Change School's Agent
        </Typography>

        <Paper elevation={0} sx={{ p: 2, backgroundColor: '#e6f3ff', borderRadius: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Select Agent</InputLabel>
            <Select value={selectedAgent} onChange={onAgentChange} label="Select Agent">
              {agentList.map((agent, index) => (
                <MenuItem key={index} value={agent.value}>
                  {agent.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Grid container spacing={2} justifyContent="flex-end" mt={3}>
          <Grid item>
            <Button onClick={onClose} >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={onSubmit} variant="contained" sx={{ bgcolor: '#f7a400' }}>
              Change Agent
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ChangeAgentModal;
