import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  IconSearch,
  IconCircleCheck,
  IconCircleDashed,
  IconTerminal2,
  IconFocus2,
} from '@tabler/icons-react';
import { styled, alpha } from '@mui/material/styles';

// Internal Category Mapping (Consistent with ManageModulesModal)
const categoryMap = {
  1: 'Dashboard',
  2: 'Setup',
  3: 'Academics Management',
  4: 'Class Management',
  5: 'Subscriptions',
};

const getCategoryName = (mod) => {
  if (mod.category) return mod.category;
  return categoryMap[mod.packageId] || `Package ${mod.packageId || 'General'}`;
};

// Simplified Search Input
const SearchInput = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  width: '100%',
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const ManageModule = ({ selectedPlan, modules, currentPermissions, onSave, onCancel }) => {
  const [selectedModules, setSelectedModules] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = React.useRef(true);

  // Initialize selected modules from currentPermissions or selectedPlan
  useEffect(() => {
    if (currentPermissions && Array.isArray(currentPermissions)) {
      setSelectedModules(currentPermissions.map(String));
    } else if (selectedPlan?.modules && Array.isArray(selectedPlan.modules)) {
      setSelectedModules(selectedPlan.modules.map((m) => String(m.id || m)));
    }
  }, [selectedPlan, currentPermissions]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasChanges(true);
  }, [selectedModules]);

  const moduleCategories = useMemo(() => {
    const cats = (modules || []).reduce((acc, mod) => {
      const catName = getCategoryName(mod);
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(mod);
      return acc;
    }, {});
    return cats;
  }, [modules]);

  const categories = Object.keys(moduleCategories);

  const currentCategoryModules = useMemo(() => {
    const cat = categories[activeTab];
    return moduleCategories[cat] || [];
  }, [activeTab, moduleCategories, categories]);

  const filteredModules = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const allModules = modules || [];

    if (!query) return currentCategoryModules;

    return allModules.filter((m) => {
      const name = (m.module_name || m.mod_name || m.label || '').toLowerCase();
      const desc = (m.module_description || m.mod_description || m.description || '').toLowerCase();
      const cat = getCategoryName(m).toLowerCase();
      return name.includes(query) || desc.includes(query) || cat.includes(query);
    });
  }, [searchQuery, currentCategoryModules, modules]);

  const allCurrentModules = useMemo(() => {
    return searchQuery ? filteredModules : currentCategoryModules;
  }, [searchQuery, filteredModules, currentCategoryModules]);

  const handleModuleChange = (moduleId, checked) => {
    const idStr = String(moduleId);
    setSelectedModules((prev) => {
      const isPresent = prev.includes(idStr);
      if (checked && !isPresent) return [...prev, idStr];
      if (!checked && isPresent) return prev.filter((id) => id !== idStr);
      return prev;
    });
  };

  const handleSelectAll = (moduleList) => {
    const listIds = moduleList.map((m) => String(m.id));
    const allSelected = listIds.every((id) => selectedModules.includes(id));

    if (allSelected) {
      setSelectedModules((prev) => prev.filter((id) => !listIds.includes(id)));
    } else {
      setSelectedModules((prev) => Array.from(new Set([...prev, ...listIds])));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedModules);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getModuleCount = (categoryModules) => {
    const categoryIds = categoryModules.map((m) => String(m.id));
    return selectedModules.filter((id) => categoryIds.includes(id)).length;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',
        bgcolor: '#f8fafc',
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable Content Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {selectedPlan?.name}{' '}
                <Typography component="span" variant="h4" color="text.secondary">
                  Plan
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Configure the modules and capabilities for this plan tier.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'white',
                }}
              >
                <Avatar
                  sx={{ bgcolor: alpha('#5D87FF', 0.1), color: '#5D87FF', width: 32, height: 32 }}
                >
                  <IconTerminal2 size={18} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Active Modules
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {selectedModules.length}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Sidebar */}

          {/* Module Grid */}
        </Grid>
      </Box>

      {/* Persistent Action Bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block' }}
              >
                PLAN PRICE
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ₦{parseFloat(selectedPlan?.price || 0).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" size="small" onClick={onCancel} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={handleSave} disabled={!hasChanges || isSaving} startIcon={isSaving ? <CircularProgress /> : null}
              sx={{
                px: 4,
                borderRadius: '8px',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
              }}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ManageModule;
