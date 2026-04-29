import React from 'react';
import { Typography } from '@mui/material';
import ReusableModal from 'src/components/shared/ReusableModal';
import LinkParentForm from './LinkParentForm';
import PropTypes from 'prop-types';
import learnerApi from 'src/api/learnerApi';
import { useNotification } from 'src/hooks/useNotification';

const LinkParentModal = ({ open, onClose, learner, onSaved }) => {
  const notify = useNotification();

  const learnerName = learner?.users
    ? `${learner.users.fname} ${learner.users.lname}`
    : 'Learner';

  const handleSave = async (guardianIds) => {
    await learnerApi.syncParents(learner.users.id, guardianIds);
    notify.success('Parents linked successfully');
    onSaved?.();
    onClose();
  };

  const title = (
    <>
      <Typography component="span" color="primary" fontWeight={600}>{learnerName}</Typography>
      {' — Link Parents'}
    </>
  );

  return (
    <ReusableModal open={open} onClose={onClose} title={title} size="medium">
      <LinkParentForm
        key={learner?.users?.id}
        learner={learner}
        onSave={handleSave}
        onCancel={onClose}
      />
    </ReusableModal>
  );
};

LinkParentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  learner: PropTypes.object,
  onSaved: PropTypes.func,
};

export default LinkParentModal;
