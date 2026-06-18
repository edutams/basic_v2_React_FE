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
import aclApi from '@/api/tenant/acl/aclApi';

const RoleAttachmentModal = ({ open, onClose, currentUser, onRoleSelection }) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      const initialSelectedIds = currentUser?.assignedRoles?.map((r) => r.id) || [];
      setSelectedRoleIds(initialSelectedIds);
      setSearchTerm('');
      fetchRoles();
    }
  }, [currentUser, open]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
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

  const filteredRoles = availableRoles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Attach Roles to{' '}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          "{currentUser?.name}"
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 2 }}>
          <Typography variant="body1">Select school roles to attach to this user:</Typography>
        </Box>

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'background.paper',
            p: 2,
            borderBottom: '1px solid #eee',
          }}
        >
          <TextField
            autoFocus
            placeholder="Search Roles"
            fullWidth
            size="small"
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

          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Current roles: {selectedRoleIds.length} roles assigned
          </Typography>
        </Box>

        {/* 🔽 Scrollable List */}
        {loadingRoles ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              maxHeight: 350,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
            }}
          >
            {filteredRoles.map((role) => (
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
                  <ListItemText primary={role.name} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAttach}>Attach Roles</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleAttachmentModal;
