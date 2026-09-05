import React, { useState, useEffect, useRef } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import attendanceApi from '@/api/tenant/attendance/attendanceApi';
import {
  fetchTerms,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

// ── Reusable filter dropdowns for analytics modals (local state) ──
// Shared by AttendanceAnalyticsCards.jsx and PsychomotorAnalyticsCards.jsx so
// every stat-card modal in the module offers the exact same Session → Term →
// Week → Programme → Class → Class/Arm filter set, in the same order, as the
// main marking table's own top filter bar.
const ModalFilterDropdowns = ({
  sessions,
  terms,
  weeks,
  programmes,
  classes,
  arms,
  initialFilters,
  onApply,
  applyLabel = 'Apply Filter',
  activeWeekId,
}) => {
  const activeWeekIdRef = useRef(activeWeekId);
  useEffect(() => {
    activeWeekIdRef.current = activeWeekId;
  }, [activeWeekId]);

  const normalizedInitial = {
    session: String(initialFilters?.session || ''),
    term: String(initialFilters?.term || ''),
    week: String(initialFilters?.week || ''),
    programme: String(initialFilters?.programme || ''),
    class: String(initialFilters?.class || ''),
    arm: String(initialFilters?.arm || ''),
  };

  const [localFilters, setLocalFilters] = useState(normalizedInitial);

  const [localTerms, setLocalTerms] = useState(terms);
  const [localWeeks, setLocalWeeks] = useState(weeks);
  const [localClasses, setLocalClasses] = useState(classes);
  const [localArms, setLocalArms] = useState(arms);

  // Sync localFilters when initialFilters change (key may not always trigger remount)
  useEffect(() => {
    setLocalFilters(normalizedInitial);
  }, [
    normalizedInitial.session,
    normalizedInitial.term,
    normalizedInitial.week,
    normalizedInitial.programme,
    normalizedInitial.class,
    normalizedInitial.arm,
  ]);

  useEffect(() => {
    if (!localFilters.session) return;
    fetchTerms(localFilters.session)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setLocalTerms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.session]);

  useEffect(() => {
    if (!localFilters.session || !localFilters.term) return;
    let cancelled = false;
    attendanceApi
      .getWeeksBySessionTerm({ session_id: localFilters.session, term_id: localFilters.term })
      .then((r) => {
        if (cancelled) return;
        const d = r.data?.data || [];
        const weeks = Array.isArray(d) ? d : [];
        setLocalWeeks(weeks);
        const wkId = activeWeekIdRef.current;
        if (weeks.length > 0 && !localFilters.week) {
          const match = wkId ? weeks.find((w) => String(w.week_id) === wkId) : null;
          const active =
            match || weeks.find((w) => w.status === 'active') || weeks[weeks.length - 1];
          if (active) {
            setLocalFilters((prev) => {
              if (prev.week) return prev;
              return { ...prev, week: String(active.wk_id ?? active.week_id ?? active.id) };
            });
          }
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [localFilters.session, localFilters.term]);

  useEffect(() => {
    if (!localFilters.programme) return;
    fetchClassesByProgramme(localFilters.programme)
      .then((r) => {
        const d = r.data?.data || r.data || [];
        setLocalClasses(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.programme]);

  useEffect(() => {
    if (!localFilters.class) return;
    fetchClassArmsByClass(localFilters.class, { programme_id: localFilters.programme || undefined })
      .then((r) => {
        const d = r.data || [];
        setLocalArms(Array.isArray(d) ? d : []);
      })
      .catch(console.error);
  }, [localFilters.class, localFilters.programme]);

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Session</InputLabel>
          <Select
            value={String(localFilters.session || '')}
            label="Session"
            onChange={(e) => handleChange('session', e.target.value)}
          >
            {sessions.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.session_name || s.name || s.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Term</InputLabel>
          <Select
            value={String(localFilters.term || '')}
            label="Term"
            onChange={(e) => handleChange('term', e.target.value)}
          >
            {localTerms.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>
                {t.term_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Week</InputLabel>
          <Select
            value={String(localFilters.week || '')}
            label="Week"
            onChange={(e) => handleChange('week', e.target.value)}
          >
            {localWeeks.map((w) => {
              const weekId = String(w.wk_id ?? w.week_id ?? w.id);
              return (
                <MenuItem key={weekId} value={weekId}>
                  {w.week_name || `Week ${weekId}`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Programme</InputLabel>
          <Select
            value={String(localFilters.programme || '')}
            label="Programme"
            onChange={(e) => handleChange('programme', e.target.value)}
          >
            {programmes.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.programme_name || p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class</InputLabel>
          <Select
            value={String(localFilters.class || '')}
            label="Class"
            onChange={(e) => handleChange('class', e.target.value)}
          >
            {localClasses.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.class_name || c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 1.7 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Class/Arm</InputLabel>
          <Select
            value={String(localFilters.arm || '')}
            label="Class/Arm"
            onChange={(e) => handleChange('arm', e.target.value)}
          >
            {localArms.map((a) => (
              <MenuItem key={a.id} value={String(a.id)}>
                {a.class_arm_names}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 1.8 }}>
        <Button variant="contained" size="small" fullWidth onClick={handleApply}>
          {applyLabel}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ModalFilterDropdowns;
