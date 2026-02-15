import React from 'react';
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
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const RoleAttachmentModal = ({ open, onClose, currentUser, onRoleSelection }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Attach Roles to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select roles to attach to this user:
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
          Current roles: {currentUser?.assignedRoles?.length || 0} roles assigned
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {['Admin', 'Customer', 'Manager', 'Agent', 'Super_Admin'].map((role) => (
            <ListItem
              key={role}
              disablePadding
              sx={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }}
            >
              <ListItemButton
                onClick={() => onRoleSelection(role)}
                sx={{ padding: '4px 8px', display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <Checkbox
                  size="small"
                  checked={currentUser?.assignedRoles?.includes(role) || false}
                  onChange={() => onRoleSelection(role)}
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
        <Button onClick={onClose} variant="contained" color="primary">
          Attach Roles
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAttachmentModal;
