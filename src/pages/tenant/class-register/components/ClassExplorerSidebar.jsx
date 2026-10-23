import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Skeleton,
  Collapse,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  School as SchoolIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RowSkeleton = () => (
  <Stack spacing={1} sx={{ px: 1, py: 0.75 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Stack key={i} direction="row" alignItems="center" spacing={1}>
        <Skeleton variant="circular" width={14} height={14} />
        <Skeleton variant="text" width={`${60 + ((i * 7) % 25)}%`} height={16} />
      </Stack>
    ))}
  </Stack>
);

/**
 * Class navigation sidebar — two modes:
 *  - "admin": the full programme -> class tree (every class in the school,
 *    live enrollment counts). `breakdown`/`loading` and `programmeFilter`
 *    are controlled by the parent (SingleArmView) so this stays in sync
 *    with the Programme filter dropdown in the filter row — same source
 *    of truth, not a second copy of the selection.
 *  - "teacher": a flat list of just the arms this class_teacher is
 *    actually assigned to (class_teachers is scoped per arm, not per
 *    class/programme) — no programme filter, no search, no school-wide
 *    browsing.
 */
const ClassExplorerSidebar = ({
  mode = 'admin',
  breakdown = [],
  loading = false,
  programmeFilter = '',
  onProgrammeFilterChange,
  teacherArms = [],
  selectedClassId,
  selectedArmId,
  onSelectClass,
  onSelectTeacherArm,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  const programmes = useMemo(() => {
    const seen = new Map();
    breakdown.forEach((c) => {
      if (!seen.has(c.programme_id)) {
        seen.set(c.programme_id, c.programme_name || c.programme_code || 'Programme');
      }
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [breakdown]);

  const groups = useMemo(() => {
    const byProgramme = new Map();
    breakdown
      .filter((c) => !programmeFilter || c.programme_id === programmeFilter)
      .filter((c) => {
        if (!search) return true;
        const name = c.class_display_name || c.raw_class_name || '';
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .forEach((c) => {
        const key = c.programme_id;
        if (!byProgramme.has(key)) {
          byProgramme.set(key, {
            programme_id: c.programme_id,
            programme_name: c.programme_name || c.programme_code || 'Programme',
            classes: [],
          });
        }
        byProgramme.get(key).classes.push(c);
      });
    return Array.from(byProgramme.values());
  }, [breakdown, programmeFilter, search]);

  useEffect(() => {
    if (mode !== 'admin') return;
    if (search) {
      const all = {};
      groups.forEach((g) => (all[g.programme_id] = true));
      setExpanded((prev) => ({ ...prev, ...all }));
      return;
    }
    const owner = groups.find((g) => g.classes.some((c) => c.class_id === selectedClassId));
    if (owner) {
      setExpanded((prev) => ({ ...prev, [owner.programme_id]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, search, breakdown, mode]);

  const toggleGroup = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (mode === 'teacher') {
    return (
      <Box sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', bgcolor: '#fff', p: 1 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 0.5 }}>
          MY CLASSES
        </Typography>
        <Stack spacing={0.25} sx={{ mt: 0.5 }}>
          {teacherArms.map((a) => {
            const isSelected = a.class_arm_id === selectedArmId;
            return (
              <Stack
                key={a.class_arm_id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => onSelectTeacherArm(a)}
                sx={{
                  px: 1,
                  py: 0.6,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.primary',
                  '&:hover': { bgcolor: isSelected ? 'primary.lighter' : '#F3F4F6' },
                }}
              >
                <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap>
                  {a.class_name} ({a.class_arm_names})
                </Typography>
                {a.student_count !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    {a.student_count}
                  </Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1.25, pt: 1.25, pb: 0.75 }}>
        <SchoolIcon sx={{ fontSize: 18 }} color="action" />
        <Typography variant="subtitle2" fontWeight={700} fontSize="0.82rem">
          Class Explorer
        </Typography>
      </Stack>

      <Box sx={{ px: 1.25, pb: 1 }}>
        <FormControl fullWidth size="small" sx={{ mb: 0.75 }}>
          <Select
            value={programmeFilter}
            displayEmpty
            onChange={(e) => onProgrammeFilterChange?.(e.target.value)}
            sx={{ fontSize: '0.8rem' }}
          >
            <MenuItem value="" sx={{ fontSize: '0.8rem' }}>
              <em>All Programmes</em>
            </MenuItem>
            {programmes.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.8rem' }}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          size="small"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
            sx: { fontSize: '0.8rem' },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 0.75 }}>
        {loading ? (
          <RowSkeleton />
        ) : groups.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2 }}>
            No classes found.
          </Typography>
        ) : (
          groups.map((group) => {
            const isOpen = !!expanded[group.programme_id];
            return (
              <Box key={group.programme_id} sx={{ mb: 0.25 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => toggleGroup(group.programme_id)}
                  sx={{ px: 0.75, py: 0.5, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}
                >
                  <Typography variant="body2" fontWeight={700} fontSize="0.8rem">
                    {group.programme_name} ({group.classes.length})
                  </Typography>
                  {isOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </Stack>
                <Collapse in={isOpen} timeout="auto">
                  <Stack spacing={0.1} sx={{ pl: 1, pb: 0.25 }}>
                    {group.classes.map((c) => {
                      const isSelected = c.class_id === selectedClassId;
                      return (
                        <Stack
                          key={c.class_id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          onClick={() => onSelectClass(c.class_id, c.programme_id, c.class_display_name, c.programme_name)}
                          sx={{
                            px: 0.75,
                            py: 0.4,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                            color: isSelected ? 'primary.main' : 'text.primary',
                            '&:hover': { bgcolor: isSelected ? 'primary.lighter' : '#F3F4F6' },
                          }}
                        >
                          <Typography variant="body2" fontWeight={isSelected ? 700 : 500} color="inherit" fontSize="0.78rem" noWrap>
                            {c.class_display_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.total}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>

      <Box sx={{ p: 1, borderTop: '1px solid #F3F4F6' }}>
        <Button fullWidth size="small" variant="outlined" startIcon={<BarChartIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/dashboard')} sx={{ fontSize: '0.75rem' }}>
          View School Overview
        </Button>
      </Box>
    </Box>
  );
};

export default ClassExplorerSidebar;
