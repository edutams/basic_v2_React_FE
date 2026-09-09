import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import { IconBuildingBank } from '@tabler/icons-react';
import ReusableModal from '@/components/shared/ReusableModal';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { useNotification } from '@/hooks/useNotification';
import { fetchSkoolPayBanks, resolveAccount, saveAccount } from '@/api/landlord/bank-service/bankService';

const EMPTY_FORM = { bankCode: '', bankName: '', account_number: '' };

// Organization-level "Bank Account Details" tab — lets an agent set/update
// the bank account their payouts (subscriptions/commission) are settled to.
// Two-step flow, matching the tenant Bursary Payment Name setup: resolve the
// account name against the selected bank first, let the user confirm it's
// really their account, only then persist it.
const BankAccountDetailsTab = ({ organizationId, organization, onSaved }) => {
  const notify = useNotification();

  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [resolving, setResolving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    const loadBanks = async () => {
      setBanksLoading(true);
      setBanksError(null);
      try {
        const res = await fetchSkoolPayBanks(organizationId);
        setBanks(res?.data?.result || []);
      } catch (err) {
        setBanksError(
          err?.response?.data?.message || 'Failed to load banks. Please set a bank service first.',
        );
      } finally {
        setBanksLoading(false);
      }
    };
    loadBanks();
  }, [organizationId]);

  const hasAccount = Boolean(organization?.bank_account?.wallet_no);

  const openEdit = () => {
    setForm(EMPTY_FORM);
    setEditOpen(true);
  };

  const handleResolve = async () => {
    if (!form.bankCode || !form.account_number) {
      notify.error('Select a bank and enter the account number');
      return;
    }
    setResolving(true);
    try {
      // ", " (comma + space) — the external validate-account endpoint splits
      // on this exact delimiter (explode(", ", $bank)) to pull the bank code
      // back out, and BankController::saveAccount() forwards this same
      // string straight through to a second external call.
      const bankValue = `${form.bankCode}, ${form.bankName}`;
      const res = await resolveAccount({
        organizationId,
        bank: bankValue,
        accountNumber: form.account_number,
      });
      // resolveAccount()'s envelope is { status, message, data: <external> },
      // and the external validate-account response is itself
      // { status: 'success', data: '<resolved name>' } — so the name is two
      // levels down.
      const name = res?.data?.data || '';
      if (!name) {
        notify.error('Could not verify this account number with the selected bank.');
        return;
      }
      setResolvedAccountName(name);
      setConfirmOpen(true);
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to validate account');
    } finally {
      setResolving(false);
    }
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const bankValue = `${form.bankCode}, ${form.bankName}`;
      await saveAccount({
        organizationId,
        bank: bankValue,
        accountNumber: form.account_number,
        name: organization?.organization_name,
        email: organization?.organization_email,
        phone: organization?.organization_phone,
      });
      notify.success('Bank account details saved successfully');
      setEditOpen(false);
      setForm(EMPTY_FORM);
      onSaved?.();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Failed to save bank account details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Bank Account Details
        </Typography>
        <Button variant="contained" size="small" startIcon={<IconBuildingBank size={16} />} onClick={openEdit}>
          {hasAccount ? 'Update Bank Account' : 'Set Up Bank Account'}
        </Button>
      </Box>

      {banksError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {banksError}
        </Alert>
      )}

      {hasAccount ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Account Number
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {organization.bank_account.wallet_no}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Account Name
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {organization.bank_account.wallet_account_name}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Wallet Balance
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ₦{Number(organization.bank_account.wallet_balance || 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Alert severity="info">No bank account has been set up for this organization yet.</Alert>
      )}

      <ReusableModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Bank Account Details"
        size="small"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {banksLoading ? (
            <Skeleton variant="rounded" height={40} />
          ) : (
            <TextField
              select
              fullWidth
              size="small"
              label="Select Bank Name"
              value={form.bankCode}
              onChange={(e) => {
                const selected = banks.find((b) => b.bank_code === e.target.value);
                setForm((p) => ({
                  ...p,
                  bankCode: e.target.value,
                  bankName: selected?.bank_name || '',
                }));
              }}
            >
              {banks.map((b) => (
                <MenuItem key={b.bank_code} value={b.bank_code}>
                  {b.bank_name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            size="small"
            label="Account Number"
            value={form.account_number}
            onChange={(e) => setForm((p) => ({ ...p, account_number: e.target.value }))}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={handleResolve} disabled={resolving}>
              {resolving ? 'Validating…' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </ReusableModal>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        title="Your Account Details"
        severity="info"
        confirmText={saving ? 'Saving…' : 'Yes Continue!'}
        cancelText="No, Exit!"
        message={
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">Account Name: {resolvedAccountName}</Typography>
            <Typography variant="body2">Account Number: {form.account_number}</Typography>
            <Typography variant="body2">Bank Name: {form.bankName}</Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default BankAccountDetailsTab;
