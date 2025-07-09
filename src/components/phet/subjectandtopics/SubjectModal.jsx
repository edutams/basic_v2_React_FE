import React from 'react';
import PropTypes from 'prop-types';
import ReusableModal from '../../shared/ReusableModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';
import SubjectForm from './SubjectForm';

const getModalConfig = (type) => {
  const config = {
    create: { title: 'Add Subject', size: 'small' },
    edit: { title: 'Edit Subject', size: 'small' },
    delete: { title: 'Delete Subject', size: 'small' },
  };
  return config[type] || config.create;
};

const SubjectModal = ({
  open,
  onClose,
  actionType,
  selectedSubject,
  onSubjectUpdate,
  isLoading = false,
}) => {
  const config = getModalConfig(actionType);

  const handleSubmit = (values) => {
    const data = {
      ...selectedSubject,
      ...values,
    };

    onSubjectUpdate(data, actionType);
    onClose();
  };

  const handleDelete = () => {
    onSubjectUpdate(selectedSubject, 'delete');
    onClose();
  };

  const renderContent = () => {
    switch (actionType) {
      case 'create':
      case 'edit':
        return (
          <SubjectForm
            initialValues={actionType === 'edit' ? selectedSubject : {}}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText={actionType === 'edit' ? 'Update Subject' : 'Add Subject'}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {actionType === 'delete' ? (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          onConfirm={handleDelete}
          title="Delete Subject"
          message={`Are you sure you want to delete "${selectedSubject?.name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          severity="error"
        />
      ) : (
        <ReusableModal
          open={open}
          onClose={onClose}
          title={config.title}
          size={config.size}
          disableEnforceFocus
        >
          {renderContent()}
        </ReusableModal>
      )}
    </>
  );
};

SubjectModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.string.isRequired,
  selectedSubject: PropTypes.object,
  onSubjectUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SubjectModal;
