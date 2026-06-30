import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Collapse,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import eduTierApi from '../../../api/landlord/edutier/eduTierApi';
import useNotification from '../../../hooks/useNotification';

const ManagePackagesModal = ({ selectedPlan, onClose }) => {
  const notify = useNotification();
  const [pkgData, setPkgData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (selectedPlan?.id) {
      fetchPlanPackages();
    }
  }, [selectedPlan?.id]);

  const fetchPlanPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eduTierApi.getPackagesByPlan(selectedPlan.id);
      if (response.success) {
        const transformed = response.data.map((pkg) => {
          const flatModules = [];

          const processModules = (modules) => {
            modules.forEach((mod) => {
              // Check if mod.plans is an array and contains the selected plan
              // The backend now filters plans to only include the current one if it exists
              const hasPlan = Array.isArray(mod.plans) && mod.plans.length > 0;

              flatModules.push({
                ...mod,
                ckmstatus: hasPlan,
                sub_modules: undefined, // Clear to avoid circularity if needed
              });

              if (mod.sub_modules && mod.sub_modules.length > 0) {
                processModules(mod.sub_modules);
              }
            });
          };

          if (pkg.modules) {
            processModules(pkg.modules);
          }

          return { ...pkg, modules: flatModules };
        });
        setPkgData(transformed);

        // Auto-expand all for the screenshot look
        const initialExpanded = {};
        transformed.forEach((pkg) => {
          pkg.modules.forEach((mod) => {
            initialExpanded[mod.id] = true;
          });
        });
        setExpanded(initialExpanded);
      } else {
        setError(response.message || 'Failed to fetch packages');
      }
    } catch (err) {
      setError('Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = (pkgId, moduleId, checked) => {
    setPkgData((prev) =>
      prev.map((pkg) => {
        if (pkg.id !== pkgId) return pkg;
        const updatedModules = pkg.modules.map((mod) => {
          if (mod.id === moduleId) return { ...mod, ckmstatus: checked };
          if (isDescendant(pkg.modules, moduleId, mod)) return { ...mod, ckmstatus: checked };
          return mod;
        });
        return { ...pkg, modules: updatedModules };
      }),
    );
  };

  const isDescendant = (modules, parentId, targetMod) => {
    let curr = targetMod;
    while (curr.parent_id) {
      if (curr.parent_id === parentId) return true;
      const parent = modules.find((m) => m.id === curr.parent_id);
      if (!parent) break;
      curr = parent;
    }
    return false;
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await eduTierApi.savePlanModulesNew(selectedPlan.id, pkgData);
      if (response.success) {
        notify.success('Packages updated successfully');
        onClose();
      } else {
        notify.error(response.message || 'Failed to update packages');
      }
    } catch (err) {
      notify.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const renderModuleTree = (pkgId, modules, parentId = null, level = 0) => {
    const levelModules = modules.filter((m) => m.parent_id === parentId);
    if (levelModules.length === 0) return null;

    return (
      <Box sx={{ ml: 2 }}>
        {levelModules.map((mod) => {
          const hasChildren = modules.some((m) => m.parent_id === mod.id);
          const isExpanded = expanded[mod.id];

          return (
            <Box key={mod.id} sx={{ mb: 0.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  sx={{ mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={mod.ckmstatus}
                      onChange={(e) => handleToggleModule(pkgId, mod.id, e.target.checked)}
                      sx={{ p: 0.5 }}
                      id={`module-checkbox-${mod.id}`}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      htmlFor={`module-checkbox-${mod.id}`}
                      sx={{
                        color: level === 0 ? '#333' : '#666',
                      }}
                    >
                      {mod.module_name || mod.mod_name}
                    </Typography>
                  }
                />
                {hasChildren && (
                  <IconButton
                    size="small"
                    onClick={() => toggleExpand(mod.id)}
                    sx={{ p: 0, ml: 0.5 }}
                  >
                    {isExpanded ? (
                      <ExpandMoreIcon fontSize="inherit" />
                    ) : (
                      <ChevronRightIcon fontSize="inherit" />
                    )}
                  </IconButton>
                )}
              </Box>
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderModuleTree(pkgId, modules, mod.id, level + 1)}
                </Collapse>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxHeight: '80vh', overflowY: 'auto', p: 3 }}>
      <Grid container spacing={2}>
        {pkgData.map((pkg) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pkg.id}>
            <Box
              sx={{
                borderRadius: 2,
                p: 2,
              }}
            >
              {/* PACKAGE HEADER */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={pkg.modules.every((m) => m.ckmstatus)}
                      indeterminate={
                        pkg.modules.some((m) => m.ckmstatus) &&
                        !pkg.modules.every((m) => m.ckmstatus)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPkgData((prev) =>
                          prev.map((p) =>
                            p.id !== pkg.id
                              ? p
                              : {
                                  ...p,
                                  modules: p.modules.map((m) => ({
                                    ...m,
                                    ckmstatus: checked,
                                  })),
                                },
                          ),
                        );
                      }}
                      id={`pack-checkbox-${pkg.id}`}
                    />
                  }
                  label={
                    <Typography variant="subtitle2">{pkg.package_name || pkg.pac_name}</Typography>
                  }
                />
              </Box>

              {/* MODULE TREE */}
              <Box sx={{ pl: 2 }}>{renderModuleTree(pkg.id, pkg.modules)}</Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 1 }}>
        <Button variant="contained" size="small" onClick={onClose}>Cancel</Button>

        <Button variant="contained" size="small" onClick={handleSave} startIcon={saving && <CircularProgress color="inherit" />}
          disabled={saving}
          size="small"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default ManagePackagesModal;
