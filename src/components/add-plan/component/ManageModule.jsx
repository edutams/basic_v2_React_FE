import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Avatar,
  Fade,
  Zoom,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch,
  IconSparkles,
  IconCircleCheck,
  IconCircleDashed,
  IconTerminal2,
  IconCommand,
  IconFocus2,
  IconRefresh,
  IconBolt
} from '@tabler/icons-react';
import { styled, alpha } from '@mui/material/styles';

// Glassmorphism effect
const GlassBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
}));

const SearchInput = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '16px',
  backgroundColor: 'rgba(241, 245, 249, 0.6)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    boxShadow: '0 0 0 2px rgba(93, 135, 255, 0.1)',
  },
  '&:focus-within': {
    backgroundColor: '#fff',
    boxShadow: '0 0 0 3px rgba(93, 135, 255, 0.2)',
    width: '100%',
  },
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
}));

const ManageModule = ({ selectedPlan, currentPermissions, modules = [], packages = [], onSave, onCancel }) => {
  // 1. Stable Keys and Presets (move up for state init)
  const permissionsKey = React.useMemo(() => 
    (currentPermissions || []).map(id => String(id)).sort().join(','),
    [currentPermissions]
  );

  const dynamicPackagePresets = React.useMemo(() => {
    return packages.map((pkg, index) => {
      const colors = ['#5D87FF', '#FFAE1F', '#13DEB9', '#FA896B'];
      return {
        value: String(pkg.id),
        label: pkg.package_name || pkg.pac_name,
        description: pkg.package_description || pkg.pac_description,
        moduleIds: (pkg.modules || []).map(m => String(m.id)),
        color: colors[index % colors.length]
      };
    });
  }, [packages]);

  // 2. Initialize state directly from props to prevent mount flicker
  const initialNormalized = React.useMemo(() => (currentPermissions || []).map(id => String(id)), [permissionsKey]);
  
  const [selectedModules, setSelectedModules] = useState(initialNormalized);
  const [packageLevel, setPackageLevel] = useState(() => {
    const currentSorted = [...initialNormalized].sort();
    const pkg = dynamicPackagePresets.find(p => {
      const pkgSorted = [...p.moduleIds].sort();
      return currentSorted.length === pkgSorted.length && 
             currentSorted.every((val, index) => val === pkgSorted[index]);
    });
    return pkg ? pkg.value : '';
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = React.useRef(true);

  // 3. Sync Logic (Only run after mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const normalized = (currentPermissions || []).map(id => String(id));
    if (JSON.stringify(normalized.sort()) !== JSON.stringify([...selectedModules].sort())) {
      setSelectedModules(normalized);
      setHasChanges(false);
    }
  }, [permissionsKey, selectedPlan?.id]);

  // Group modules dynamically
  const moduleCategories = React.useMemo(() => {
    const groups = {};
    const isRoot = (m) => m.parent_id == null || m.parent_id === 0 || m.parent_id === "0";
    const roots = modules.filter(m => isRoot(m));
    
    if (roots.length > 0) {
      roots.forEach(root => {
        const rootIdStr = String(root.id);
        const children = modules.filter(m => String(m.parent_id) === rootIdStr);
        if (children.length > 0) {
          groups[root.module_name] = children.map(c => ({
            id: String(c.id),
            label: c.module_name,
            description: c.module_description
          }));
        } else {
          if (!groups['General']) groups['General'] = [];
          groups['General'].push({
            id: String(root.id),
            label: root.module_name,
            description: root.module_description
          });
        }
      });
    } else {
      groups['Modules'] = modules.map(m => ({
        id: String(m.id),
        label: m.module_name,
        description: m.module_description
      }));
    }
    return groups;
  }, [modules]);

  const categories = React.useMemo(() => Object.keys(moduleCategories), [moduleCategories]);

  // Highlight matching package and trigger celebration
  useEffect(() => {
    const currentSorted = [...selectedModules].sort();
    const matchingPackage = dynamicPackagePresets.find(pkg => {
      const pkgSorted = [...pkg.moduleIds].sort();
      return currentSorted.length === pkgSorted.length && 
             currentSorted.every((val, index) => val === pkgSorted[index]);
    });
    
    const newLevel = matchingPackage ? matchingPackage.value : '';
    if (newLevel !== packageLevel) {
      if (!isInitialMount.current && matchingPackage) {
        setShowMatchCelebration(true);
        setTimeout(() => setShowMatchCelebration(false), 2000);
      }
      setPackageLevel(newLevel);
    }
  }, [selectedModules, dynamicPackagePresets]);

  const handleModuleChange = (moduleId, checked) => {
    const sId = String(moduleId);
    setSelectedModules(prev => checked ? [...prev, sId] : prev.filter(id => id !== sId));
    setHasChanges(true);
  };

  const handleSelectAll = (categoryModules) => {
    const categoryIds = categoryModules.map((m) => String(m.id));
    const allSelected = categoryIds.every((id) => selectedModules.includes(id));
    let newModules;
    if (allSelected) {
      newModules = selectedModules.filter((id) => !categoryIds.includes(id));
    } else {
      const toAdd = categoryIds.filter((id) => !selectedModules.includes(id));
      newModules = [...selectedModules, ...toAdd];
    }
    setSelectedModules(newModules);
    setHasChanges(true);
  };

  const handlePackageLevelChange = (newLevelId) => {
    const sLevelId = String(newLevelId);
    setPackageLevel(sLevelId);
    const levelConfig = dynamicPackagePresets.find((level) => level.value === sLevelId);
    if (levelConfig) {
      setSelectedModules(levelConfig.moduleIds);
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedModules);
    } finally {
      setIsSaving(false);
    }
  };

  const activeCategory = categories[activeTab];
  const allCurrentModules = moduleCategories[activeCategory] || [];
  
  const filteredModules = React.useMemo(() => {
    if (!searchQuery) return allCurrentModules;
    const lowerQuery = searchQuery.toLowerCase();
    return modules.filter(m => 
      m.module_name.toLowerCase().includes(lowerQuery) || 
      (m.module_description && m.module_description.toLowerCase().includes(lowerQuery))
    ).map(m => ({
      id: String(m.id),
      label: m.module_name,
      description: m.module_description,
      category: categories.find(cat => moduleCategories[cat].some(cm => String(cm.id) === String(m.id)))
    }));
  }, [searchQuery, allCurrentModules, modules, categories, moduleCategories]);

  const getModuleCount = (categoryModules) => {
    const categoryIds = categoryModules.map((m) => String(m.id));
    return selectedModules.filter((id) => categoryIds.includes(id)).length;
  };

  return (
    <Box sx={{ position: 'relative', pb: 12, minHeight: '800px' }}>
      {/* Immersive Animated Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#f8fafc',
        borderRadius: '24px',
      }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, #5D87FF30 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [10, 0, 10],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, #FFAE1F20 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </Box>

      {/* Hero Glass Header */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <GlassBox sx={{ 
          p: 4, 
          mb: 5, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Match Celebration Effect */}
          <AnimatePresence>
            {showMatchCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.5 }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(93, 135, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <IconSparkles size={120} color="#5D87FF" style={{ opacity: 0.3 }} />
              </motion.div>
            )}
          </AnimatePresence>

          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 3 }}>
              ULTIMATE CONFIGURATOR
            </Typography>
            <Typography variant="h3" fontWeight="900" sx={{ mt: 1, color: '#0f172a', letterSpacing: -1 }}>
              {selectedPlan?.name} <span style={{ fontWeight: 300, color: '#94a3b8' }}>Tier</span>
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mt: 1, maxWidth: 450, fontWeight: 500, lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
              Define the architectural capabilities of this revenue tier with precision engineering.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GlassBox sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
                <Avatar sx={{ bgcolor: alpha('#5D87FF', 0.1), color: '#5D87FF' }}>
                  <IconTerminal2 size={24} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>CAPABILITIES</Typography>
                  <Typography variant="h6" fontWeight="900" sx={{ color: '#1e293b' }}>{selectedModules.length} Active</Typography>
                </Box>
              </GlassBox>
            </motion.div>
          </Box>
        </GlassBox>
      </motion.div>

      {/* Package Horizontal Slider */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#1e293b' }}>Architectural Templates</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconCommand size={18} color="#94a3b8" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8' }}>SELECT TEMPLATE TO AUTO-CONFIGURE</Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            {dynamicPackagePresets.map((pkg, idx) => (
              <Grid item xs={12} sm={3} key={pkg.value}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Paper
                    onClick={() => handlePackageLevelChange(pkg.value)}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      borderRadius: '24px',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: packageLevel === pkg.value ? pkg.color : 'transparent',
                      background: packageLevel === pkg.value 
                        ? `linear-gradient(135deg, ${alpha(pkg.color, 0.05)} 0%, white 100%)`
                        : 'white',
                      boxShadow: packageLevel === pkg.value 
                        ? `0 20px 40px ${alpha(pkg.color, 0.15)}` 
                        : '0 4px 20px rgba(0,0,0,0.02)',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: alpha(pkg.color, 0.1), 
                        color: pkg.color,
                        display: 'flex'
                      }}>
                        <IconBolt size={24} />
                      </Box>
                      {packageLevel === pkg.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <IconCircleCheck size={28} color={pkg.color} />
                        </motion.div>
                      )}
                    </Box>
                    <Typography variant="h6" fontWeight="900" sx={{ mb: 1, color: '#0f172a' }}>
                      {pkg.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.5, height: 45, overflow: 'hidden' }}>
                      {pkg.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Main Grid View */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <GlassBox sx={{ overflow: 'hidden', p: 1 }}>
              <Box sx={{ p: 2, mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: 2 }}>MODULE SUITES</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {categories.map((cat, idx) => {
                  const total = moduleCategories[cat].length;
                  const count = getModuleCount(moduleCategories[cat]);
                  const isActive = activeTab === idx;
                  
                  return (
                    <motion.div key={cat} whileHover={{ x: 5 }}>
                      <Box
                        onClick={() => setActiveTab(idx)}
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          bgcolor: isActive ? alpha('#5D87FF', 0.06) : 'transparent',
                          border: '1px solid',
                          borderColor: isActive ? alpha('#5D87FF', 0.1) : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="body2" fontWeight={isActive ? 800 : 600} sx={{ color: isActive ? 'primary.main' : '#475569' }}>
                            {cat}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>{count}/{total}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / total) * 100}%` }}
                            style={{
                              height: '100%',
                              background: count === total ? '#13DEB9' : count > 0 ? '#5D87FF' : '#cbd5e1',
                              borderRadius: 2
                            }}
                          />
                        </Box>
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </GlassBox>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SearchInput>
                <IconSearch size={20} color="#94a3b8" />
                <input 
                  placeholder="Search capabilities..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    outline: 'none', 
                    marginLeft: '12px',
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '15px'
                  }}
                />
              </SearchInput>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => handleSelectAll(allCurrentModules)}
                  sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 3 }}
                >
                  {getModuleCount(allCurrentModules) === allCurrentModules.length ? 'Deselect Suite' : 'Configure Full Suite'}
                </Button>
              </motion.div>
            </Box>

            <AnimatePresence>
              <motion.div
                key={activeTab + searchQuery}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Grid container spacing={2}>
                  {filteredModules.map((module) => {
                    const isSelected = selectedModules.includes(module.id);
                    return (
                      <Grid item xs={12} sm={6} key={module.id}>
                        <motion.div layout>
                          <Paper
                            onClick={() => handleModuleChange(module.id, !isSelected)}
                            sx={{
                              p: 3,
                              borderRadius: '20px',
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : '#f1f5f9',
                              background: 'white',
                              boxShadow: isSelected ? '0 15px 30px rgba(93, 135, 255, 0.1)' : 'none',
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: isSelected ? 'none' : 'translateY(-4px)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box sx={{ mt: 0.5 }}>
                                {isSelected ? (
                                  <IconCircleCheck size={28} color="#5D87FF" />
                                ) : (
                                  <IconCircleDashed size={28} color="#cbd5e1" />
                                )}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#0f172a' }}>
                                  {module.label || 'Unnamed Module'}
                                  {searchQuery && module.category && (
                                    <Chip label={module.category} size="small" sx={{ ml: 1, height: 20, fontSize: '10px', fontWeight: 800 }} />
                                  )}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500, lineHeight: 1.4 }}>
                                  {module.description || 'No description provided'}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </motion.div>
                      </Grid>
                    );
                  })}
                  {filteredModules.length === 0 && modules.length > 0 && (
                    <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
                      <IconFocus2 size={64} color="#e2e8f0" />
                      <Typography variant="h6" sx={{ color: '#94a3b8', mt: 2 }}>No architectural matches found</Typography>
                    </Box>
                  )}
                  {modules.length === 0 && (
                    <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
                      <CircularProgress size={40} sx={{ color: '#5D87FF', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#94a3b8' }}>Assembling core architecture...</Typography>
                    </Box>
                  )}
                </Grid>
              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </motion.div>

      {/* Extreme Floating Action Bar */}
      <motion.div
        initial={{ y: 100, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }}
        style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          width: 'calc(100% - 80px)',
          maxWidth: 1200,
          zIndex: 1100,
        }}
      >
        <Box>
          <GlassBox sx={{ 
            p: 2.5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.5)',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', gap: 6, ml: 4 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: 1.5 }}>PLAN VALUE</Typography>
                <Typography variant="h4" fontWeight="950" color="primary" sx={{ letterSpacing: -1 }}>₦{parseFloat(selectedPlan?.price || 0).toLocaleString()}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: 1.5 }}>ACTIVE CONFIG</Typography>
                <Typography variant="h5" fontWeight="950" sx={{ color: '#0f172a' }}>
                  {dynamicPackagePresets.find(p => p.value === packageLevel)?.label || 'CUSTOM BUILD'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
              <Button 
                onClick={onCancel} 
                sx={{ 
                  px: 4, 
                  borderRadius: '16px', 
                  fontWeight: 800, 
                  color: '#64748b', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: alpha('#64748b', 0.05) }
                }}
              >
                Discard Changes
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={!hasChanges || isSaving}
                  endIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <IconRefresh size={18} />}
                  sx={{ 
                    px: 6, 
                    py: 2, 
                    borderRadius: '18px', 
                    fontWeight: 900, 
                    textTransform: 'none',
                    fontSize: '16px',
                    boxShadow: '0 10px 30px rgba(93, 135, 255, 0.3)',
                    background: 'linear-gradient(135deg, #5D87FF 0%, #4671e6 100%)',
                    '&:hover': { 
                      boxShadow: '0 15px 40px rgba(93, 135, 255, 0.4)',
                      background: 'linear-gradient(135deg, #4671e6 0%, #3a60d1 100%)'
                    }
                  }}
                >
                  {isSaving ? 'Deploying...' : 'Deploy Architecture'}
                </Button>
              </motion.div>
            </Box>
          </GlassBox>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ManageModule;
