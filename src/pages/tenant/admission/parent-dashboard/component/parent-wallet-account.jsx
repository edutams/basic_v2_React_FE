import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Stack, Button, IconButton, useTheme } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import WalletTransactionsModal from './wallet-transactions-modal';

const ParentWalletAccount = ({ totalPayable = 0, accountNumber, walletBalance, parentName }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [transactionsOpen, setTransactionsOpen] = useState(false);

  return (
    <>
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '14px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        p: 1,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap' }}>
            Parent Wallet Account
          </Typography>
        </Stack>
        <IconButton size="small" sx={{ color: '#64748b', p: 0.5 }}>
          <MoreVertIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Stack>

      {/* Payable Amount Block */}
      <Box sx={{ bgcolor: '#fff5f5', border: '1px solid #ffe4e6', borderRadius: '9px', p: 1.5, mb: 2 }}>
        <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#e11d48', letterSpacing: 0.4 }}>
          TOTAL PAYABLE (ALL WARDS)
        </Typography>
        <Typography
          sx={{
            fontSize: 35,
            fontWeight: 800,
            color: '#e11d48',
            lineHeight: 1.1,
            mt: 0.35,
            letterSpacing: -0.3,
            whiteSpace: 'nowrap',
          }}
        >
          ₦{totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: '#64748b', mt: 0.2, fontWeight: 500 }}>
          Amount due to be paid
        </Typography>
      </Box>

      <Box sx={{ mb: 1.75 }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#475569', mb: 0.75 }}>
          Wallet Account Details (Parent)
        </Typography>
        {accountNumber ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                Account Number
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {accountNumber}
              </Typography>
            </Box>
            {walletBalance != null && (
              <Box textAlign="right">
                <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                  Balance
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  ₦{Number(walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : (
          <Box
            sx={{
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '9px',
              px: 1.25,
              py: 0.75,
            }}
          >
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: '#1d4ed8', lineHeight: 1.4 }}>
              ℹ️ A wallet account has not been generated for {parentName || 'you'}, make payment to generate.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Buttons */}
      <Stack direction="row" spacing={0.75}>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate('/pay-school-fees')}
          sx={{
            flex: 1,
            borderRadius: '7px',
            textTransform: 'none',
            fontSize: 11,
            fontWeight: 700,
            bgcolor: '#2563eb',
            color: '#ffffff',
            px: 0.75,
            py: 0.5,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Fund Wallet
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => setTransactionsOpen(true)}
          sx={{
            flex: 1,
            borderRadius: '7px',
            textTransform: 'none',
            fontSize: 11,
            fontWeight: 700,
            color: '#2563eb',
            borderColor: '#2563eb',
            px: 0.75,
            py: 0.5,
            whiteSpace: 'nowrap',
            // The real cause of "hover is white": this app's theme
            // (theme/Components.jsx MuiButton.outlinedPrimary) hardcodes
            // outlined+primary buttons to `color: white` on hover — that
            // theme rule was winning over this file's own hover sx, since
            // an unset `color` prop here defaults to "primary" and matches
            // it. `color="inherit"` above opts this button out of that
            // variant entirely so this sx is the only styling in play.
            '&:hover': {
              borderColor: '#1d4ed8',
              bgcolor: isDarkMode ? 'rgba(37,99,235,0.25)' : '#dbeafe',
              color: '#1d4ed8',
            },
          }}
        >
          Wallet Transactions
        </Button>
      </Stack>
    </Card>
    <WalletTransactionsModal open={transactionsOpen} onClose={() => setTransactionsOpen(false)} />
    </>
  );
};

export default ParentWalletAccount;
