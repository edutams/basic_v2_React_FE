import { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Menu,
  MenuItem as MenuOption,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tooltip,
  Skeleton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Stack,
  Select,
  Pagination,
  FormControl,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Save as SaveIcon,
  Tune as TuneIcon,
  SwapHoriz as MigrateIcon,
  SyncAlt as SyncAltIcon,
} from '@mui/icons-material';
import ReusableModal from '@/components/shared/ReusableModal';
import {
  fetchPaymentSchedules,
  deletePaymentSchedule,
  deletePaymentSchedulesByPaymentName,
  togglePaymentScheduleStatus,
  getPaidStudentsForSchedule,
  batchUpsertPaymentSchedule,
} from '@/api/tenant/bursary/bursarySettingsApi';
import { fetchInstallments } from '@/api/tenant/bursary/installmentApi';
import { updatePaymentNamePayOption } from '@/api/tenant/bursary/paymentNameApi';

const SCHEME_MAP = [
  { bg: '#DBEAFE', color: '#2563EB' },
  { bg: '#DCFCE7', color: '#16A34A' },
  { bg: '#F3E8FF', color: '#9333EA' },
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#FEE2E2', color: '#DC2626' },
];

/** Compulsory/Optional — a plain read-only pill. Changing it now lives in
 * the row's Action menu (with its own confirmation), not inline here. */
