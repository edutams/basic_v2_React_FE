import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  ViewModule as ViewModuleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import eduTierApi from '../../api/eduTierApi';

const ManagePackagesModal = ({ selectedPlan, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setPackages(response.data || []);
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

  const getModuleIcon = (icon) => {
    if (!icon) return <ViewModuleIcon />;
    // You can add more icon mappings based on your icon classes
    return <ViewModuleIcon />;
  };

  const renderModule = (module) => {
    const isInPlan = module.plans && module.plans.some(plan => plan.id === selectedPlan?.id);
    
    return (
      <Grid item xs={12} sm={6} md={4} key={module.id}>
        <Card
          sx={{
            mb: 2,
            border: isInPlan ? '2px solid #4caf50' : '1px solid #e0e0e0',
            backgroundColor: isInPlan ? '#f8fff8' : '#ffffff',
            '&:hover': {
              boxShadow: 2,
            },
          }}
        >
          <CardContent sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: isInPlan ? '#4caf50' : '#757575', mr: 2 }}>
                {getModuleIcon(module.mod_icon)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {module.mod_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.mod_description}
                </Typography>
              </Box>
              <Box sx={{ ml: 1 }}>
                {isInPlan ? (
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
                ) : (
                  <CancelIcon sx={{ color: '#757575', fontSize: '1.5rem' }} />
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Chip
                size="small"
                label={module.mod_status || 'Unknown'}
                sx={{
                  bgcolor: module.mod_status === 'active' ? '#e8f5e8' : '#ffebee',
                  color: module.mod_status === 'active' ? '#2e7d32' : '#c62828',
                  fontSize: '0.75rem',
                }}
              />
              {module.is_sidebar === 'YES' && (
                <Chip
                  size="small"
                  label="Sidebar"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading packages...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!packages.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <InventoryIcon sx={{ fontSize: 48, color: '#757575', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Packages Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This plan doesn't have any packages assigned yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing packages and their modules for <strong>{selectedPlan?.name}</strong>. 
        Modules highlighted in green are currently included in this plan.
      </Typography>

      {packages.map((pkg) => (
        <Accordion key={pkg.id} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#f0f1f3',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <InventoryIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {pkg.pac_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pkg.pac_description}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={`${pkg.modules?.length || 0} modules`}
                sx={{
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  mr: 2,
                }}
              />
              <Chip
                size="small"
                label={pkg.pac_status || 'Unknown'}
                sx={{
                  bgcolor: pkg.pac_status === 'active' ? '#e8f5e8' : '#ffebee',
                  color: pkg.pac_status === 'active' ? '#2e7d32' : '#c62828',
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {pkg.modules && pkg.modules.length > 0 ? (
                pkg.modules.map(renderModule)
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No modules available in this package
                  </Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ManagePackagesModal;
