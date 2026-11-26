import React, { useEffect, useState } from 'react';
import { Box, FormControl, Select, MenuItem, Typography, useTheme } from '@mui/material';
import { IconCalendar, IconCalendarStats } from '@tabler/icons';
import { fetchWeeks } from '@/api/tenant/term-weeks/weekApi';

const selectSx = {
  borderRadius: '8px',
  fontSize: 13.5,
  fontWeight: 600,
  minWidth: 170,
};

/**
 * The "actual cards" filter — fully independent of the page's own top
 * Period/Compare dropdowns (those stay dedicated to the stats row's
 * growth-vs-compare numbers only; see FinanceReportController's
 * resolveCardsPeriod()/resolveWeekRange()/resolveAsAtWeekDate() docblocks).
 *
 * `mode="range"` (Income & Expenditure: a flow over a period) lets the user
 * narrow the selected term down to a from/to week range. `mode="asAt"`
 * (Balance Sheet: a point-in-time snapshot) instead lets them pick a single
 * week, snapshotting "as at" that week's end date.
 */
const CardsPeriodFilter = ({ mode, periods, value, onChange }) => {
  const theme = useTheme();
  const [weeks, setWeeks] = useState([]);

  const currentPeriod = periods.find((p) => p.id === value.periodId);
  const sessionTermId = currentPeriod?.id;

  useEffect(() => {
    if (!sessionTermId) {
      setWeeks([]);
      return;
    }
    fetchWeeks(sessionTermId)
      .then((res) => setWeeks(res?.data || []))
      .catch(() => setWeeks([]));
  }, [sessionTermId]);

  const handlePeriodChange = (periodId) => {
    if (mode === 'range') onChange({ periodId, weekFromId: '', weekToId: '' });
    else onChange({ periodId, asAtWeekId: '' });
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconCalendarStats size={15} color={theme.palette.text.secondary} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Cards:
        </Typography>
      </Box>

      <FormControl size="small">
        <Select
          value={value.periodId || ''}
          onChange={(e) => handlePeriodChange(e.target.value)}
          displayEmpty
          startAdornment={<IconCalendar size={14} style={{ marginRight: 6 }} />}
          sx={selectSx}
          renderValue={(val) => periods.find((p) => p.id === val)?.period_label || 'Select period'}
        >
          {periods.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.period_label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {mode === 'range' ? (
        <>
          <FormControl size="small" disabled={weeks.length === 0}>
            <Select
              value={value.weekFromId || ''}
              onChange={(e) => onChange({ ...value, weekFromId: e.target.value })}
              displayEmpty
              sx={{ ...selectSx, minWidth: 130 }}
              renderValue={(val) => (val ? weeks.find((w) => w.wk_id === val)?.week_name : 'From week (whole term)')}
            >
              <MenuItem value="">Whole term</MenuItem>
              {weeks.map((w) => (
                <MenuItem key={w.wk_id} value={w.wk_id}>
                  {w.week_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>to</Typography>
          <FormControl size="small" disabled={weeks.length === 0 || !value.weekFromId}>
            <Select
              value={value.weekToId || ''}
              onChange={(e) => onChange({ ...value, weekToId: e.target.value })}
              displayEmpty
              sx={{ ...selectSx, minWidth: 130 }}
              renderValue={(val) => (val ? weeks.find((w) => w.wk_id === val)?.week_name : 'To week')}
            >
              {weeks.map((w) => (
                <MenuItem key={w.wk_id} value={w.wk_id}>
                  {w.week_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      ) : (
        <FormControl size="small" disabled={weeks.length === 0}>
          <Select
            value={value.asAtWeekId || ''}
            onChange={(e) => onChange({ ...value, asAtWeekId: e.target.value })}
            displayEmpty
            sx={{ ...selectSx, minWidth: 170 }}
            renderValue={(val) => (val ? `As at ${weeks.find((w) => w.wk_id === val)?.week_name}` : 'As at end of term')}
          >
            <MenuItem value="">As at end of term</MenuItem>
            {weeks.map((w) => (
              <MenuItem key={w.wk_id} value={w.wk_id}>
                As at {w.week_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default CardsPeriodFilter;
