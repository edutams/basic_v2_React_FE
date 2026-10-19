import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Button,
  Box,
} from '@mui/material';
import { fetchTenantSessions, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import { useNotification } from '@/hooks/useNotification';

/**
 * Bulk-assigns multiple selected teachers at once — one row per teacher,
 * each picking their own class arm (or, in subject mode, their own
 * subject within one shared class arm). Submits through the same
 * saveClassTeacherAllocations/saveSubjectTeacherAllocations endpoints the
 * full Class/Subject Allocation tabs already use (confirmed: each only
 * upserts the specific rows in its payload — a partial batch here never
 * touches any other class arm's existing allocation).
 */
const BulkAssignModal = ({ open, onClose, mode, teachers, classOptions, subjectOptions, onSuccess }) => {
  const notify = useNotification();
  const [activeSessionTermId, setActiveSessionTermId] = useState(null);
  const [resolvingTerm, setResolvingTerm] = useState(true);
  const [rows, setRows] = useState({}); // user_id => class_arm_id (classes mode)
  const [sharedClassArmId, setSharedClassArmId] = useState(''); // subjects mode
  const [subjectRows, setSubjectRows] = useState({}); // user_id => subject_id (subjects mode)
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRows({});
    setSubjectRows({});
    setSharedClassArmId('');
    setResolvingTerm(true);

    (async () => {
      try {
        const sessionsRes = await fetchTenantSessions({ pagination: false });
        const sessions = sessionsRes?.data || [];
        const activeSession = sessions.find((s) => s.status === 'active') || sessions[0];
        if (!activeSession) {
          notify.error('No session found');
          return;
        }
        const termsRes = await fetchSessionTerms(activeSession.id);
        const terms = termsRes?.data || [];
        const activeTerm = terms.find((t) => t.status === 'active') || terms[0];
        setActiveSessionTermId(activeTerm?.id || null);
      } catch {
        notify.error('Failed to resolve the active term');
      } finally {
        setResolvingTerm(false);
      }
    })();
  }, [open, notify]);

  const teacherName = (t) => `${t.user?.fname || ''} ${t.user?.lname || ''}`.trim();

  const readyCount = useMemo(() => {
    if (mode === 'classes') return Object.values(rows).filter(Boolean).length;
    return Object.values(subjectRows).filter(Boolean).length;
  }, [mode, rows, subjectRows]);

  const handleSubmit = async () => {
    if (!activeSessionTermId) return;
    setSubmitting(true);
    try {
      if (mode === 'classes') {
        const allocations = teachers
          .filter((t) => rows[t.user_id])
          .map((t) => ({ class_arm_id: rows[t.user_id], user_id: t.user_id }));

        if (allocations.length === 0) {
          notify.error('Pick a class for at least one teacher');
          return;
        }

        const res = await allocationApi.saveClassTeacherAllocations({
          session_term_id: activeSessionTermId,
          allocations,
        });
        if (res.status) {
          notify.success(`Assigned ${allocations.length} teacher(s) to a class`);
          onSuccess?.();
          onClose();
        } else {
          notify.error(res.message || 'Failed to assign classes');
        }
      } else {
        if (!sharedClassArmId) {
          notify.error('Pick a class arm first');
          return;
        }
        const allocations = teachers
          .filter((t) => subjectRows[t.user_id])
          .map((t) => ({ subject_id: subjectRows[t.user_id], user_id: t.user_id }));

        if (allocations.length === 0) {
          notify.error('Pick a subject for at least one teacher');
          return;
        }

        const res = await allocationApi.saveSubjectTeacherAllocations({
          session_term_id: activeSessionTermId,
          class_arm_id: sharedClassArmId,
          allocations,
        });
        if (res.status) {
          notify.success(`Assigned ${allocations.length} teacher(s) to a subject`);
          onSuccess?.();
          onClose();
        } else {
          notify.error(res.message || 'Failed to assign subjects');
        }
      }
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to save assignments');
    } finally {
      setSubmitting(false);
    }
  };

  const classArmLabel = (c) => [c?.programme_class?.class?.class_code, c?.class_arm_names].filter(Boolean).join(' ') || 'N/A';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'classes' ? 'Bulk Assign Classes' : 'Bulk Assign Subjects'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {mode === 'classes'
            ? 'Pick a class arm for each selected teacher. Rows left blank are skipped.'
            : "Pick one class arm, then a subject for each selected teacher within it. Rows left blank are skipped."}
        </Typography>

        {resolvingTerm ? (
          <Alert severity="info">Resolving the active term…</Alert>
        ) : !activeSessionTermId ? (
          <Alert severity="error">No active session term found — set one before assigning.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {mode === 'subjects' && (
              <FormControl size="small" fullWidth>
                <Select
                  displayEmpty
                  value={sharedClassArmId}
                  onChange={(e) => setSharedClassArmId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select class arm…</em>
                  </MenuItem>
                  {(classOptions || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {classArmLabel(c)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {teachers.map((t) => (
              <Stack key={t.user_id} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                <Avatar src={t.user?.avatar} sx={{ width: 28, height: 28 }}>
                  {teacherName(t)[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {teacherName(t)}
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  {mode === 'classes' ? (
                    <Select displayEmpty value={rows[t.user_id] || ''} onChange={(e) => setRows((r) => ({ ...r, [t.user_id]: e.target.value }))}>
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {(classOptions || []).map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {classArmLabel(c)}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      displayEmpty
                      value={subjectRows[t.user_id] || ''}
                      onChange={(e) => setSubjectRows((r) => ({ ...r, [t.user_id]: e.target.value }))}
                      disabled={!sharedClassArmId}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {(subjectOptions || []).map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.subject_name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || resolvingTerm || !activeSessionTermId || readyCount === 0}>
          {submitting ? 'Saving…' : `Assign (${readyCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignModal;
