import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Checkbox,
  ListItemText,
  ListItem,
  ListItemButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const RoleAttachmentModal = ({ open, onClose, currentAgent, onRoleSelection }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    setSelectedRoles(currentAgent?.assignedRoles || []);
  }, [currentAgent]);

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const allRoles = ['Admin', 'Customer', 'Manager', 'Agent', 'Super_Admin'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Attach Roles to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentAgent?.name}"
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select roles to attach to this agent:
        </Typography>

        <TextField
          autoFocus
          placeholder="Search Roles"
          type="text"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="textSecondary" sx={{ mb: 2 }}>
          Current roles: {selectedRoles.length} roles assigned
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {allRoles.map((role) => (
            <ListItem key={role} disablePadding sx={{ padding: '4px 8px' }}>
              <ListItemButton
                onClick={() => toggleRole(role)}
                sx={{ padding: '4px 8px', display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <Checkbox
                  size="small"
                  checked={selectedRoles.includes(role)}
                  sx={{ marginRight: 1 }}
                />
                <ListItemText primary={role} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={() => onRoleSelection(selectedRoles)}>
          Attach Roles
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAttachmentModal;
