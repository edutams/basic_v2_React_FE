import React from 'react';
import { Typography } from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import TeacherForm from './TeacherForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Add New Teacher',
      size: 'medium',
    },
    edit: {
      title: 'Edit Teacher',
      size: 'medium',
    },
  };
  return configs[actionType] || configs.create;
};

const AddTeacherModal = ({
  open,
  onClose,
  className,
  onSave,
  isLoading = false,
  mode = 'create',
  initialValues,
}) => {
  const modalConfig = getModalConfig(mode);

  const handleSubmit = async (values) => {
    await onSave(values);
  };

  const renderTitle = () => (
    <>
      {mode === 'edit' ? 'Edit Teacher' : 'Add New Teacher'}
      {/* <Typography component="span" color="primary" fontWeight={600}>
        {className}
      </Typography> */}
    </>
  );

  return (
    <ReusableModal open={open} onClose={onClose} title={renderTitle()} size={modalConfig.size}>
      <TeacherForm
        key={`${mode}-${initialValues?.id || initialValues?.staff_id || 'new'}`}
        className={className}
        initialValues={initialValues}
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
  mode: PropTypes.oneOf(['create', 'edit']),
  initialValues: PropTypes.object,
};

export default AddTeacherModal;
