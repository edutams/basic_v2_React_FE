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
  // safe default to avoid undefined errors
  const safeAvailablePermissions = availablePermissions || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Attach Permissions to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{selectedRow?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select permissions to attach to this role:
        </Typography>

        <TextField
          autoFocus
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
            safeAvailablePermissions.filter((permission) =>
              permission?.name?.toLowerCase()?.includes(permissionSearch.toLowerCase()),
            ).length
          }{' '}
          permissions
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          {safeAvailablePermissions
            .filter((permission) =>
              permission?.name?.toLowerCase()?.includes(permissionSearch.toLowerCase()),
            )

            .map((permission) => (
              <ListItem
                key={permission.id}
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
                    // checked={selectedPermissions.includes(permission)}
                    checked={selectedPermissions.some((p) => p.id === permission.id)}
                    onChange={() => onPermissionChange(permission)}
                    sx={{ marginRight: 1 }}
                  />
                  <ListItemText
                    primary={permission.name}
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
