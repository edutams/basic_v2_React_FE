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
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import aclApi from 'src/api/aclApi';

/**
 * Tenant-specific RoleAttachmentModal that uses school roles instead of agent roles
 */
const RoleAttachmentModal = ({ open, onClose, currentUser, onRoleSelection }) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      // Get current role IDs from the user
      const initialSelectedIds = currentUser?.assignedRoles?.map((r) => r.id) || [];
      setSelectedRoleIds(initialSelectedIds);
      setSearchTerm('');
      fetchRoles();
    }
  }, [currentUser, open]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      // Use school roles API (tenant-specific) instead of agent roles
      const res = await aclApi.getSchoolRolesList();
      setAvailableRoles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch school roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const toggleRole = (role) => {
    const roleId = role.id;
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleAttach = () => {
    onRoleSelection(selectedRoleIds);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Attach Roles to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Select school roles to attach to this user:
        </Typography>

        <TextField
          autoFocus
          placeholder="Search Roles"
          type="text"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="textSecondary" sx={{ mb: 2 }}>
          Current roles: {selectedRoleIds.length} roles assigned
        </Typography>

        {loadingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {availableRoles
              .filter((role) => role.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((role) => (
                <ListItem key={role.id} disablePadding sx={{ padding: '4px 8px' }}>
                  <ListItemButton
                    onClick={() => toggleRole(role)}
                    sx={{
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedRoleIds.includes(role.id)}
                      sx={{ marginRight: 1 }}
                    />
                    <ListItemText
                      primary={role.name}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleAttach}>
          Attach Roles
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAttachmentModal;
