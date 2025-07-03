import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from '../../shared/ReusableModal';
import ModuleForm from './ModuleForm';
import PropTypes from 'prop-types';

import ConfirmationDialog from '../../shared/ConfirmationDialog';


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
      {/* {renderContent()} */}
      return (
  <>
    {actionType === 'activate' || actionType === 'deactivate' ? (
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        onConfirm={() =>
          handleStatusChange(actionType === 'activate' ? 'active' : 'inactive')
        }
        title={actionType === 'activate' ? 'Activate Module' : 'Deactivate Module'}
        message={`Are you sure you want to ${actionType} "${selectedModule?.mod_name}"?`}
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
