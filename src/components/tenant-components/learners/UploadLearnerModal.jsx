import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import UploadLearnerForm from './UploadLearnerForm';
import PropTypes from 'prop-types';

const UploadLearnerModal = ({ open, onClose, onUpload }) => (
  <ReusableModal open={open} onClose={onClose} title="Upload Learners via Excel" size="small">
    <UploadLearnerForm
      key={open ? 'open' : 'closed'}
      onUpload={onUpload}
      onCancel={onClose}
    />
  </ReusableModal>
);

UploadLearnerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default UploadLearnerModal;
