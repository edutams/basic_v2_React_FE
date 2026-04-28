import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import LinkWardForm from './LinkWardForm';
import PropTypes from 'prop-types';
import guardianApi from 'src/api/parentApi';
import { useNotification } from 'src/hooks/useNotification';

const LinkWardModal = ({ open, onClose, parent, onSaved }) => {
  const notify = useNotification();

  const parentName = parent?.user
    ? `${parent.user.fname} ${parent.user.lname}`
    : 'Guardian';

  const handleSave = async (wardIds) => {
    await guardianApi.syncWards(parent.user_id, wardIds);
    notify.success('Wards linked successfully');
    onSaved?.();
    onClose();
  };

  return (
    <ReusableModal open={open} onClose={onClose} title={`${parentName} — Link Wards`} size="medium">
      <LinkWardForm
        key={parent?.user_id}
        parent={parent}
        onSave={handleSave}
        onCancel={onClose}
      />
    </ReusableModal>
  );
};

LinkWardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  parent: PropTypes.object,
  onSaved: PropTypes.func,
};

export default LinkWardModal;
