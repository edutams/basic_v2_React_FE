import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import UploadTeacherForm from './UploadTeacherForm';
import PropTypes from 'prop-types';

const UploadTeacherModal = ({ open, onClose, onUpload }) => (
  <ReusableModal open={open} onClose={onClose} title="Upload Staff via Excel" size="small">
    <UploadTeacherForm
      key={open ? 'open' : 'closed'}
      onUpload={onUpload}
      onCancel={onClose}
    />
  </ReusableModal>
);

UploadTeacherModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default UploadTeacherModal;
