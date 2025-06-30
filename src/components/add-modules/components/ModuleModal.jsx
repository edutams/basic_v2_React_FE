import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import ModuleForm from './ModuleForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Module',
      size: 'medium',
    },
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

  return configs[actionType] || configs.create;
};

const ModuleModal = ({
  open,
  onClose,
  actionType,
  selectedModule,
  onModuleUpdate,
  isLoading = false
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newModule = {
        id: Date.now(),
        ...values,
      };
      onModuleUpdate(newModule, 'create');
    } else if (actionType === 'update') {
      const updatedModule = {
        ...selectedModule,
        ...values,
      };
      onModuleUpdate(updatedModule, 'update');
    }
    onClose();
  };

  const handleStatusChange = (status) => {
    const updatedModule = {
      ...selectedModule,
      mod_status: status,
    };
    onModuleUpdate(updatedModule, 'update');
    onClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'create':
        return (
          <ModuleForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Create Module"
            isLoading={isLoading}
          />
        );

      case 'update':
        return (
          <ModuleForm
            initialValues={selectedModule}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Update Module"
            isLoading={isLoading}
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
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleStatusChange('active')}
                disabled={isLoading}
              >
                {isLoading ? 'Activating...' : 'Activate'}
              </Button>
            </Box>
          </Box>
        );

      case 'deactivate':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deactivate Module
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to deactivate "{selectedModule?.mod_name}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => handleStatusChange('inactive')}
                disabled={isLoading}
              >
                {isLoading ? 'Deactivating...' : 'Deactivate'}
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
      onClose={onClose}
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
  actionType: PropTypes.oneOf(['create', 'update', 'activate', 'deactivate']),
  selectedModule: PropTypes.object,
  onModuleUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ModuleModal;
