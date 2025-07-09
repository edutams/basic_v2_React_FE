import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import PackageForm from './PackageForm';
import PropTypes from 'prop-types';

import ConfirmationDialog from '../../shared/ConfirmationDialog';


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
      default:
        return null;
    }
  };

  return (
    <>
      {actionType === 'activate' || actionType === 'deactivate' ? (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          onConfirm={() =>
            handleStatusChange(actionType === 'activate' ? 'active' : 'inactive')
          }
          title={actionType === 'activate' ? 'Activate Package' : 'Deactivate Package'}
          message={`Are you sure you want to ${actionType} "${selectedPackage?.pac_name}"?`}
          confirmText={actionType === 'activate' ? 'Activate' : 'Deactivate'}
          cancelText="Cancel"
          severity={actionType === 'activate' ? 'theme.palette.primary.main' : 'error'}
        />
      ) : (
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
      )}
    </>
  );
}; 
  

export default PackageModal;
