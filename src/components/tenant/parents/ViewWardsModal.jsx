import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import ViewWardsContent from './ViewWardsContent';
import PropTypes from 'prop-types';

const ViewWardsModal = ({ open, onClose, guardian }) => (
  <ReusableModal open={open} onClose={onClose} title="" size="large" showDivider={false}>
    <ViewWardsContent
      key={guardian?.user_id}
      guardian={guardian}
      onClose={onClose}
    />
  </ReusableModal>
);

ViewWardsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guardian: PropTypes.object,
};

export default ViewWardsModal;
