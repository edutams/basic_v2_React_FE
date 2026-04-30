import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import UploadStaffForm from './UploadStaffForm';
import PropTypes from 'prop-types';

const UploadStaffModal = ({ open, onClose, onUpload, onDownloadTemplate }) => (
  <ReusableModal open={open} onClose={onClose} title="Upload Staff via Excel" size="small">
    <UploadStaffForm
      key={open ? 'open' : 'closed'}
      onUpload={onUpload}
      onCancel={onClose}
      onDownloadTemplate={onDownloadTemplate}
    />
  </ReusableModal>
);

UploadStaffModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onDownloadTemplate: PropTypes.func,
};

export default UploadStaffModal;
