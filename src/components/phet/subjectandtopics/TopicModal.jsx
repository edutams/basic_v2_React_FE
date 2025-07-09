import React from 'react';
import TopicForm from './TopicForm';
import PropTypes from 'prop-types'; // Add this import

const TopicModal = ({ open, onClose, actionType, selectedTopic, selectedSubject, onTopicUpdate, isLoading = false }) => {
  const handleSubmit = (values) => {
    if (actionType === 'create') {
      onTopicUpdate({ name: values.name, status: values.status, subjectId: selectedSubject.id }, 'create');
    } else if (actionType === 'update') {
      onTopicUpdate({ id: selectedTopic.id, name: values.name, status: values.status, subjectId: selectedSubject.id }, 'update');
    }
    onClose();
  };

  return (
    <TopicForm
      open={open}
      onClose={onClose}
      initialValues={selectedTopic || { name: '', status: 'active' }}
      onSubmit={handleSubmit}
      submitText={actionType === 'create' ? 'Create Topic' : 'Update Topic'}
      isLoading={isLoading}
    />
  );
};

TopicModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actionType: PropTypes.oneOf(['create', 'update', 'activate', 'deactivate']).isRequired,
  selectedTopic: PropTypes.object,
  selectedSubject: PropTypes.object,
  onTopicUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default TopicModal;