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

const PermissionAttachmentModal = ({
  open,
  onClose,
  selectedRow,
  availablePermissions,
  selectedPermissions,
  permissionSearch,
  onPermissionSearchChange,
  onPermissionChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Attach Permissions to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{selectedRow?.roleName}"
        </Box>{' '}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select permissions to attach to this role:
        </Typography>
        <TextField
          autoFocus
          // margin="dense"
          placeholder="Search Permissions"
          type="text"
          fullWidth
          variant="outlined"
          value={permissionSearch}
          onChange={(e) => onPermissionSearchChange(e.target.value)}
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
          Selected: {selectedPermissions.length} of{' '}
          {
            availablePermissions.filter((permission) =>
              permission.toLowerCase().includes(permissionSearch.toLowerCase()),
            ).length
          }{' '}
          permissions
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {availablePermissions
            .filter((permission) =>
              permission.toLowerCase().includes(permissionSearch.toLowerCase()),
            )
            .map((permission) => (
              <ListItem
                key={permission}
                disablePadding
                sx={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }}
              >
                <ListItemButton
                  onClick={() => onPermissionChange(permission)}
                  sx={{
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => onPermissionChange(permission)}
                    sx={{ marginRight: 1 }}
                  />
                  <ListItemText
                    primary={permission}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Attach Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionAttachmentModal;
