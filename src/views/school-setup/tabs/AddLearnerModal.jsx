import React from 'react';
import { Typography } from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import LearnerForm from './LearnerForm';
import PropTypes from 'prop-types';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Add New Learner',
      size: 'medium',
    },
  };
  return configs[actionType] || configs.create;
};

const AddLearnerModal = ({ open, onClose, className, onSave, isLoading = false }) => {
  const modalConfig = getModalConfig('create');

  const handleSubmit = async (values) => {
    onSave(values);
    onClose();
  };

  // Custom title with className in primary color
  const renderTitle = () => (
    <>
      Add New Learner -{' '}
      <Typography component="span" color="primary" fontWeight={600}>
        {className}
      </Typography>
    </>
  );

  return (
    <ReusableModal open={open} onClose={onClose} title={renderTitle()} size={modalConfig.size}>
      <LearnerForm
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

AddLearnerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddLearnerModal;
