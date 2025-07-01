import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import PackageForm from './PackageForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Package',
      size: 'medium',
    },
    update: {
      title: 'Update Package',
      size: 'medium',
    },
    activate: {
      title: 'Activate Package',
      size: 'small',
    },
    deactivate: {
      title: 'Deactivate Package',
      size: 'small',
    },
  };

  return configs[actionType] || configs.create;
};

const PackageModal = ({
  open,
  onClose,
  actionType,
  selectedPackage,
  onPackageUpdate,
  isLoading = false
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newPackage = {
        id: Date.now(),
        ...values,
      };
      onPackageUpdate(newPackage, 'create');
    } else if (actionType === 'update') {
      const updatedPackage = {
        ...selectedPackage,
        ...values,
      };
      onPackageUpdate(updatedPackage, 'update');
    }
    onClose();
  };

  const handleStatusChange = (status) => {
    const updatedPackage = {
      ...selectedPackage,
      pac_status: status,
    };
    onPackageUpdate(updatedPackage, 'update');
    onClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'create':
        return (
          <PackageForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Create Package"
            isLoading={isLoading}
          />
        );

      case 'update':
        return (
          <PackageForm
            initialValues={selectedPackage}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Update Package"
            isLoading={isLoading}
          />
        );

      case 'activate':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Activate Package
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to activate "{selectedPackage?.pac_name}"?
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
            <Typography variant="h6" >
              Deactivate Package
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to deactivate "{selectedPackage?.pac_name}"?
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

PackageModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update', 'activate', 'deactivate']),
  selectedPackage: PropTypes.object,
  onPackageUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PackageModal;
