import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import SchemeOfWorkForm from './SchemeOfWorkForm';

const getModalConfig = (actionType, activeTerm, selectedItem) => {
  // const configs = {
  //   create: {
  //     title: `Create Scheme of Work Item - ${activeTerm} Term`,
  //     size: 'medium',
  //   },
  //   update: {
  //     title: selectedItem
  //       ? `Edit For- ${activeTerm} Term (${selectedItem.classLevel} ${selectedItem.subject})`
  //       : `Edit Scheme of Work - ${activeTerm} Term`,
  //     size: 'small',
  //   },
  // };
  const configs = {
    create: {
      title: (
        <>
          Create Scheme of Work Item -{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {activeTerm} Term
          </Box>
        </>
      ),
      size: 'medium',
    },
    update: {
      title: selectedItem ? (
        <>
          Edit For -{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {activeTerm} Term ({selectedItem.classLevel} {selectedItem.subject})
          </Box>
        </>
      ) : (
        <>
          Edit Scheme of Work -{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {activeTerm} Term
          </Box>
        </>
      ),
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
  const modalConfig = getModalConfig(actionType, activeTerm, selectedItem);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newItem = {
        ...values,
        term: activeTerm,
      };
      onItemUpdate(newItem, 'create');
      onClose();
    } else if (actionType === 'update') {
      const baseItem = selectedItem || {};
      const updatedItem = {
        ...baseItem,
        ...values,
      };
      onItemUpdate(updatedItem, 'update');
      onClose();
    }
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

    const initialValues = actionType === 'update' && selectedItem ? selectedItem : {};

    return (
      <SchemeOfWorkForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={actionType === 'create' ? 'Create' : 'Save'}
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
