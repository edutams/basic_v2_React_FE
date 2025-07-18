import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Paper,
  Chip,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  FormControl,
} from '@mui/material';

const permissionCategories = {
  'Agent Management': [
    { id: 'add_agent', label: 'Add Agent', description: 'Can create new agents' },
    { id: 'edit_agent', label: 'Edit Agent', description: 'Can modify agent information' },
  ],
  'Package Management': [
    {
      id: 'add_manage_packages',
      label: 'Add/Manage Packages',
      description: 'Can create and manage package options',
    },
    {
      id: 'add_manage_plan',
      label: 'Add/Manage Plan',
      description: 'Can create and update subscription plans',
    },
  ],
  'School Management': [
    { id: 'add_school', label: 'Add School', description: 'Can create new schools' },
    { id: 'edit_school', label: 'Edit School', description: 'Can modify school information' },
    {
      id: 'add_school_plan',
      label: 'Add School Plan',
      description: 'Can define school-specific plans',
    },
    {
      id: 'add_manage_modules',
      label: 'Add/Manage Modules',
      description: 'Can manage functional modules',
    },
  ],
  'Session Management': [
    {
      id: 'add_manage_session',
      label: 'Add/Manage Session',
      description: 'Can create and manage academic sessions',
    },
    {
      id: 'add_manage_term',
      label: 'Add/Manage Term',
      description: 'Can create and manage academic terms',
    },
    {
      id: 'add_manage_payment_gateway',
      label: 'Add/Manage Payment Gateway',
      description: 'Can configure payment gateways',
    },
  ],
  // 'Financial Integration': [
  //   {
  //     id: 'add_manage_payment_gateway',
  //     label: 'Add/Manage Payment Gateway',
  //     description: 'Can configure payment gateways',
  //   },
  // ],
};

const agentLevels = [
  {
    value: 'Level 1',
    label: 'Level 1 - Basic Agent',
    description: 'Basic permissions for new agents',
    defaultPermissions: ['view_schools', 'view_users', 'view_reports'],
  },
  {
    value: 'Level 2',
    label: 'Level 2 - Senior Agent',
    description: 'Enhanced permissions for experienced agents',
    defaultPermissions: [
      'view_schools',
      'create_school',
      'edit_school',
      'view_users',
      'create_user',
      'view_reports',
      'view_payments',
    ],
  },
  {
    value: 'Level 3',
    label: 'Level 3 - Manager Agent',
    description: 'Full permissions for management level agents',
    defaultPermissions: [
      'create_school',
      'edit_school',
      'delete_school',
      'view_schools',
      'create_user',
      'edit_user',
      'delete_user',
      'view_users',
      'view_reports',
      'export_data',
      'view_analytics',
      'view_payments',
      'manage_commissions',
      'view_financial_reports',
      'manage_settings',
    ],
  },
];

const PermissionManager = ({ selectedAgent, onSave, onCancel }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(selectedAgent?.permissions || []);
  const [agentLevel, setAgentLevel] = useState(selectedAgent?.level || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionChange = (permissionId, checked) => {
    let newPermissions;
    if (checked) {
      newPermissions = [...selectedPermissions, permissionId];
    } else {
      newPermissions = selectedPermissions.filter((id) => id !== permissionId);
    }

    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSelectAll = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => selectedPermissions.includes(id));

    let newPermissions;
    if (allSelected) {
      newPermissions = selectedPermissions.filter((id) => !categoryIds.includes(id));
    } else {
      const toAdd = categoryIds.filter((id) => !selectedPermissions.includes(id));
      newPermissions = [...selectedPermissions, ...toAdd];
    }

    setSelectedPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleAgentLevelChange = (newLevel) => {
    setAgentLevel(newLevel);

    const levelConfig = agentLevels.find((level) => level.value === newLevel);
    if (levelConfig) {
      setSelectedPermissions(levelConfig.defaultPermissions);
    }

    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedAgent = {
      ...selectedAgent,
      permissions: selectedPermissions,
      level: agentLevel,
    };
    onSave(updatedAgent);
  };

  const getPermissionCount = (categoryPermissions) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    return selectedPermissions.filter((id) => categoryIds.includes(id)).length;
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Edit Permissions for {selectedAgent?.agentDetails || selectedAgent?.organizationName}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Select the agent level and permissions you want to grant to this agent. Changes will take
        effect immediately after saving.
      </Alert>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }} fullWidth>
        <Typography variant="h6" color="primary" mb={2}>
          Access Level
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select
                value={agentLevel}
                label="Agent Level"
                onChange={(e) => handleAgentLevelChange(e.target.value)}
              >
                <MenuItem value="">-- Select Level --</MenuItem>
                {agentLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            {agentLevel && (
              <Box>
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {agentLevels.find((l) => l.value === agentLevel)?.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {agentLevels.find((l) => l.value === agentLevel)?.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Default permissions:{' '}
                  {agentLevels.find((l) => l.value === agentLevel)?.defaultPermissions.length}{' '}
                  selected
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" mb={3}>
          Custom Permission Settings
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          {Object.entries(permissionCategories).map(([category, permissions]) => {
            const selectedCount = getPermissionCount(permissions);
            const allSelected = selectedCount === permissions.length;

            return (
              <Paper
                key={category}
                // variant="outlined"
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  // border: selectedCount > 0 ? '2px solid' : '1px solid',
                  // borderColor: selectedCount > 0 ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.light',
                  },
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      variant="h6"
                      color={selectedCount > 0 ? 'primary.dark' : 'text.primary'}
                    >
                      {category}
                    </Typography>
                    <Chip
                      label={`${selectedCount}/${permissions.length}`}
                      size="small"
                      color={selectedCount > 0 ? 'primary' : 'default'}
                      // variant={selectedCount > 0 ? 'filled' : 'outlined'}
                    />
                  </Box>
                  <Button
                    size="small"
                    onClick={() => handleSelectAll(permissions)}
                    // variant={allSelected ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ minWidth: 120 }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>

                <Box sx={{ p: 2 }}>
                  {permissions.map((permission, index) => (
                    <Box
                      key={permission.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        p: 1.5,
                        mb: index < permissions.length - 1 ? 1 : 0,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: selectedPermissions.includes(permission.id)
                          ? 'primary.main'
                          : 'grey.300',
                        bgcolor: selectedPermissions.includes(permission.id)
                          ? 'primary.light'
                          : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedPermissions.includes(permission.id)
                            ? 'primary.light'
                            : 'primary.light',
                          opacity: selectedPermissions.includes(permission.id) ? 1 : 0.8,
                        },
                      }}
                      onClick={() =>
                        handlePermissionChange(
                          permission.id,
                          !selectedPermissions.includes(permission.id),
                        )
                      }
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ mt: -0.5 }}
                      />
                      <Box sx={{ ml: 1, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={
                            selectedPermissions.includes(permission.id)
                              ? 'primary.dark'
                              : 'text.primary'
                          }
                          sx={{ mb: 0.5 }}
                        >
                          {permission.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', lineHeight: 1.3 }}
                        >
                          {permission.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="textSecondary">
            Agent Level: <strong>{agentLevel || 'Not selected'}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Total permissions selected: <strong>{selectedPermissions.length}</strong>
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PermissionManager;
