import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { CopyAll as CopyIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const WalletCard = ({
  balance = '₦0',
  accountNumber = 'N/A',
  bankName = 'N/A',
  icon: Icon,
  iconColor = '#2e7d32',
  loading = false,
}) => {
  const handleCopyAccount = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountNumber);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Paper
      sx={{
        borderRadius: 2,
      p: 0.5,
      width: '100%',       // fills whatever Grid cell it's in
      bgcolor: 'background.paper',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      }}
    >
      {/* LEFT ICON */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'rgba(46,125,50,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon ? (
          <Icon size={22} color={iconColor} />
        ) : (
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              bgcolor: iconColor,
            }}
          />
        )}
      </Box>

      {/* CONTENT */}
      <Box sx={{ flex: 1, px: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 800 }}>
          Wallet Balance
        </Typography>

        <Box
          sx={{
            display: 'inline-block',
            mt: 0.2,
            px: 0.2,
            py: 0.1,
            borderRadius: 2,
            bgcolor: '#c49a6c',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {loading ? <CircularProgress size={12} color="inherit" /> : balance}
        </Box>

        <Typography
          sx={{
            mt: 1,
            fontSize: 12,
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          Wallet Account
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            {accountNumber}
          </Typography>

          <Box
            onClick={handleCopyAccount}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              p: 0.1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <CopyIcon fontSize="small" />
          </Box>
        </Box>

        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.0 }}>
          {bankName}
        </Typography>
      </Box>
    </Paper>
  );
};

WalletCard.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  accountNumber: PropTypes.string,
  bankName: PropTypes.string,
  icon: PropTypes.elementType,
  iconColor: PropTypes.string,
  loading: PropTypes.bool,
};

export default WalletCard;