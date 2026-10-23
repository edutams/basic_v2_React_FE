import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import { useNotification } from 'src/hooks/useNotification';
import { getOpenBatches, createDraftAdmission } from '@/api/tenant/admission/admissionApi';
import { getFeeSummary } from '@/utils/feeSummary';

// ── Confirmation dialog ───────────────────────────────────────────────────────
const ConfirmApplyDialog = ({ batch, onConfirm, onCancel, submitting }) => {
  if (!batch) return null;

  const feeSummary = batch?.pre_application_payments
    ? getFeeSummary(batch.pre_application_payments)
    : [];
  const feeTotal = feeSummary.reduce((sum, f) => sum + f.amount, 0);
  const feeHasRange = feeSummary.some((f) => f.isRange);

  // Acceptance (post-application) fee — only owed later, once admitted and
  // ready to accept the offer, so it's shown separately here rather than
  // folded into the pre-application total the applicant pays right now.
  const acceptanceFeeSummary = batch?.post_application_payments
    ? getFeeSummary(batch.post_application_payments)
    : [];
  const acceptanceFeeTotal = acceptanceFeeSummary.reduce((sum, f) => sum + f.amount, 0);
  const acceptanceFeeHasRange = acceptanceFeeSummary.some((f) => f.isRange);

  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Confirm Application
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          You are about to apply for the following admission batch:
        </Typography>

        <Paper sx={{ borderRadius: 2, p: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Session
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            {batch?.session_term?.session?.session_name}{' '}
            {batch?.session_term?.term?.term_name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Batch
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            {batch.programme?.programme_name
              ? `${batch.programme.programme_name} — ${batch.batch_name}`
              : batch.batch_name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}
          >
            Available Classes
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1.5}>
            {batch.classes.map((cls) => (
              <Chip
                key={cls.id}
                label={cls.class_code}
                size="small"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: 11,
                  height: 22,
                }}
              />
            ))}
          </Stack>

          {batch?.require_payment && <Divider sx={{ my: 1.5 }} />}
          {batch?.require_payment && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.75 }}
              >
                Pre-Application Payment Breakdown
              </Typography>
              {feeSummary.length > 0 ? (
                <Stack spacing={0.75} mb={1}>
                  {feeSummary.map((fee) => (
                    <Box
                      key={fee.name}
                      display="flex"
                      justifyContent="space-between"
                      sx={{
                        py: 0.5,
                        px: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {fee.name}
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {fee.isRange
                          ? `₦${fee.amount.toLocaleString()} - ₦${fee.maxAmount.toLocaleString()}`
                          : `₦${fee.amount.toLocaleString()}`}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{
                      pt: 0.75,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      Total Pre-Application Fee
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {feeHasRange ? 'from ' : ''}₦{feeTotal.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                  No pre-application payments configured
                </Typography>
              )}

              {acceptanceFeeSummary.length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.75 }}
                  >
                    Acceptance Fee (paid later, only if admitted)
                  </Typography>
                  <Stack spacing={0.75} mb={1}>
                    {acceptanceFeeSummary.map((fee) => (
                      <Box
                        key={fee.name}
                        display="flex"
                        justifyContent="space-between"
                        sx={{ py: 0.5, px: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {fee.name}
                        </Typography>
                        <Typography variant="caption" fontWeight={700}>
                          {fee.isRange
                            ? `₦${fee.amount.toLocaleString()} - ₦${fee.maxAmount.toLocaleString()}`
                            : `₦${fee.amount.toLocaleString()}`}
                        </Typography>
                      </Box>
                    ))}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      sx={{ pt: 0.75, borderTop: 1, borderColor: 'divider' }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Total Acceptance Fee
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {acceptanceFeeHasRange ? 'from ' : ''}₦{acceptanceFeeTotal.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                    Only payable if this ward is admitted and you accept the offer — not part of
                    this application's upfront payment.
                  </Typography>
                </>
              )}
            </>
          )}
        </Paper>

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          By proceeding, you confirm that you want to start a new admission application for this
          batch.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={onCancel}
          color="inherit"
          disabled={submitting}
          sx={{ fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          size="small"
          onClick={onConfirm}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={14} /> : null}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {submitting ? 'Starting...' : 'Yes, Apply Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────
// createDraftOnApply: true for the "Apply Now" flow (a genuinely new
// application, so a draft Admission row must be created). NewApplication.jsx
// also reuses this modal for its "Change Admission Batch" action, mid-form
// on an application that already has a draft — that flow passes false so it
// doesn't spawn a second, orphaned draft; the batch change just updates
// local state, and admission_batch_id gets persisted on the next step save.
const AdmissionBatchModal = ({ open, onClose, onApply, createDraftOnApply = true }) => {
  const notify = useNotification();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmBatch, setConfirmBatch] = useState(null); // batch pending confirmation
  const [creatingDraft, setCreatingDraft] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setConfirmBatch(null);
      fetchOpenBatches();
    }
  }, [open]);

  const fetchOpenBatches = async () => {
    try {
      setLoading(true);
      const response = await getOpenBatches();
      const data = response?.data?.data || response?.data || [];
      setBatches(data);
    } catch (error) {
      console.error('Failed to fetch open batches:', error);
      notify.error('Failed to fetch admission batches');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmed = async () => {
    if (!createDraftOnApply) {
      onApply(confirmBatch);
      setConfirmBatch(null);
      onClose();
      return;
    }

    // "Apply Now" always means a brand-new application. The admission row
    // (and its id) is created here, before the form has even rendered, so
    // the application exists in the backend from the very first click —
    // not just once a step is completed. That's what makes it resumable
    // from a different device: there's no local-only state to lose.
    setCreatingDraft(true);
    try {
      const res = await createDraftAdmission(confirmBatch.id);
      const draft = res?.data;
      onApply(confirmBatch, draft);
      setConfirmBatch(null);
      onClose();
    } catch (error) {
      console.error('Failed to start application:', error);
      notify.error('Failed to start application. Please try again.');
    } finally {
      setCreatingDraft(false);
    }
  };

  return (
    <>
      <ReusableModal open={open} onClose={onClose} title="Select Admission Batch" size="extraLarge">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : batches.length === 0 ? (
          <Alert severity="info">No admission batches available at the moment.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, width: '13%' }}>Session Term</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '20%' }}>Application Batch</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '18%' }}>Division / Programme</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '15%' }}>Closing Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '17%' }}>Classes</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '17%' }}>Fee Required</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '10%' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {batches.map((batch) => {
                  const isSelected = selectedId === batch.id;
                  return (
                    <TableRow
                      key={batch.id}
                      hover
                      selected={isSelected}
                      onClick={() => setSelectedId(isSelected ? null : batch.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {batch?.session_term?.session?.session_name}{' '}
                          {batch?.session_term?.term?.term_name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{batch.batch_name}</Typography>
                      </TableCell>
                      <TableCell>
                        {batch?.programme ? (
                          <>
                            <Typography variant="body2" fontWeight={600}>
                              {batch.programme.division?.division_name || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {batch.programme.programme_name}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            All divisions
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{batch.closing_date}</Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {batch.classes.map((cls) => (
                            <Chip
                              key={cls.id}
                              label={cls.class_code}
                              size="small"
                              sx={{
                                bgcolor: '#E8E8E8',
                                color: '#333',
                                fontWeight: 600,
                                fontSize: 11,
                                height: 22,
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      {batch?.require_payment ? (
                        <TableCell>
                          {(batch?.pre_application_payments?.length > 0) ||
                          (batch?.post_application_payments?.length > 0) ? (
                            <Stack spacing={0.25}>
                              {batch?.pre_application_payments?.length > 0 &&
                                (() => {
                                  const feeSummary = getFeeSummary(batch.pre_application_payments);
                                  const total = feeSummary.reduce((sum, f) => sum + f.amount, 0);
                                  const hasRange = feeSummary.some((f) => f.isRange);
                                  return (
                                    <Typography
                                      variant="caption"
                                      color="primary.main"
                                      display="block"
                                      fontWeight={600}
                                    >
                                      Pre-Application:{' '}
                                      <strong style={{ color: '#000', fontWeight: 600 }}>
                                        {hasRange ? 'from ' : ''}₦{total.toLocaleString()}
                                      </strong>
                                    </Typography>
                                  );
                                })()}
                              {batch?.post_application_payments?.length > 0 &&
                                (() => {
                                  const feeSummary = getFeeSummary(batch.post_application_payments);
                                  const total = feeSummary.reduce((sum, f) => sum + f.amount, 0);
                                  const hasRange = feeSummary.some((f) => f.isRange);
                                  return (
                                    <Typography
                                      variant="caption"
                                      color="primary.main"
                                      display="block"
                                      fontWeight={600}
                                    >
                                      Acceptance Fee:{' '}
                                      <strong style={{ color: '#000', fontWeight: 600 }}>
                                        {hasRange ? 'from ' : ''}₦{total.toLocaleString()}
                                      </strong>
                                    </Typography>
                                  );
                                })()}
                            </Stack>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontStyle="italic"
                              fontSize={10}
                            >
                              No payments configured
                            </Typography>
                          )}
                        </TableCell>
                      ) : (
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="primary.main"
                            display="block"
                            fontWeight={600}
                          >
                            <strong>No Payment Required</strong>
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmBatch(batch);
                          }}
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          Apply Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </ReusableModal>

      {/* Confirmation dialog — rendered outside the main modal so it stacks on top */}
      {confirmBatch && (
        <ConfirmApplyDialog
          batch={confirmBatch}
          onConfirm={handleConfirmed}
          onCancel={() => setConfirmBatch(null)}
          submitting={creatingDraft}
        />
      )}
    </>
  );
};

export default AdmissionBatchModal;
