import React from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../shared/ReusableModal';
import PackageForm from './PackageForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Package',
      size: 'large',
    },
    update: {
      title: 'Update Package',
      size: 'large',
    },
    view: {
      title: 'Package Details',
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

const PackageModal = ({ open, onClose, handleRefresh, selectedPackage, actionType }) => {
  const modalConfig = getModalConfig(actionType);

  const formik = useFormik({
    initialValues: {
      package_name: selectedPackage?.package_name || '',
      package_description: selectedPackage?.package_description || '',
      package_type: selectedPackage?.package_type || 'Monthly',
      price: selectedPackage?.price || '',
      features: selectedPackage?.features || [],
      status: selectedPackage?.status || 'active',
    },
    onSubmit: async (values) => {
      try {
        console.log('Package data:', values);
        console.log('Action type:', actionType);
        
        switch (actionType) {
          case 'create':
            console.log('Creating new package:', values);
            break;
          case 'update':
            console.log('Updating package:', selectedPackage?.id, values);
            break;
          case 'activate':
            console.log('Activating package:', selectedPackage?.id);
            break;
          case 'deactivate':
            console.log('Deactivating package:', selectedPackage?.id);
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

  const handleCloseModal = () => {
    formik.resetForm();
    onClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'view':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Package Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Name:</strong> {selectedPackage?.package_name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Description:</strong> {selectedPackage?.package_description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Type:</strong> {selectedPackage?.package_type}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Price:</strong> ${selectedPackage?.price}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Features:</strong> {selectedPackage?.features?.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Status:</strong> {selectedPackage?.status}
            </Typography>
          </Box>
        );

      case 'activate':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Activate Package
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to activate "{selectedPackage?.package_name}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => formik.handleSubmit()}
              >
                Activate
              </Button>
            </Box>
          </Box>
        );

      case 'deactivate':
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Deactivate Package
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to deactivate "{selectedPackage?.package_name}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => formik.handleSubmit()}
              >
                Deactivate
              </Button>
            </Box>
          </Box>
        );

      default:
        return (
          <PackageForm
            formik={formik}
            actionType={actionType}
            selectedPackage={selectedPackage}
            onCancel={handleCloseModal}
          />
        );
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleCloseModal}
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
  handleRefresh: PropTypes.func.isRequired,
  selectedPackage: PropTypes.object,
  actionType: PropTypes.oneOf([
    'create',
    'update',
    'view',
    'activate',
    'deactivate',
  ]),
};

export default PackageModal;
