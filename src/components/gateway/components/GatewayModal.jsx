import React from 'react';
import ReusableModal from '../../shared/ReusableModal';
import GatewayForm from './GatewayForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Register Gateway', 
      size: 'small'
     },
    update: { 
      title: 'Update Gateway', 
      size: 'small' 
    },
  };
  return configs[actionType] || configs.create;
};

const GatewayModal = ({
  open,
  onClose,
  actionType,
  selectedGateway,
  onGatewayUpdate,
  isLoading = false,
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newGateway = { id: Date.now(), ...values };
      onGatewayUpdate(newGateway, 'create');
    } else if (actionType === 'update') {
      const updatedGateway = { ...selectedGateway, ...values };
      onGatewayUpdate(updatedGateway, 'update');
    }
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={modalConfig.title}
      size={modalConfig.size}
    >
      <GatewayForm
        key={actionType === 'create' ? 'create' : selectedGateway?.id || 'update'}
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialValues={selectedGateway || { gateway_name: '', gateway_status: 'active' }}
        isLoading={isLoading}
        submitText={actionType === 'create' ? 'Register' : 'Update'}
      />
    </ReusableModal>
  );
};

GatewayModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update']),
  selectedGateway: PropTypes.object,
  onGatewayUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default GatewayModal;
