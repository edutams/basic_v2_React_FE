import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import ViewParentsContent from './ViewParentsContent';
import PropTypes from 'prop-types';

const ViewParentsModal = ({ open, onClose, learner }) => (
  <ReusableModal open={open} onClose={onClose} title="" size="large" showDivider={false}>
    <ViewParentsContent
      key={learner?.users?.id}
      learner={learner}
      onClose={onClose}
    />
  </ReusableModal>
);

ViewParentsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  learner: PropTypes.object,
};

export default ViewParentsModal;
