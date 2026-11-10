import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { IconRefresh, IconDatabase, IconCategory, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import SectionPaper from '@/pages/tenant/data-migration/components/SectionPaper';
import { DATA_TYPES } from '@/pages/tenant/data-migration/domainTypes';
import { fetchMigrationSummary } from '@/api/landlord/dataMigration/dataMigrationApi';

/** Agent-side twin of the tenant "Connect & scan" stage — identical
 * behavior, scoped to the chosen school instead of the implicit tenant. */
const ConnectScanTab = ({ tenantId, school, onContinue }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = () => {
    setLoading(true);
    setError('');
    fetchMigrationSummary(tenantId)
      .then((res) => {
        if (res?.status) {
          setSummary(res.data);
        } else {
          setError(res?.message || 'Failed to load V1 data.');
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load V1 data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const totalInV1 = summary
    ? DATA_TYPES.reduce((sum, row) => sum + (summary[row.key]?.in_v1 || 0), 0)
    : 0;

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadSummary}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard align="left" icon={IconDatabase} colorIndex={0} loading={loading} count={totalInV1.toLocaleString()} label="Records found in V1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard align="left" icon={IconCategory} colorIndex={1} loading={loading} count={DATA_TYPES.filter((r) => r.available).length} label="Data types ready to migrate" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard align="left" icon={IconCircleCheck} colorIndex={1} loading={loading} count="—" label="Already in V2" subtitle="Computed during Review" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionPaper
            title="Step 1 — Review what we found in this school's V1 records"
            subtitle="This is a read-only scan — nothing has been changed or copied yet. Listed in the order they'll be migrated; each type waits for the ones it depends on."
            action={
              <Chip
                size="small"
                label={school?.tenant_name || tenantId}
                sx={{ bgcolor: '#E6F4EA', color: '#15803D', fontSize: 11, fontWeight: 700, height: 22 }}
              />
            }
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>DATA TYPE</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>IN V1</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>WAITS FOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {DATA_TYPES.map((row, index) => (
                    <TableRow key={row.key} sx={{ opacity: row.available ? 1 : 0.5 }}>
                      <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                        <Typography component="span" sx={{ fontSize: 11, color: '#94a3b8', mr: 1 }}>
                          {String(index + 1).padStart(2, '0')}
                        </Typography>
                        {row.name}
                        {!row.available && (
                          <Chip size="small" label="Coming soon" sx={{ ml: 1, fontSize: 10, fontWeight: 700, height: 18 }} />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>
                        {loading ? <Skeleton variant="text" width={40} sx={{ ml: 'auto' }} /> : (summary?.[row.key]?.in_v1 ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5, color: '#64748b' }}>
                        {row.waitsFor.length ? row.waitsFor.join(', ') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 2 }}>
              <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
                Ready to choose what to migrate for this school.
              </Typography>
              <Button
                variant="contained"
                onClick={onContinue}
                disabled={loading || Boolean(error)}
                sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
              >
                Continue to review →
              </Button>
            </Box>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionPaper title="School">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                ['Name', school?.tenant_name || '—'],
                ['V2 id', tenantId],
                ['Status', school?.status || '—'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>{label}</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, textAlign: 'right', textTransform: 'capitalize' }}>{value}</Typography>
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconRefresh size={16} />}
                onClick={loadSummary}
                disabled={loading}
                sx={{ mt: 1, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Scan again
              </Button>
            </Box>
          </SectionPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConnectScanTab;
