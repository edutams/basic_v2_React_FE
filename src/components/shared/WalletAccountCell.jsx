import React, { useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import PayerInfoModal from './PayerInfoModal';
import PropTypes from 'prop-types';

const WalletAccountCell = ({ row }) => {
  const [infoOpen, setInfoOpen] = useState(false);

  const payer = {
    name: row.payer_name,
    avatar: row.payer_avatar,
    email: row.payer_email,
    phone: row.payer_phone,
    type: row.payer_type_name,
    publicId: row.payer_learner_id,
  };

  return (
    <Box>
      <Link
        component="button"
        underline="hover"
        href={`/bursary/transactions/wallet_transactions?wallet_account_no=${encodeURIComponent(row.wallet_account_no)}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
      >
        {row.wallet_account_no ?? 'N/A'}
      </Link>
      {row.payer_type_name && (
        <Typography
          component="button"
          type="button"
          onClick={() => setInfoOpen(true)}
          variant="caption"
          sx={{
            display: 'block',
            cursor: 'pointer',
            color: 'text.secondary',
            bgcolor: 'transparent',
            border: 'none',
            p: 0,
            font: 'inherit',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
          }}
        >
          ({row.payer_type_name})
        </Typography>
      )}
      <PayerInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} payer={payer} />
    </Box>
  );
};

WalletAccountCell.propTypes = {
  row: PropTypes.shape({
    wallet_account_no: PropTypes.string,
    payer_name: PropTypes.string,
    payer_avatar: PropTypes.string,
    payer_email: PropTypes.string,
    payer_phone: PropTypes.string,
    payer_type_name: PropTypes.string,
    payer_learner_id: PropTypes.string,
  }).isRequired,
};

export default WalletAccountCell;
