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
  }
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
      setSelectedModules(selectedPlan.modules.map(m => String(m.id || m)));
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
    
    return allModules.filter(m => {
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
    setSelectedModules(prev => {
      const isPresent = prev.includes(idStr);
      if (checked && !isPresent) return [...prev, idStr];
      if (!checked && isPresent) return prev.filter(id => id !== idStr);
      return prev;
    });
  };

  const handleSelectAll = (moduleList) => {
    const listIds = moduleList.map(m => String(m.id));
    const allSelected = listIds.every(id => selectedModules.includes(id));
    
    if (allSelected) {
      setSelectedModules(prev => prev.filter(id => !listIds.includes(id)));
    } else {
      setSelectedModules(prev => Array.from(new Set([...prev, ...listIds])));
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '90vh',
      bgcolor: '#f8fafc',
      borderRadius: '24px',
      overflow: 'hidden',
    }}>
      {/* Scrollable Content Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {selectedPlan?.name} <Typography component="span" variant="h4" color="text.secondary">Plan</Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Configure the modules and capabilities for this plan tier.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white' }}>
                <Avatar sx={{ bgcolor: alpha('#5D87FF', 0.1), color: '#5D87FF', width: 32, height: 32 }}>
                  <IconTerminal2 size={18} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Active Modules</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{selectedModules.length}</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper 
              variant="outlined"
              sx={{ 
                p: 1.5,
                borderRadius: '12px',
                bgcolor: 'white',
                position: 'sticky',
                top: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', px: 1, mb: 1.5, display: 'block', letterSpacing: 1 }}>
                MODULE SUITES
              </Typography>
              <List sx={{ p: 0 }}>
                {categories.map((cat, idx) => {
                  const total = moduleCategories[cat].length;
                  const count = getModuleCount(moduleCategories[cat]);
                  const isActive = activeTab === idx;
                  
                  return (
                    <ListItem
                      key={cat}
                      disablePadding
                      onClick={() => setActiveTab(idx)}
                      sx={{
                        mb: 0.5,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        bgcolor: isActive ? alpha('#5D87FF', 0.1) : 'transparent',
                        color: isActive ? 'primary.main' : 'text.primary',
                        '&:hover': { bgcolor: alpha('#5D87FF', 0.05) }
                      }}
                    >
                      <ListItemText 
                        primary={cat}
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          fontWeight: isActive ? 'bold' : 'medium' 
                        }}
                        sx={{ px: 1 }}
                      />
                      <Typography variant="caption" sx={{ pr: 1, fontWeight: 'bold' }}>
                        {count}/{total}
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Grid>

          {/* Module Grid */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <SearchInput>
                <IconSearch size={18} color="#94a3b8" />
                <input 
                  placeholder="Search modules..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    outline: 'none', 
                    marginLeft: '8px',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </SearchInput>
              <Button 
                size="small"
                variant="outlined" 
                onClick={() => handleSelectAll(allCurrentModules)}
                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                {getModuleCount(allCurrentModules) === allCurrentModules.length ? 'Deselect Suite' : 'Select Suite'}
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {filteredModules.map((module) => {
                const isSelected = selectedModules.includes(String(module.id));
                const name = module.module_name || module.mod_name || module.label || 'Unnamed Module';
                const description = module.module_description || module.mod_description || module.description || 'No description available';
                const status = module.module_status || module.mod_status || 'active';

                return (
                  <Grid item xs={12} sm={6} key={module.id}>
                    <Paper
                      variant="outlined"
                      onClick={() => status === 'active' && handleModuleChange(module.id, !isSelected)}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        cursor: status === 'active' ? 'pointer' : 'default',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? alpha('#5D87FF', 0.02) : 'white',
                        opacity: status === 'active' ? 1 : 0.6,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        transition: 'all 0.2s',
                        '&:hover': status === 'active' ? {
                          borderColor: isSelected ? 'primary.main' : alpha('#5D87FF', 0.5),
                        } : {}
                      }}
                    >
                      <Box sx={{ mt: 0.2 }}>
                        {isSelected ? (
                          <IconCircleCheck size={20} color="#5D87FF" />
                        ) : (
                          <IconCircleDashed size={20} color="#cbd5e1" />
                        )}
                      </Box>

                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {name}
                          {searchQuery && (
                            <Chip 
                              label={getCategoryName(module)} 
                              size="small" 
                              sx={{ ml: 1, height: 16, fontSize: '10px' }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                          {description}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}

              {filteredModules.length === 0 && (modules || []).length > 0 && (
                <Box sx={{ width: '100%', py: 8, textAlign: 'center' }}>
                  <IconFocus2 size={48} color="#cbd5e1" />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                    No modules found matching your search.
                  </Typography>
                </Box>
              )}

              {(modules || []).length === 0 && (
                <Box sx={{ width: '100%', py: 8, textAlign: 'center' }}>
                  <CircularProgress size={32} sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading modules...
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
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
        <Box sx={{ maxWidth: 1200, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block' }}>PLAN PRICE</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">₦{parseFloat(selectedPlan?.price || 0).toLocaleString()}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={onCancel} 
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ 
                px: 4, 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
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
