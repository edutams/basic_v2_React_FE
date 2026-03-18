import React from 'react';
import ReusableModal from '../../shared/ReusableModal';
import GatewayForm from './GatewayForm';
import PropTypes from 'prop-types';
import gatewayApi from '../../../api/gatewayApi';
import { useNotification } from '../../../hooks/useNotification';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Register Gateway',
      size: 'small',
    },
    update: {
      title: 'Update Gateway',
      size: 'small',
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
  const notify = useNotification();
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = async (values) => {
    try {
      if (actionType === 'create') {
        const res = await gatewayApi.create(values);
        onGatewayUpdate(res.data, 'create');
        notify.success('Gateway created successfully');
      } else if (actionType === 'update') {
        const res = await gatewayApi.update(selectedGateway.id, values);
        onGatewayUpdate(res.data, 'update');
        notify.success('Gateway updated successfully');
      }
      onClose();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save gateway');
    }
  };

  return (
    <ReusableModal open={open} onClose={onClose} title={modalConfig.title} size={modalConfig.size}>
      <GatewayForm
        key={actionType === 'create' ? 'create' : selectedGateway?.id || 'update'}
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialValues={selectedGateway || { gateway_name: '', code: '', status: 'active' }}
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
