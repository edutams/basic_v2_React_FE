import React from 'react';
import ReusableModal from '../../components/shared/ReusableModal';
import NonTeachingStaffForm from './NonTeachingStaffForm';
import PropTypes from 'prop-types';

const AddNonTeachingStaffModal = ({
  open,
  onClose,
  onSave,
  isLoading = false,
  mode = 'create',
  initialValues,
}) => {
  const handleSubmit = async (values) => {
    await onSave(values);
  };

  const title = mode === 'edit' ? 'Edit Non-Teaching Staff' : 'Add Non-Teaching Staff';

  return (
    <ReusableModal open={open} onClose={onClose} title={title} size="medium">
      <NonTeachingStaffForm
        key={`${mode}-${initialValues?.id || initialValues?.staff_id || 'new'}`}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText={mode === 'edit' ? 'Update Staff' : 'Add Staff'}
        isLoading={isLoading}
      />
    </ReusableModal>
  );
};

AddNonTeachingStaffModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit']),
  initialValues: PropTypes.object,
};

export default AddNonTeachingStaffModal;
