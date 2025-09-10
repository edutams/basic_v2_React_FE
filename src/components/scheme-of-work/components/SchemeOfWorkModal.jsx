import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import SchemeOfWorkForm from './SchemeOfWorkForm';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Scheme of Work Item',
      size: 'medium',
    },
    update: {
      title: 'Edit Scheme of Work',
      size: 'small',
    },
  };
  return configs[actionType] || configs.create;
};

const SchemeOfWorkModal = ({
  open,
  onClose,
  actionType,
  selectedItem,
  onItemUpdate,
  confirmDialogOpen,
  onConfirmAdd,
  activeTerm,
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newItem = {
        ...values,
        term: activeTerm,
      };
      onItemUpdate(newItem, 'create');
    } else if (actionType === 'update') {
      const updatedItem = {
        ...selectedItem,
        ...values,
      };
      onItemUpdate(updatedItem, 'update');
    }
    onClose();
  };

  const renderContent = () => {
    if (confirmDialogOpen && actionType === 'create') {
      return (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          onConfirm={onConfirmAdd}
          title="Confirm Add Item"
          message="Are you sure you want to add a new item to the Scheme of Work?"
          confirmText="Confirm"
          cancelText="Cancel"
          severity="primary"
        />
      );
    }
    return (
      <SchemeOfWorkForm
        initialValues={actionType === 'update' ? selectedItem : {}}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={actionType === 'create' ? 'Create Item' : 'Update Item'}
      />
    );
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={confirmDialogOpen && actionType === 'create' ? 'Confirm Add Item' : modalConfig.title}
      size={confirmDialogOpen && actionType === 'create' ? 'small' : modalConfig.size}
      disableEnforceFocus
      disableAutoFocus
    >
      {renderContent()}
    </ReusableModal>
  );
};

SchemeOfWorkModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update']),
  selectedItem: PropTypes.object,
  onItemUpdate: PropTypes.func.isRequired,
  confirmDialogOpen: PropTypes.bool.isRequired,
  onConfirmAdd: PropTypes.func.isRequired,
  activeTerm: PropTypes.string.isRequired,
};

export default SchemeOfWorkModal;
