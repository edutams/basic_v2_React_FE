import React from 'react';
import { Box, Card, Typography, Stack, Button, IconButton } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const ParentWalletAccount = ({ totalPayable = 0, accountNumber = '3021587491', bank = 'Zenith Bank' }) => {
  return (
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
        p: 2,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
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
      <Box sx={{ bgcolor: '#fff5f5', border: '1px solid #ffe4e6', borderRadius: '9px', p: 1.5, mb: 1.75 }}>
        <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#e11d48', letterSpacing: 0.4 }}>
          TOTAL PAYABLE (ALL WARDS)
        </Typography>
        <Typography
          sx={{
            fontSize: 22,
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                Account Number
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                {accountNumber}
              </Typography>
            </Box>
            {bank && (
              <Box textAlign="right">
                <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                  Bank
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  {bank}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

      {/* Buttons */}
      <Stack direction="row" spacing={0.75}>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
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
          size="small"
          startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />}
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
            '&:hover': { borderColor: '#1d4ed8', bgcolor: '#eff6ff' },
          }}
        >
          Wallet Transactions
        </Button>
      </Stack>
    </Card>
  );
};

export default ParentWalletAccount;
