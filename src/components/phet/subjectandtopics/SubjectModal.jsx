import React from 'react';
import ReusableModal from '../../shared/ReusableModal'; // Assuming this path matches your project
import SubjectForm from './SubjectForm';
import PropTypes from 'prop-types';

// Define modal configuration based on actionType
const getModalConfig = (actionType) => {
  const configs = {
    create: { title: 'Create Subject', size: 'small' },
    update: { title: 'Update Subject', size: 'small' },
    activate: { title: 'Activate Subject', size: 'small' },
    deactivate: { title: 'Deactivate Subject', size: 'small' },
  };
  if (!configs[actionType]) {
    console.warn(`Unknown actionType "${actionType}" in SubjectModal, falling back to "create" config`);
    return configs.create;
  }
  return configs[actionType];
};

const SubjectModal = ({
  open,
  onClose,
  actionType,
  selectedSubject,
  onSubjectUpdate,
  isLoading = false,
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      onSubjectUpdate({ name: values.name, status: values.status }, 'create');
    } else if (actionType === 'update') {
      onSubjectUpdate({ id: selectedSubject.id, name: values.name, status: values.status }, 'update');
    } else if (actionType === 'activate' || actionType === 'deactivate') {
      onSubjectUpdate({ id: selectedSubject.id, status: actionType }, actionType);
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
      <SubjectForm
        key={actionType === 'create' ? 'create' : selectedSubject?.id || 'update'}
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialValues={selectedSubject || { name: '', status: 'active' }}
        isLoading={isLoading}
        submitText={actionType === 'create' ? 'Create' : actionType === 'update' ? 'Update' : actionType === 'activate' ? 'Activate' : 'Deactivate'}
      />
    </ReusableModal>
  );
};

SubjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update', 'activate', 'deactivate']).isRequired,
  selectedSubject: PropTypes.object,
  onSubjectUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SubjectModal;