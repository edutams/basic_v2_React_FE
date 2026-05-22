import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import SubcriptionFormLink from 'src/components/subcription/SubcriptionFormLink';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create New Subcription',
      size: 'small',
    },
    update: {
      title: 'Upgrade Plan',
      size: 'medium',
    },
    delete: {
      title: 'Delete Simulation Link',
      size: 'small',
    },
  };

  return configs[actionType] || configs.create;
};

const StimulationModal = ({
  open,
  onClose,
  actionType,
  selectedSimulation,
  onSimulationUpdate,
  isLoading = false,
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newSimulation = {
        id: Date.now(),
        ...values,
      };
      onSimulationUpdate(newSimulation, 'create');
    } else if (actionType === 'update') {
      const updatedSimulation = {
        ...selectedSimulation,
        ...values,
      };
      onSimulationUpdate(updatedSimulation, 'update');
    }
    onClose();
  };

  const handleDelete = () => {
    onSimulationUpdate(selectedSimulation, 'delete');
    onClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'create':
        return (
          <SubcriptionFormLink
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Add Subcription"
            isLoading={isLoading}
          />
        );
      case 'update':
        return (
          <SubcriptionFormLink
            initialValues={selectedSimulation}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Update"
            isLoading={isLoading}
          />
        );
      case 'delete':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Delete Subcription
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to delete "{selectedSimulation?.title}"?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button onClick={onClose} sx={{ mr: 1 }} color="inherit" disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
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

StimulationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update', 'delete']),
  selectedSimulation: PropTypes.object,
  onSimulationUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default StimulationModal;
