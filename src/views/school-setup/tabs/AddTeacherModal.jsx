import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import TeacherForm from './TeacherForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Add New Teacher',
      size: 'medium',
    },
  };
  return configs[actionType] || configs.create;
};

const AddTeacherModal = ({ open, onClose, className, onSave, isLoading = false }) => {
  const modalConfig = getModalConfig('create');

  const handleSubmit = async (values) => {
    onSave(values);
    onClose();
  };

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`${modalConfig.title} - ${className}`}
      size={modalConfig.size}
    >
      <TeacherForm
        key={className}
        className={className}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Save"
        isLoading={isLoading}
      />
    </ReusableModal>
  );
};

AddTeacherModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddTeacherModal;
