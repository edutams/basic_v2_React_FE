import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';

// Available permissions grouped by category
const permissionCategories = {
  'School Management': [
    { id: 'create_school', label: 'Create School', description: 'Can create new schools' },
    { id: 'edit_school', label: 'Edit School', description: 'Can modify school information' },
    { id: 'delete_school', label: 'Delete School', description: 'Can remove schools' },
    { id: 'view_schools', label: 'View Schools', description: 'Can view school list and details' },
  ],
  'User Management': [
    { id: 'create_user', label: 'Create User', description: 'Can create new users' },
    { id: 'edit_user', label: 'Edit User', description: 'Can modify user information' },
    { id: 'delete_user', label: 'Delete User', description: 'Can remove users' },
    { id: 'view_users', label: 'View Users', description: 'Can view user list and profiles' },
  ],
  'Reports & Analytics': [
    { id: 'view_reports', label: 'View Reports', description: 'Can access reports and analytics' },
    { id: 'export_data', label: 'Export Data', description: 'Can export data and reports' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Can access analytics dashboard' },
  ],
  'Financial Management': [
    { id: 'view_payments', label: 'View Payments', description: 'Can view payment information' },
    { id: 'manage_commissions', label: 'Manage Commissions', description: 'Can manage commission settings' },
    { id: 'view_financial_reports', label: 'Financial Reports', description: 'Can access financial reports' },
  ],
  'System Administration': [
    { id: 'manage_settings', label: 'Manage Settings', description: 'Can modify system settings' },
    { id: 'manage_permissions', label: 'Manage Permissions', description: 'Can modify user permissions' },
    { id: 'system_backup', label: 'System Backup', description: 'Can perform system backups' },
  ],
};

const PermissionManager = ({ selectedAgent, onSave, onCancel }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(
    selectedAgent?.permissions || []
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionChange = (permissionId, checked) => {
    let newPermissions;
    if (checked) {
      newPermissions = [...selectedPermissions, permissionId];
    } else {
      newPermissions = selectedPermissions.filter(id => id !== permissionId);
    }
    
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSelectAll = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryIds.every(id => selectedPermissions.includes(id));
    
    let newPermissions;
    if (allSelected) {
      // Deselect all in this category
      newPermissions = selectedPermissions.filter(id => !categoryIds.includes(id));
    } else {
      // Select all in this category
      const toAdd = categoryIds.filter(id => !selectedPermissions.includes(id));
      newPermissions = [...selectedPermissions, ...toAdd];
    }
    
    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedAgent = {
      ...selectedAgent,
      permissions: selectedPermissions,
    };
    onSave(updatedAgent);
  };

  const getPermissionCount = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map(p => p.id);
    return selectedPermissions.filter(id => categoryIds.includes(id)).length;
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Manage Permissions for {selectedAgent?.agentDetails || selectedAgent?.organizationName}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Select the permissions you want to grant to this agent. Changes will take effect immediately after saving.
      </Alert>

      <Grid container spacing={3}>
        {Object.entries(permissionCategories).map(([category, permissions]) => {
          const selectedCount = getPermissionCount(permissions);
          const allSelected = selectedCount === permissions.length;
          const someSelected = selectedCount > 0 && selectedCount < permissions.length;

          return (
            <Grid item xs={12} md={6} key={category}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    {category}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={`${selectedCount}/${permissions.length}`} 
                      size="small" 
                      color={selectedCount > 0 ? "primary" : "default"}
                    />
                    <Button
                      size="small"
                      onClick={() => handleSelectAll(permissions)}
                      variant={allSelected ? "outlined" : "text"}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <FormControl component="fieldset" fullWidth>
                  <FormGroup>
                    {permissions.map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {permission.label}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 1, alignItems: 'flex-start' }}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Total permissions selected: {selectedPermissions.length}
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Permissions
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PermissionManager;
