import React from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../shared/ReusableModal';
import EditModule from './EditModule';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    update: {
      title: 'Update Module',
      size: 'medium',
    },
    activate: {
      title: 'Activate Module',
      size: 'small',
    },
    deactivate: {
      title: 'Deactivate Module',
      size: 'small',
    },
  };

  return configs[actionType] || configs.update;
};

const ModuleModal = ({ open, onClose, handleRefresh, updateModule, updateModuleStatus, selectedModule, actionType }) => {
  const modalConfig = getModalConfig(actionType);

  const formik = useFormik({
    initialValues: {
      mod_name: selectedModule?.mod_name || '',
      mod_description: selectedModule?.mod_description || '',
      mod_links: selectedModule?.mod_links || '',
      mod_status: selectedModule?.mod_status || 'active',
    },
    onSubmit: async (values) => {
      try {
        console.log('Module data:', values);
        console.log('Action type:', actionType);
        
        switch (actionType) {


          case 'activate':
            console.log('Activating module:', selectedModule?.id);
            break;
          case 'deactivate':
            console.log('Deactivating module:', selectedModule?.id);
            break;
          default:
            console.log('Unknown action:', actionType);
        }

        handleRefresh();
        handleClose();
      } catch (error) {
        console.error('Error:', error);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleUpdate = (moduleData) => {
    console.log('Module updated:', moduleData);
    if (updateModule) {
      updateModule(moduleData);
    }
    handleRefresh();
    handleClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'update':
        return (
          <EditModule
            selectedModule={selectedModule}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        );

      case 'activate':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Activate Module
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to activate "{selectedModule?.mod_name}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (updateModuleStatus && selectedModule) {
                    updateModuleStatus(selectedModule.id, 'active');
                  }
                  handleClose();
                }}
              >
                Activate
              </Button>
            </Box>
          </Box>
        );

      case 'deactivate':
        return (
          <Box sx={{ p: 0}}>
            <Typography variant="h6" gutterBottom>
            Change Module Status
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to deactivate "{selectedModule?.mod_name}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button  onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  if (updateModuleStatus && selectedModule) {
                    updateModuleStatus(selectedModule.id, 'inactive');
                  }
                  handleClose();
                }}
              >
                Deactivate
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={modalConfig.title}
      size={modalConfig.size}
      disableEnforceFocus
      disableAutoFocus
    >
      {renderContent()}
    </ReusableModal>
  );
};

ModuleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  updateModule: PropTypes.func,
  updateModuleStatus: PropTypes.func,
  selectedModule: PropTypes.object,
  actionType: PropTypes.oneOf([
    'update',
    'activate',
    'deactivate',
  ]),
};

export default ModuleModal;
