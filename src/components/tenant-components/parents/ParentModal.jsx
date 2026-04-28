import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import ParentForm from './ParentForm';
import PropTypes from 'prop-types';
import guardianApi from 'src/api/parentApi';
import { useNotification } from 'src/hooks/useNotification';

const getModalConfig = (actionType) => ({
  create: { title: 'Add Parent / Guardian', size: 'large' },
  update: { title: 'Edit Parent / Guardian', size: 'medium' },
}[actionType] || { title: 'Add Parent / Guardian', size: 'large' });

const ParentModal = ({
  open,
  onClose,
  actionType = 'create',
  selectedParent,
  onParentUpdate,
  isLoading = false,
}) => {
  const notify = useNotification();
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = async (values, wardIds = []) => {
    try {
      if (actionType === 'create') {
        const res = await guardianApi.create(values);
        if (wardIds.length > 0) {
          const newUserId = res?.data?.data?.user_id;
          if (newUserId) await guardianApi.syncWards(newUserId, wardIds);
        }
        onParentUpdate(res.data.data, 'create');
        notify.success(res.data?.message || 'Parent added successfully');
      } else {
        const res = await guardianApi.update(selectedParent.user_id, values);
        onParentUpdate(res.data.data, 'update');
        notify.success(res.data?.message || 'Parent updated successfully');
      }
      onClose();
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save parent');
    }
  };

  return (
    <ReusableModal open={open} onClose={onClose} title={modalConfig.title} size={modalConfig.size}>
      <ParentForm
        key={actionType === 'create' ? 'create' : selectedParent?.user_id || 'update'}
        selectedParent={actionType === 'update' ? selectedParent : null}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isEdit={actionType === 'update'}
        isLoading={isLoading}
        submitText={actionType === 'create' ? 'Add Parent' : 'Save Changes'}
      />
    </ReusableModal>
  );
};

ParentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update']),
  selectedParent: PropTypes.object,
  onParentUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ParentModal;
