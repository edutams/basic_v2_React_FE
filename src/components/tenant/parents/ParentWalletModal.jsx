import React from 'react';
import ReusableModal from 'src/components/shared/ReusableModal';
import ParentWalletContent from './ParentWalletContent';
import PropTypes from 'prop-types';

const ParentWalletModal = ({ open, onClose, guardian }) => (
  <ReusableModal open={open} onClose={onClose} title="" size="extraLarge" showDivider={false}>
    <ParentWalletContent key={guardian?.user_id} guardian={guardian} onClose={onClose} />
  </ReusableModal>
);

ParentWalletModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guardian: PropTypes.object,
};

export default ParentWalletModal;
