import React from 'react';
import { Box, Typography, Avatar, Chip, Divider } from '@mui/material';
import ReusableModal from './ReusableModal';
import PropTypes from 'prop-types';

const PayerInfoModal = ({ open, onClose, payer }) => (
  <ReusableModal open={open} onClose={onClose} title="Payer Details" size="small">
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Avatar src={payer?.avatar || undefined} sx={{ width: 56, height: 56 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {payer?.name || '—'}
        </Typography>
        {payer?.type && (
          <Chip
            label={payer.type}
            size="small"
            color={payer.type === 'Parent' ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        )}
      </Box>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          Email
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {payer?.email || '—'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          Phone
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {payer?.phone || '—'}
        </Typography>
      </Box>
      {payer?.publicId && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {payer.type === 'Parent' ? 'Parent ID' : 'Admission No.'}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {payer.publicId}
          </Typography>
        </Box>
      )}
    </Box>
  </ReusableModal>
);

PayerInfoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  payer: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    type: PropTypes.string,
    publicId: PropTypes.string,
  }),
};

export default PayerInfoModal;
