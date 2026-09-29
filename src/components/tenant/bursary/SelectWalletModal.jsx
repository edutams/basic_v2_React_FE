import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const naira = (n) => `₦${(Number(n) || 0).toLocaleString()}`;

/**
 * "Pick which wallet to pay from" — shared by PaySchoolFees and PayInvoice.
 * `wallets` is whatever getParentPaymentWallets() returned for the wards
 * actually being paid for in this specific payment (not every ward the
 * guardian has) plus the guardian's own wallet, when each one exists.
 * Purely a selection UI — the caller owns fetching wallets and deciding
 * what happens once one is picked.
 */
const SelectWalletModal = ({
  open,
  onClose,
  wallets = [],
  loading = false,
  selectedWalletId,
  onSelect,
  onConfirm,
  amount,
  confirmLabel = 'Confirm & Pay',
  confirmLoading = false,
}) => {
  const selected = wallets.find((w) => w.id === selectedWalletId);
  const insufficientBalance = selected && amount != null && Number(selected.balance) < Number(amount);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Pay From
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {amount != null && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Amount to pay: <strong>{naira(amount)}</strong>
          </Typography>
        )}

        {loading ? (
          <Stack spacing={1.25}>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '10px' }} />
            ))}
          </Stack>
        ) : wallets.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No wallet has been generated yet for you or the ward(s) in this payment. Make a payment to
            generate one, or try again once a wallet exists.
          </Alert>
        ) : (
          <Stack spacing={1.25}>
            {wallets.map((wallet) => {
              const isSelected = wallet.id === selectedWalletId;
              const isShort = amount != null && Number(wallet.balance) < Number(amount);

              return (
                <Box
                  key={wallet.id}
                  onClick={() => onSelect?.(wallet.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : 'grey.200',
                    bgcolor: isSelected ? 'primary.50' : 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700} sx={{ fontSize: '0.85rem' }} noWrap>
                          {wallet.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {wallet.name} · Wallet No: {wallet.wallet_no}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Typography fontWeight={800} sx={{ fontSize: '0.9rem' }}>
                        {naira(wallet.balance)}
                      </Typography>
                      {isShort && (
                        <Chip
                          label="Insufficient"
                          size="small"
                          color="error"
                          sx={{ fontSize: '0.6rem', height: 18 }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        {insufficientBalance && (
          <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
            The selected wallet's balance is lower than the amount due. You can still proceed — the
            gateway will let you top up if needed.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="text" onClick={onClose} disabled={confirmLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          // A wallet selection is only required when there's actually a
          // wallet to choose from — if none exists yet, the payment should
          // still proceed: SkoolPay's own widget creates one as part of
          // the checkout flow itself.
          disabled={(wallets.length > 0 && !selectedWalletId) || confirmLoading}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {confirmLoading ? 'Processing…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectWalletModal;
