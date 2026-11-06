import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import SectionPaper from './SectionPaper';
import ActionBar from './ActionBar';
import {
  DUMMY_DATA_TYPES,
  DUMMY_NEW_FIELDS,
  DUMMY_NEEDS_ATTENTION,
  DUMMY_MATCH_RULES,
  DUMMY_LAST_DRY_RUN,
} from '../dummyData';

const CONFLICT_OPTIONS = [
  { value: 'keep_v2', label: 'Keep V2, skip V1', detail: 'Safest. Edits made in V2 are never touched.' },
  { value: 'update_if_changed', label: 'Update if V1 changed since last run', detail: 'For schools still using V1 during the switch.' },
  { value: 'always_v1', label: 'Always use V1', detail: 'Overwrites changes made in V2.', danger: true },
];

const ReviewConfigureTab = ({ onBack, onContinue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [conflictStrategy, setConflictStrategy] = useState('keep_v2');
  const [selected, setSelected] = useState(() =>
    DUMMY_DATA_TYPES.reduce((acc, row) => {
      acc[row.key] = row.defaultSelected === false ? false : true;
      return acc;
    }, {}),
  );

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const selectedRecords = DUMMY_DATA_TYPES.filter((row) => selected[row.key]).reduce(
    (sum, row) => sum + row.toCopy,
    0,
  );

  return (
    <Box>
      <Link
        component="button"
        onClick={onBack}
        underline="none"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 13, fontWeight: 600, mb: 1 }}
      >
        <IconArrowLeft size={15} /> Back to scan
      </Link>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper
            title="What to migrate"
            subtitle="Leave something out now and add it in a later run — nothing gets copied twice."
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {DUMMY_DATA_TYPES.map((row, index) => (
                <Box
                  key={row.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    borderBottom: index === DUMMY_DATA_TYPES.length - 1 ? 'none' : '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={Boolean(selected[row.key])}
                    disabled={row.required}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [row.key]: e.target.checked }))}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{row.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>{row.note}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {row.toCopy.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SectionPaper>

          <SectionPaper
            title="Fields that are new in V2"
            subtitle="V1 has no value for these. Pick what migrated records should get — you can edit individual records later."
            sx={{ mt: 1.5 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>V2 FIELD</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>ON</TableCell>
                  <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>VALUE FOR MIGRATED RECORDS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_NEW_FIELDS.map((row) => (
                  <TableRow key={row.field}>
                    <TableCell sx={{ fontSize: 13 }}>
                      {row.field}{' '}
                      {row.required && (
                        <Typography component="span" sx={{ fontSize: 10, fontWeight: 700, color: '#D97706', ml: 0.5 }}>
                          Required
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: '#64748b' }}>{row.on}</TableCell>
                    <TableCell>
                      <Select size="small" value={row.value} sx={{ fontSize: 13, minWidth: 180 }}>
                        <MenuItem value={row.value} sx={{ fontSize: 13 }}>{row.value}</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionPaper>

          <SectionPaper
            title={`Needs attention ${DUMMY_NEEDS_ATTENTION.reduce((s, r) => s + r.count, 0)}`}
            subtitle="Records with missing or conflicting values in V1."
            action={
              <Link href="#" underline="hover" sx={{ fontSize: 12.5, fontWeight: 600 }}>
                Download list (CSV)
              </Link>
            }
            sx={{ mt: 1.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {DUMMY_NEEDS_ATTENTION.map((row) => (
                <Box
                  key={row.title}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13 }}>
                      <Typography component="span" sx={{ fontWeight: 700, color: '#D97706' }}>
                        {row.count}
                      </Typography>{' '}
                      {row.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{row.example}</Typography>
                  </Box>
                  <Select size="small" value={row.resolution} sx={{ fontSize: 12.5, minWidth: 200, flexShrink: 0 }}>
                    <MenuItem value={row.resolution} sx={{ fontSize: 12.5 }}>{row.resolution}</MenuItem>
                  </Select>
                </Box>
              ))}
            </Box>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SectionPaper title="If a record already exists in V2" subtitle="Applies to this run and every re-run.">
              <RadioGroup value={conflictStrategy} onChange={(e) => setConflictStrategy(e.target.value)}>
                {CONFLICT_OPTIONS.map((opt) => (
                  <Box
                    key={opt.value}
                    sx={{
                      border: '1.5px solid',
                      borderColor: conflictStrategy === opt.value ? theme.palette.primary.main : isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                      borderRadius: '10px',
                      px: 1,
                      mb: 1,
                    }}
                  >
                    <FormControlLabel
                      value={opt.value}
                      control={<Radio size="small" />}
                      sx={{ alignItems: 'flex-start', m: 0, py: 0.75 }}
                      label={
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</Typography>
                          <Typography sx={{ fontSize: 12, color: opt.danger ? '#DC2626' : '#64748b' }}>
                            {opt.detail}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </RadioGroup>
            </SectionPaper>

            <SectionPaper title="How records are matched">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {DUMMY_MATCH_RULES.map((row) => (
                  <Box key={row.type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>{row.type}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{row.rule}</Typography>
                  </Box>
                ))}
              </Box>
            </SectionPaper>

            <SectionPaper
              sx={{
                bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(37,99,235,0.3)' : '#BFDBFE',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Last dry run</Typography>
              <Typography sx={{ fontSize: 12.5 }}>
                {DUMMY_LAST_DRY_RUN.ranAt} —{' '}
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  {DUMMY_LAST_DRY_RUN.errors} errors
                </Typography>
                , {DUMMY_LAST_DRY_RUN.warnings} warnings,{' '}
                {DUMMY_LAST_DRY_RUN.recordsWouldCopy.toLocaleString()} records would be copied. Nothing was saved.
              </Typography>
              <Link href="#" underline="hover" sx={{ fontSize: 12.5, fontWeight: 600, mt: 0.5, display: 'inline-block' }}>
                View dry-run report
              </Link>
            </SectionPaper>
          </Box>
        </Grid>
      </Grid>

      <ActionBar status={`${selectedCount} of ${DUMMY_DATA_TYPES.length} data types · ${selectedRecords.toLocaleString()} records`}>
        <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
          Run dry run again
        </Button>
        <Button
          variant="contained"
          onClick={onContinue}
          sx={{ bgcolor: '#fff', color: '#0f172a', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          Start migration
        </Button>
      </ActionBar>
    </Box>
  );
};

export default ReviewConfigureTab;