const RequirementBadge = ({ value }) => {
  const isOptional = String(value).toLowerCase() === 'optional';
  return (
    <Chip
      label={isOptional ? 'Optional' : 'Compulsory'}
      size="small"
      sx={{
        bgcolor: isOptional ? '#FFEDD5' : '#DCFCE7',
        color: isOptional ? '#C2410C' : '#15803D',
        fontWeight: 600,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

/**
 * One payment-item x class cell: an enable/disable toggle, an inline ₦
 * amount field (a local, pending edit until "Save Changes" — pulses an
 * amber ring while unsaved), and an installment select. Empty cells show
 * "Not Set" in red; a class that's been deactivated is tinted red and
 * struck through so it reads as "off" at a glance, not just a grey switch.
 */
const ScheduleCell = ({
  cls,
  pending,
  installments,
  defaultInstallmentIds,
  onAmountChange,
  onInstallmentChange,
  onToggle,
  onDelete,
  disabled,
}) => {
  const hasSchedule = Boolean(cls.schedule_id);
  const isInactive = hasSchedule && cls.status === 'inactive';
  const locked = cls.invoices_count > 0;
  const amountValue = pending?.amount !== undefined ? pending.amount : cls.amount || '';
  // The system-default (100%, pay-in-full) installment reads as "Default
  // installment" here, same as if none were set at all — it's the same
  // thing, so there's no need to call it out as its own selected value.
  const currentInstallmentId = cls.bursary_installment_id || '';
  const normalizedInstallmentId = defaultInstallmentIds.has(currentInstallmentId) ? '' : currentInstallmentId;
  const installmentValue = pending?.installmentId !== undefined ? pending.installmentId : normalizedInstallmentId;
  const isDirty =
    (pending?.amount !== undefined && String(pending.amount) !== String(cls.amount || '')) ||
    (pending?.installmentId !== undefined && String(pending.installmentId) !== String(normalizedInstallmentId));
  // Hide the picker entirely when there's genuinely nothing else to pick —
  // only the 100% default in play, everywhere. It still shows for a class
  // that's already pinned to a plan since deactivated, so that honestly
  // stays visible instead of silently disappearing.
  const hasActiveAlternative = installments.some((i) => i.status === 'active');
  const showInstallmentPicker = hasActiveAlternative || normalizedInstallmentId !== '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 210, py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip
          title={
            hasSchedule
              ? cls.status === 'active'
                ? 'Deactivate for this class'
                : 'Activate for this class'
              : 'Set a price to enable'
          }
        >
          <span>
            <Switch
              size="small"
              checked={hasSchedule && cls.status === 'active'}
              onChange={onToggle}
              disabled={disabled || !hasSchedule}
              color={isInactive ? 'error' : 'primary'}
            />
          </span>
        </Tooltip>
        <Tooltip title={locked ? `Cannot edit: attached to ${cls.invoices_count} invoice(s)` : ''}>
          <TextField
            size="small"
            type="number"
            placeholder="Not Set"
            value={amountValue}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled || locked}
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
            sx={{
              width: 130,
              '@keyframes pulseDirty': {
                '0%, 100%': { boxShadow: '0 0 0 0 rgba(237,108,2,0.45)' },
                '50%': { boxShadow: '0 0 0 4px rgba(237,108,2,0)' },
              },
              animation: isDirty ? 'pulseDirty 1.3s ease-in-out infinite' : 'none',
              '& input::placeholder': { color: 'error.main', opacity: 1, fontWeight: 600, fontSize: '0.78rem' },
              '& .MuiOutlinedInput-root': {
                bgcolor: isInactive
                  ? 'rgba(220,38,38,0.06)'
                  : isDirty
                    ? 'warning.lighter'
                    : 'transparent',
                '& input': isInactive
                  ? { textDecoration: 'line-through', color: 'text.disabled' }
                  : undefined,
                // Visible by default, not just on :hover — the border
                // color/width here is the resting state, and the explicit
                // :hover rule below just repeats it so nothing changes
                // (and nothing "appears") on hover.
                '& fieldset': {
                  borderWidth: '1.5px',
                  borderStyle: hasSchedule ? 'solid' : 'dashed',
                  borderColor: isDirty
                    ? 'warning.main'
                    : isInactive
                      ? 'error.main'
                      : hasSchedule
                        ? 'grey.400'
                        : 'error.main',
                },
                '&:hover fieldset': {
                  borderWidth: '1.5px',
                  borderStyle: hasSchedule ? 'solid' : 'dashed',
                  borderColor: isDirty
                    ? 'warning.main'
                    : isInactive
                      ? 'error.main'
                      : hasSchedule
                        ? 'grey.400'
                        : 'error.main',
                },
              },
            }}
          />
        </Tooltip>
        {hasSchedule ? (
          <Tooltip
            title={
              locked
                ? `Cannot remove: attached to ${cls.invoices_count} invoice(s)`
                : 'Remove price for this class'
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={onDelete}
                disabled={disabled || locked}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Not set for this class yet">
            <span>
              <IconButton size="small" disabled sx={{ color: 'text.disabled' }}>
                <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      {/* Only shown once an alternative installment plan actually exists —
       * with nothing but the 100% default in play, every class is the
       * default anyway, so a selector with one meaningless option is just
       * noise. It appears automatically for every cell the moment a real
       * plan is created in Bursary Setup. */}
      {showInstallmentPicker && (
        <FormControl size="small" variant="standard" sx={{ pl: '38px' }}>
          <Select
            value={installmentValue}
            onChange={(e) => onInstallmentChange(e.target.value)}
            disabled={disabled || locked}
            displayEmpty
            disableUnderline
            sx={{
              fontSize: 11,
              color: 'text.secondary',
              '& .MuiSelect-select': { py: '2px !important' },
            }}
          >
            <MenuOption value="" sx={{ fontSize: 12 }}>
              Default installment
            </MenuOption>
            {installments.map((inst) => {
              const isInactiveInstallment = inst.status !== 'active';
              const label = inst.code
                ? `${inst.code} — ${inst.inst1}% / ${inst.inst2}%`
                : `${inst.inst1}% / ${inst.inst2}%`;
              return (
                <MenuOption
                  key={inst.id}
                  value={inst.id}
                  // Disabled so it can't be picked for a NEW assignment, but
                  // still rendered so a class already using it (since
                  // deactivated in Bursary Setup) still shows correctly here
                  // instead of going blank.
                  disabled={isInactiveInstallment}
                  sx={{ fontSize: 12, fontStyle: isInactiveInstallment ? 'italic' : 'normal' }}
                >
                  {label}
                  {isInactiveInstallment ? ' (Inactive)' : ''}
                </MenuOption>
              );
            })}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

/** Small reusable confirmation dialog — every mutating action on this page
 * goes through one of these so the admin always sees what's about to
 * happen before it happens. */
const ConfirmDialog = ({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
  loading,
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
    <DialogContent>{children}</DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button variant="contained" size="small" color="inherit" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        size="small"
        color={confirmColor}
        onClick={onConfirm}
        disabled={loading}
        sx={{ fontWeight: 600 }}
      >
        {loading ? 'Processing...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

const PaymentScheduleGrid = forwardRef(
  (
    {
      showSnackbar,
      sessionId,
      activeTermId,
      categoryId,
      payType = 'bursary',
      classesOverview = [],
      onOpenMigrate,
      refreshStats,
      scheduleRefreshKey = 0,
    },
    ref,
  ) => {
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [scheduleData, setScheduleData] = useState([]);
    const [installments, setInstallments] = useState([]);
    // ids of the system-default (100%, pay-in-full) installment(s) — a
    // class using one of these is displayed as "Default installment", not
    // as its own selected option, since they mean the same thing.
    const [defaultInstallmentIds, setDefaultInstallmentIds] = useState(new Set());
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // { [paymentNameId]: { [classId]: { amount?, installmentId? } } } — unsaved edits.
    const [pendingEdits, setPendingEdits] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, schedule: null });
    const [payOptionDialog, setPayOptionDialog] = useState({
      open: false,
      schedule: null,
      nextValue: null,
    });
    const [processingAction, setProcessingAction] = useState(false);

    const [classActionDialog, setClassActionDialog] = useState({
      open: false,
      action: null, // 'delete' or 'toggle'
      schedule: null,
      classData: null,
    });
    const [paidStudents, setPaidStudents] = useState({ loading: false, data: null });

    const [bulkModal, setBulkModal] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
    const [bulkClassId, setBulkClassId] = useState('');
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkSelectedItems, setBulkSelectedItems] = useState([]);
    const [bulkSaving, setBulkSaving] = useState(false);

    const tableContainerRef = useRef(null);

    useImperativeHandle(ref, () => ({
      scrollToClass: (classId) => {
        const target = tableContainerRef.current?.querySelector(`[data-class-id="${classId}"]`);
        target?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      },
    }));

    useEffect(() => {
      // The real Bursary Setup CRUD endpoint — includes `status`, unlike
      // the settings one, so a class whose schedule already uses an
      // installment that's since been deactivated still displays
      // correctly (just not selectable for a new assignment).
      fetchInstallments(1, 100)
        .then((res) => {
          const list = Array.isArray(res?.data?.data) ? res.data.data : [];
          // The system default (is_sys, 100% in one go) is never offered
          // as its own menu option — it's exactly what "Default
          // installment" already means, so listing it again would just be
          // the same thing twice with two different labels.
          setInstallments(list.filter((i) => i.is_sys !== 'YES'));
          setDefaultInstallmentIds(new Set(list.filter((i) => i.is_sys === 'YES').map((i) => i.id)));
        })
        .catch(() => {});
    }, []);

    // Real class list (with student counts) — supplied by the parent, which
    // already loads it for the Classes row, rather than fetching it again
    // here too.
    const allClasses = useMemo(
      () =>
        classesOverview.map((cls) => ({
          id: cls.id,
          class_code: cls.class_code,
          class_name: cls.class_name,
          student_count: cls.student_count,
        })),
      [classesOverview],
    );

    const loadPaymentSchedules = async (search = '') => {
      if (!sessionId || !activeTermId || !categoryId) return;
      try {
        setLoadingSchedules(true);
        // No pay_option passed — combines Compulsory + Optional, sorted
        // compulsory-first by the backend.
        const data = await fetchPaymentSchedules(
          sessionId,
          activeTermId,
          categoryId,
          undefined,
          payType,
          search,
        );

        if (data?.data && Array.isArray(data.data)) {
          const transformed = data.data.map((paymentName) => {
            const scheduledClasses =
              paymentName.payschedules?.map((schedule) => ({
                id: schedule.class_id,
                name:
                  schedule.my_class?.class_code ||
                  schedule.my_class?.class_name ||
                  `Class ${schedule.class_id}`,
                amount: schedule.amount || 0,
                schedule_id: schedule.id,
                bursary_installment_id: schedule.bursary_installment_id,
                status: schedule.status,
                invoices_count: schedule.invoices_count || 0,
              })) || [];

            const scheduledIds = new Set(scheduledClasses.map((c) => c.id));
            const unscheduledClasses = allClasses
              .filter((cls) => !scheduledIds.has(cls.id))
              .map((cls) => ({
                id: cls.id,
                name: cls.class_code || cls.class_name || `Class ${cls.id}`,
                amount: 0,
                schedule_id: null,
                bursary_installment_id: null,
                status: null,
                invoices_count: 0,
              }));

            // Keep column order stable and matching allClasses, regardless of
            // which classes already have a schedule.
            const byId = new Map(
              [...scheduledClasses, ...unscheduledClasses].map((c) => [c.id, c]),
            );
            const classes = allClasses.map((cls) => byId.get(cls.id)).filter(Boolean);

            return {
              payment_name: { id: paymentName.id, name: paymentName.name },
              pay_option: paymentName.pay_option,
              classes,
              missingCount: classes.filter((c) => !c.amount || c.amount === 0).length,
              hasInvoices: classes.some((c) => c.invoices_count > 0),
            };
          });

          setScheduleData(transformed);
        } else {
          setScheduleData([]);
        }
      } catch (err) {
        showSnackbar?.('Failed to load payment schedules', 'error');
        console.error('Error loading schedules:', err);
      } finally {
        setLoadingSchedules(false);
      }
    };

    useEffect(() => {
      loadPaymentSchedules(searchQuery);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, activeTermId, categoryId, scheduleRefreshKey, allClasses, searchQuery]);

    // Debounced search-as-you-type.
    useEffect(() => {
      const handle = setTimeout(() => setSearchQuery(searchInput), 350);
      return () => clearTimeout(handle);
    }, [searchInput]);

    // ---- Local ("real time") mutation helpers — no table-wide reload ----

    const recomputeRowFlags = (row) => ({
      ...row,
      missingCount: row.classes.filter((c) => !c.amount || c.amount === 0).length,
      hasInvoices: row.classes.some((c) => c.invoices_count > 0),
    });

    const patchClassLocally = (paymentNameId, classId, patch) => {
      setScheduleData((prev) =>
        prev.map((row) => {
          if (row.payment_name.id !== paymentNameId) return row;
          const classes = row.classes.map((c) => (c.id === classId ? { ...c, ...patch } : c));
          return recomputeRowFlags({ ...row, classes });
        }),
      );
    };

    const patchPayOptionLocally = (paymentNameId, nextValue) => {
      setScheduleData((prev) => {
        const next = prev.map((row) =>
          row.payment_name.id === paymentNameId ? { ...row, pay_option: nextValue } : row,
        );
        // Stable re-sort, compulsory first — mirrors the backend's own
        // ordering so the row visibly moves into its new group immediately.
        return [...next].sort((a, b) => {
          const aOpt = String(a.pay_option).toLowerCase() === 'optional' ? 1 : 0;
          const bOpt = String(b.pay_option).toLowerCase() === 'optional' ? 1 : 0;
          return aOpt - bOpt;
        });
      });
    };

    const handleAmountChange = (paymentNameId, classId, value) => {
      setPendingEdits((prev) => ({
        ...prev,
        [paymentNameId]: {
          ...(prev[paymentNameId] || {}),
          [classId]: { ...(prev[paymentNameId]?.[classId] || {}), amount: value },
        },
      }));
    };

    const handleInstallmentChange = (paymentNameId, classId, value) => {
      setPendingEdits((prev) => ({
        ...prev,
        [paymentNameId]: {
          ...(prev[paymentNameId] || {}),
          [classId]: { ...(prev[paymentNameId]?.[classId] || {}), installmentId: value },
        },
      }));
    };

    const dirtyPaymentNameIds = useMemo(
      () =>
        Object.entries(pendingEdits)
          .filter(([, classEdits]) =>
            Object.values(classEdits).some(
              (e) => e.amount !== undefined || e.installmentId !== undefined,
            ),
          )
          .map(([id]) => Number(id)),
      [pendingEdits],
    );

    const performSaveChanges = async () => {
      setSaving(true);
      let totalSkipped = 0;
      try {
        await Promise.all(
          dirtyPaymentNameIds.map(async (paymentNameId) => {
            const row = scheduleData.find((r) => r.payment_name.id === paymentNameId);
            if (!row) return;
            const edits = pendingEdits[paymentNameId] || {};

            const classes = row.classes
              .map((cls) => {
                const edit = edits[cls.id];
                const amount = edit?.amount !== undefined ? parseFloat(edit.amount) : cls.amount;
                if (!amount || amount <= 0) return null;
                const installmentId =
                  edit?.installmentId !== undefined
                    ? edit.installmentId
                    : cls.bursary_installment_id;
                return {
                  class_id: cls.id,
                  amount,
                  ...(cls.schedule_id && { schedule_id: cls.schedule_id }),
                  ...(installmentId && { bursary_installment_id: installmentId }),
                };
              })
              .filter(Boolean);

            if (classes.length === 0) return;

            const res = await batchUpsertPaymentSchedule({
              bursary_payment_name_id: paymentNameId,
              session_id: sessionId,
              term_id: activeTermId,
              bursary_payment_category_id: categoryId,
              classes,
            });

            if (res?.data?.skipped?.length) {
              totalSkipped += res.data.skipped.length;
            }

            // Merge the real saved result straight into local state —
            // this is what makes "Save Changes" update the table instantly
            // instead of re-fetching everything from the server.
            (res?.data?.schedules || []).forEach((saved) => {
              patchClassLocally(paymentNameId, saved.class_id, {
                schedule_id: saved.schedule_id,
                amount: saved.amount,
                status: saved.status,
                bursary_installment_id: saved.bursary_installment_id,
              });
            });
          }),
        );

        showSnackbar?.(
          totalSkipped > 0
            ? `Changes saved — ${totalSkipped} class(es) skipped because they already have payment transactions`
            : 'Payment schedule changes saved successfully',
          totalSkipped > 0 ? 'warning' : 'success',
        );
        setPendingEdits({});
        refreshStats?.();
      } catch (err) {
        showSnackbar?.(err?.response?.data?.message || 'Failed to save changes', 'error');
      } finally {
        setSaving(false);
        setSaveConfirmOpen(false);
      }
    };

    const handleDiscardChanges = () => setPendingEdits({});

    const closeClassActionDialog = () => {
      setClassActionDialog({ open: false, action: null, schedule: null, classData: null });
      setPaidStudents({ loading: false, data: null });
    };

    const handleClassActionClick = (schedule, cls, action) => {
      setClassActionDialog({ open: true, action, schedule, classData: cls });

      const isDeactivating = action === 'toggle' && (cls.status || 'active') === 'active';
      if (isDeactivating && cls.schedule_id) {
        setPaidStudents({ loading: true, data: null });
        getPaidStudentsForSchedule(cls.schedule_id)
          .then((res) => setPaidStudents({ loading: false, data: res.success ? res.data : null }))
          .catch(() => setPaidStudents({ loading: false, data: null }));
      } else {
        setPaidStudents({ loading: false, data: null });
      }
    };

    const handleConfirmClassAction = async () => {
      if (!classActionDialog.classData) return;
      const paymentNameId = classActionDialog.schedule.payment_name.id;
      const classId = classActionDialog.classData.id;
      try {
        setProcessingAction(true);

        if (classActionDialog.action === 'delete') {
          const response = await deletePaymentSchedule(classActionDialog.classData.schedule_id);
          if (response.success) {
            showSnackbar?.(`${classActionDialog.classData.name} removed successfully`, 'success');
            patchClassLocally(paymentNameId, classId, {
              schedule_id: null,
              amount: 0,
              status: null,
              invoices_count: 0,
              bursary_installment_id: null,
            });
            refreshStats?.();
          } else {
            showSnackbar?.(response.message || 'Failed to delete class schedule', 'error');
          }
        } else if (classActionDialog.action === 'toggle') {
          const currentStatus = classActionDialog.classData.status || 'active';
          const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
          const response = await togglePaymentScheduleStatus(
            classActionDialog.classData.schedule_id,
            newStatus,
          );
          if (response.success) {
            showSnackbar?.(
              `${classActionDialog.classData.name} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
              'success',
            );
            patchClassLocally(paymentNameId, classId, { status: newStatus });
            refreshStats?.();
          } else {
            showSnackbar?.(response.message || 'Failed to toggle class schedule', 'error');
          }
        }
        closeClassActionDialog();
      } catch (err) {
        showSnackbar?.(err.response?.data?.message || 'Failed to process action', 'error');
      } finally {
        setProcessingAction(false);
      }
    };

    const handleMenuOpen = (event, row) => {
      setMenuAnchor(event.currentTarget);
      setSelectedRow(row);
    };
    const handleMenuClose = () => {
      setMenuAnchor(null);
      setSelectedRow(null);
    };

    const handleDeleteSchedule = () => {
      handleMenuClose();
      setDeleteDialog({ open: true, schedule: selectedRow });
    };

    const handleConfirmDelete = async () => {
      const scheduleToDelete = deleteDialog.schedule;
      if (!scheduleToDelete) return;
      try {
        setProcessingAction(true);
        const response = await deletePaymentSchedulesByPaymentName(
          scheduleToDelete.payment_name?.id,
        );
        if (response.success) {
          showSnackbar?.(
            `Payment item "${scheduleToDelete.payment_name?.name}" schedule deleted successfully`,
            'success',
          );
          setScheduleData((prev) =>
            prev.map((row) =>
              row.payment_name.id !== scheduleToDelete.payment_name.id
                ? row
                : recomputeRowFlags({
                    ...row,
                    classes: row.classes.map((c) => ({
                      ...c,
                      schedule_id: null,
                      amount: 0,
                      status: null,
                      invoices_count: 0,
                      bursary_installment_id: null,
                    })),
                  }),
            ),
          );
          refreshStats?.();
        } else {
          showSnackbar?.(response.message || 'Failed to delete payment item schedule', 'error');
        }
      } catch (err) {
        showSnackbar?.(
          err.response?.data?.message || 'Failed to delete payment item schedule',
          'error',
        );
      } finally {
        setProcessingAction(false);
        setDeleteDialog({ open: false, schedule: null });
      }
    };

    const handleOpenPayOptionDialog = () => {
      handleMenuClose();
      const current = selectedRow.pay_option;
      const nextValue = String(current).toLowerCase() === 'optional' ? 'compulsory' : 'optional';
      setPayOptionDialog({ open: true, schedule: selectedRow, nextValue });
    };

    const handleConfirmPayOption = async () => {
      const { schedule, nextValue } = payOptionDialog;
      if (!schedule) return;
      try {
        setProcessingAction(true);
        await updatePaymentNamePayOption(schedule.payment_name.id, nextValue);
        showSnackbar?.(
          `"${schedule.payment_name.name}" marked as ${nextValue === 'optional' ? 'Optional' : 'Compulsory'}`,
          'success',
        );
        patchPayOptionLocally(schedule.payment_name.id, nextValue);
        refreshStats?.();
      } catch (err) {
        showSnackbar?.(err?.response?.data?.message || 'Failed to change requirement', 'error');
      } finally {
        setProcessingAction(false);
        setPayOptionDialog({ open: false, schedule: null, nextValue: null });
      }
    };

    const handleOpenBulkModal = () => {
      setBulkClassId('');
      setBulkAmount('');
      setBulkSelectedItems(scheduleData.map((r) => r.payment_name.id));
      setBulkModal(true);
    };

    const performBulkApply = async () => {
      setBulkSaving(true);
      try {
        let skipped = 0;
        await Promise.all(
          bulkSelectedItems.map(async (paymentNameId) => {
            const row = scheduleData.find((r) => r.payment_name.id === paymentNameId);
            const cls = row?.classes.find((c) => c.id === Number(bulkClassId));
            if (!cls) return;

            const res = await batchUpsertPaymentSchedule({
              bursary_payment_name_id: paymentNameId,
              session_id: sessionId,
              term_id: activeTermId,
              bursary_payment_category_id: categoryId,
              classes: [
                {
                  class_id: cls.id,
                  amount: parseFloat(bulkAmount),
                  ...(cls.schedule_id && { schedule_id: cls.schedule_id }),
                },
              ],
            });
            if (res?.data?.skipped?.length) skipped += res.data.skipped.length;

            (res?.data?.schedules || []).forEach((saved) => {
              patchClassLocally(paymentNameId, saved.class_id, {
                schedule_id: saved.schedule_id,
                amount: saved.amount,
                status: saved.status,
                bursary_installment_id: saved.bursary_installment_id,
              });
            });
          }),
        );

        showSnackbar?.(
          skipped > 0
            ? `Bulk update applied — ${skipped} item(s) skipped because they already have payment transactions`
            : 'Bulk update applied successfully',
          skipped > 0 ? 'warning' : 'success',
        );
        setBulkModal(false);
        refreshStats?.();
      } catch (err) {
        showSnackbar?.(err?.response?.data?.message || 'Failed to apply bulk update', 'error');
      } finally {
        setBulkSaving(false);
        setBulkConfirmOpen(false);
      }
    };

    const paginatedSchedules = scheduleData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
    const hasDirty = dirtyPaymentNameIds.length > 0;
    const pageCount = Math.max(1, Math.ceil(scheduleData.length / rowsPerPage));
    const showingFrom = scheduleData.length === 0 ? 0 : page * rowsPerPage + 1;
    const showingTo = Math.min((page + 1) * rowsPerPage, scheduleData.length);
    const bulkClassLabel = allClasses.find((c) => String(c.id) === String(bulkClassId))?.class_code;

    return (
      <Stack spacing={2}>
        <Paper
          sx={{
            p: 2,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: '#E5E7EB',
            boxShadow: 'none',
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            gap={2}
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1.25}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#F3E8FF',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TuneIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Compulsory Payment Items
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Set payment amounts for each class and category. Mark items as Compulsory or
                  Optional.
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              {/* <TextField
                placeholder="Search payment items..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 200 }}
              /> */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<TuneIcon fontSize="small" />}
                onClick={handleOpenBulkModal}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Bulk Update
              </Button>
              {hasDirty && (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleDiscardChanges}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Discard
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                startIcon={!saving && <SaveIcon fontSize="small" />}
                onClick={() => setSaveConfirmOpen(true)}
                disabled={!hasDirty || saving}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                {saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : 'Save Changes'}
              </Button>
              {onOpenMigrate && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MigrateIcon fontSize="small" />}
                  onClick={onOpenMigrate}
                  sx={{ fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' }}
                >
                  Migrate from Previous Term
                </Button>
              )}
            </Box>
          </Box>

          <TableContainer ref={tableContainerRef} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.75, px: 1 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Payment Item</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 110 }}>Status</TableCell>
                  {allClasses.map((cls, idx) => {
                    const scheme = SCHEME_MAP[idx % SCHEME_MAP.length];
                    return (
                      <TableCell
                        key={cls.id}
                        data-class-id={cls.id}
                        sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                      >
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '6px',
                              bgcolor: scheme.bg,
                              color: scheme.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {(cls.class_code || cls.class_name || '?').charAt(0)}
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              display="block"
                              lineHeight={1.2}
                            >
                              {cls.class_code || cls.class_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" lineHeight={1.2}>
                              ({cls.student_count ?? 0} students)
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSchedules ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4 + allClasses.length}>
                        <Skeleton variant="rounded" height={32} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + allClasses.length} align="center">
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        No payment items found
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSchedules.map((schedule, index) => (
                    <TableRow key={schedule.payment_name.id} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {schedule.payment_name.name}
                        </Typography>
                        {schedule.missingCount > 0 && (
                          <Typography variant="caption" color="error.main" display="block">
                            {schedule.missingCount} class(es) missing a price
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <RequirementBadge value={schedule.pay_option} />
                      </TableCell>
                      {schedule.classes.map((cls) => (
                        <TableCell key={cls.id}>
                          <ScheduleCell
                            cls={cls}
                            pending={pendingEdits[schedule.payment_name.id]?.[cls.id]}
                            installments={installments}
                            defaultInstallmentIds={defaultInstallmentIds}
                            onAmountChange={(val) =>
                              handleAmountChange(schedule.payment_name.id, cls.id, val)
                            }
                            onInstallmentChange={(val) =>
                              handleInstallmentChange(schedule.payment_name.id, cls.id, val)
                            }
                            onToggle={(e) => {
                              e.stopPropagation();
                              handleClassActionClick(schedule, cls, 'toggle');
                            }}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleClassActionClick(schedule, cls, 'delete');
                            }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, schedule)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer — "Showing X - Y of Z" + rows-per-page + numbered
           * pagination, matching the project's established convention
           * (see ReportSheetTab.jsx) rather than MUI's combined
           * TablePagination control. */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              pt: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Showing {showingFrom} - {showingTo} of {scheduleData.length} payment items
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <Select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  {[5, 10, 25, 50].map((n) => (
                    <MenuOption key={n} value={n}>
                      {n} / page
                    </MenuOption>
                  ))}
                </Select>
              </FormControl>
              <Pagination
                size="small"
                count={pageCount}
                page={page + 1}
                onChange={(_, p) => setPage(p - 1)}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Per-row action menu */}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
          <Tooltip
            title={
              selectedRow?.hasInvoices
                ? 'Cannot change: one or more classes have attached invoices'
                : ''
            }
            placement="left"
          >
            <span>
              <MenuOption onClick={handleOpenPayOptionDialog} disabled={selectedRow?.hasInvoices}>
                <SyncAltIcon sx={{ fontSize: 18, mr: 1 }} />
                Mark as{' '}
                {String(selectedRow?.pay_option).toLowerCase() === 'optional'
                  ? 'Compulsory'
                  : 'Optional'}
              </MenuOption>
            </span>
          </Tooltip>
          <Tooltip
            title={
              selectedRow?.hasInvoices
                ? 'Cannot delete: one or more classes have attached invoices'
                : ''
            }
            placement="left"
          >
            <span>
              <MenuOption
                onClick={handleDeleteSchedule}
                sx={{ color: selectedRow?.hasInvoices ? 'text.disabled' : 'error.main' }}
                disabled={selectedRow?.hasInvoices}
              >
                <DeleteIcon sx={{ fontSize: 18, mr: 1 }} />
                Delete Schedule (all classes)
              </MenuOption>
            </span>
          </Tooltip>
        </Menu>

        {/* Whole-item delete confirmation */}
        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Payment Item Schedule"
          confirmLabel={processingAction ? 'Deleting...' : 'Delete Item'}
          confirmColor="error"
          loading={processingAction}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteDialog({ open: false, schedule: null })}
        >
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body2">
            Are you sure you want to delete the schedule for{' '}
            <strong>{deleteDialog.schedule?.payment_name?.name}</strong> across all classes? Every
            class price for this item will be removed.
          </Typography>
        </ConfirmDialog>

        {/* Compulsory/Optional change confirmation */}
        <ConfirmDialog
          open={payOptionDialog.open}
          title="Change Payment Requirement"
          confirmLabel="Confirm Change"
          loading={processingAction}
          onConfirm={handleConfirmPayOption}
          onClose={() => setPayOptionDialog({ open: false, schedule: null, nextValue: null })}
        >
          <Typography variant="body2">
            Mark <strong>{payOptionDialog.schedule?.payment_name?.name}</strong> as{' '}
            <strong>{payOptionDialog.nextValue === 'optional' ? 'Optional' : 'Compulsory'}</strong>?
            This changes how it's treated when generating invoices for every class.
          </Typography>
        </ConfirmDialog>

        {/* Save Changes confirmation */}
        <ConfirmDialog
          open={saveConfirmOpen}
          title="Save Payment Schedule Changes"
          confirmLabel="Save Changes"
          loading={saving}
          onConfirm={performSaveChanges}
          onClose={() => setSaveConfirmOpen(false)}
        >
          <Typography variant="body2">
            This will save your price/installment changes for{' '}
            <strong>{dirtyPaymentNameIds.length}</strong> payment item
            {dirtyPaymentNameIds.length === 1 ? '' : 's'} across their classes. Continue?
          </Typography>
        </ConfirmDialog>

        {/* Per-class toggle/delete confirmation */}
        <Dialog
          open={classActionDialog.open}
          onClose={() => !processingAction && closeClassActionDialog()}
          maxWidth={paidStudents.data?.students?.length ? 'sm' : 'xs'}
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {classActionDialog.action === 'delete' ? 'Remove Class Price' : 'Toggle Class Status'}
          </DialogTitle>
          <DialogContent>
            {classActionDialog.action === 'delete' && (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This action cannot be undone!
                </Alert>
                <Typography variant="body2">
                  Are you sure you want to remove the price for{' '}
                  <strong>{classActionDialog.classData?.name}</strong> from{' '}
                  <strong>{classActionDialog.schedule?.payment_name?.name}</strong>?
                </Typography>
              </>
            )}
            {classActionDialog.action === 'toggle' && (
              <>
                <Typography variant="body2">
                  Are you sure you want to{' '}
                  {(classActionDialog.classData?.status || 'active') === 'active'
                    ? 'deactivate'
                    : 'activate'}{' '}
                  <strong>{classActionDialog.classData?.name}</strong> in{' '}
                  <strong>{classActionDialog.schedule?.payment_name?.name}</strong>?
                </Typography>

                {paidStudents.loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {!paidStudents.loading && paidStudents.data?.students?.length > 0 && (
                  <>
                    <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
                      {paidStudents.data.students.length} student(s) have already paid a total of{' '}
                      <strong>₦{Number(paidStudents.data.total_paid).toLocaleString()}</strong>{' '}
                      against this item. Deactivating it will <strong>not</strong> touch their
                      payments or refund anything.
                    </Alert>
                    <TableContainer
                      sx={{
                        maxHeight: 220,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paidStudents.data.students.map((s) => (
                            <TableRow key={s.user_pk}>
                              <TableCell>
                                {s.full_name}
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  {s.admission_no}
                                </Typography>
                              </TableCell>
                              <TableCell>₦{Number(s.total_paid).toLocaleString()}</TableCell>
                              <TableCell>{s.payment_types}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="inherit"
              onClick={closeClassActionDialog}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              size="small"
              color={classActionDialog.action === 'delete' ? 'error' : 'primary'}
              onClick={handleConfirmClassAction}
              disabled={processingAction}
              sx={{ fontWeight: 600 }}
            >
              {processingAction
                ? 'Processing...'
                : classActionDialog.action === 'delete'
                  ? 'Delete'
                  : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Update modal — applies one amount to one class across
         * several payment items at once, the "across the grain"
         * complement to per-cell inline editing. A confirmation step runs
         * before it actually applies. */}
        <ReusableModal
          open={bulkModal}
          onClose={() => setBulkModal(false)}
          title="Bulk Update"
          size="small"
          showCloseButton
          showDivider
        >
          <Stack spacing={2}>
            <TextField
              select
              label="Class"
              size="small"
              fullWidth
              value={bulkClassId}
              onChange={(e) => setBulkClassId(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="" />
              {allClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_code || cls.class_name}
                </option>
              ))}
            </TextField>
            <TextField
              label="Amount"
              size="small"
              type="number"
              fullWidth
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                display="block"
                mb={0.5}
              >
                Apply to
              </Typography>
              <Stack sx={{ maxHeight: 220, overflowY: 'auto' }}>
                {scheduleData.map((row) => (
                  <FormControlLabel
                    key={row.payment_name.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={bulkSelectedItems.includes(row.payment_name.id)}
                        onChange={(e) => {
                          setBulkSelectedItems((prev) =>
                            e.target.checked
                              ? [...prev, row.payment_name.id]
                              : prev.filter((id) => id !== row.payment_name.id),
                          );
                        }}
                      />
                    }
                    label={<Typography variant="body2">{row.payment_name.name}</Typography>}
                  />
                ))}
              </Stack>
            </Box>
            <Button
              variant="contained"
              onClick={() => setBulkConfirmOpen(true)}
              disabled={bulkSaving || !bulkClassId || !bulkAmount || bulkSelectedItems.length === 0}
            >
              {bulkSaving ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Apply'}
            </Button>
          </Stack>
        </ReusableModal>

        <ConfirmDialog
          open={bulkConfirmOpen}
          title="Apply Bulk Update"
          confirmLabel="Apply"
          loading={bulkSaving}
          onConfirm={performBulkApply}
          onClose={() => setBulkConfirmOpen(false)}
        >
          <Typography variant="body2">
            This will set <strong>₦{Number(bulkAmount || 0).toLocaleString()}</strong> for{' '}
            <strong>{bulkClassLabel}</strong> across <strong>{bulkSelectedItems.length}</strong>{' '}
            payment item{bulkSelectedItems.length === 1 ? '' : 's'}. Continue?
          </Typography>
        </ConfirmDialog>
      </Stack>
    );
  },
);

PaymentScheduleGrid.displayName = 'PaymentScheduleGrid';

export default PaymentScheduleGrid;
