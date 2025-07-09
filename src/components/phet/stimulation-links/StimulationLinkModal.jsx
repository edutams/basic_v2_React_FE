import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import StimulationFormLink from 'src/components/phet/stimulation-links/StimulationFormLink';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Add New Simulation Link',
      size: 'small',
    },
    update: {
      title: 'Edit Simulation Link',
      size: 'medium',
    },
    delete: {
      title: 'Delete Simulation Link',
      size: 'small',
    },
  };

  return configs[actionType] || configs.create;
};

const StimulationLinkModal = ({
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
          <StimulationFormLink
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Add Link"
            isLoading={isLoading}
          />
        );
      case 'update':
        return (
          <StimulationFormLink
            initialValues={selectedSimulation}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Update Link"
            isLoading={isLoading}
          />
        );
      case 'delete':
        return (
          <Box >
            <Typography variant="h6" gutterBottom>
              Delete Simulation Link
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Are you sure you want to delete "{selectedSimulation?.title}"?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={isLoading}
              >
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

StimulationLinkModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update', 'delete']),
  selectedSimulation: PropTypes.object,
  onSimulationUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default StimulationLinkModal;
