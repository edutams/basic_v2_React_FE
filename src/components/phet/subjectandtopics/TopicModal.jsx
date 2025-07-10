import React from 'react';
import PropTypes from 'prop-types';
import ReusableModal from '../../shared/ReusableModal';
import TopicForm from './TopicForm';
import ConfirmationDialog from '../../shared/ConfirmationDialog';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Add New Topic',
      size: 'small',
    },
    update: {
      title: 'Edit Topic',
      size: 'small',
    },
    activate: {
      title: 'Activate Topic',
      size: 'small',
    },
    deactivate: {
      title: 'Deactivate Topic',
      size: 'small',
    },
  };

  return configs[actionType] || configs.create;
};

const TopicModal = ({
  open,
  onClose,
  actionType,
  selectedTopic,
  onTopicUpdate,
  selectedSubject,
  isLoading = false,
}) => {
  const modalConfig = getModalConfig(actionType);

  const handleSubmit = (values) => {
    if (actionType === 'create') {
      const newTopic = {
        id: Date.now(),
        subjectId: selectedSubject?.id,
        ...values,
      };
      onTopicUpdate(newTopic, 'create');
    } else if (actionType === 'update') {
      const updatedTopic = {
        ...selectedTopic,
        ...values,
      };
      onTopicUpdate(updatedTopic, 'update');
    }
    onClose();
  };

  const handleStatusChange = (status) => {
    const updatedTopic = {
      ...selectedTopic,
      status,
    };
    onTopicUpdate(updatedTopic, 'update');
    onClose();
  };

 const renderContent = () => {
  switch (actionType) {
    case 'create':
    case 'update':
      return (
        <TopicForm
          initialValues={selectedTopic || {}}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitText={actionType === 'create' ? 'Create Topic' : 'Update Topic'}
          isLoading={isLoading}
        />
      );
    default:
      return null;
  }
};


  return (
    <>
      {['activate', 'deactivate'].includes(actionType) ? (
        <ConfirmationDialog
          open={open}
          onClose={onClose}
          onConfirm={() =>
            handleStatusChange(actionType === 'activate' ? 'active' : 'inactive')
          }
          title={modalConfig.title}
          message={`Are you sure you want to ${actionType} "${selectedTopic?.name}"?`}
          confirmText={actionType === 'activate' ? 'Activate' : 'Deactivate'}
          cancelText="Cancel"
          severity={actionType === 'activate' ? 'primary' : 'error'}
        />
      ) : (
        <ReusableModal
          open={open}
          onClose={onClose}
          title={modalConfig.title}
          size={modalConfig.size}
          disableAutoFocus
          disableEnforceFocus
        >
          {renderContent()}
        </ReusableModal>
      )}
    </>
  );
};

TopicModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.string.isRequired,
  selectedTopic: PropTypes.object,
  onTopicUpdate: PropTypes.func.isRequired,
  selectedSubject: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default TopicModal;
