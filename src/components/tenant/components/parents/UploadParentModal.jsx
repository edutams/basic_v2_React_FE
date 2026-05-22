import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import UploadParentForm from './UploadParentForm';
import PropTypes from 'prop-types';

const UploadParentModal = ({ open, onClose, onUpload }) => (
  <ReusableModal open={open} onClose={onClose} title="Upload Parents via Excel" size="small">
    <UploadParentForm
      key={open ? 'open' : 'closed'}
      onUpload={onUpload}
      onCancel={onClose}
    />
  </ReusableModal>
);

UploadParentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default UploadParentModal;
