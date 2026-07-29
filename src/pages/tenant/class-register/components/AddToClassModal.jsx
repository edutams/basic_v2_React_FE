import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PersonAdd as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassArmsByClass,
} from '@/api/tenant/curriculum/tenantCurriculumApi';
import { useNotification } from '@/hooks/useNotification';

const AddToClassModal = ({ open, onClose, onSuccess }) => {
  const notify = useNotification();

  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [arms, setArms] = useState([]);
  const [targetProgramme, setTargetProgramme] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetArm, setTargetArm] = useState('');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); // user_ids
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!open) return;
    fetchProgrammes()
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setProgrammes(data);
      })
      .catch(console.error);
  }, [open]);

  useEffect(() => {
    if (!targetProgramme) {
      setClasses([]);
      setTargetClass('');
      setArms([]);
      setTargetArm('');
      return;
    }
    fetchClassesByProgramme(targetProgramme)
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setClasses(data);
        setTargetClass('');
        setArms([]);
        setTargetArm('');
      })
      .catch(console.error);
  }, [targetProgramme]);

  useEffect(() => {
    if (!targetClass) {
      setArms([]);
      setTargetArm('');
      return;
    }
    fetchClassArmsByClass(targetClass, targetProgramme ? { programme_id: targetProgramme } : {})
      .then((res) => {
        const data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
        setArms(data);
        setTargetArm('');
      })
      .catch(console.error);
  }, [targetClass, targetProgramme]);

  const [hasSearched, setHasSearched] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await classRegisterApi.getUnassignedStudents({
        search,
        page: page + 1,
        per_page: rowsPerPage,
      });
      if (res.data?.status && res.data?.data) {
        setStudents(res.data.data);
        setMeta(res.data.meta);
      }
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    if (hasSearched) {
      fetchStudents();
    }
  }, [search, page, rowsPerPage, hasSearched, fetchStudents]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
      setSearchInput('');
      setPage(0);
      setTargetProgramme('');
      setTargetClass('');
      setTargetArm('');
      setHasSearched(false);
      setStudents([]);
    }
  }, [open]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
    setHasSearched(true);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map((s) => s.user_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) {
      notify.warning('Please select at least one student.');
      return;
    }
    if (!targetArm) {
      notify.warning('Please select a target class and arm.');
      return;
    }

    setSaving(true);
    try {
      await classRegisterApi.addStudentsToClass({
        user_ids: selectedIds,
        class_arm_id: targetArm,
      });
      notify.success(`${selectedIds.length} student(s) added to class`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      notify.error('Failed to add students to class');
    } finally {
      setSaving(false);
    }
  };

  const selectedArmLabel = (() => {
    const cls = classes.find((c) => String(c.id) === String(targetClass));
    const arm = arms.find((a) => String(a.id) === String(targetArm));
    const className = cls?.class_name || cls?.name || '';
    const armName = arm?.arm_names || arm?.name || '';
    return className && armName ? `${className} (${armName})` : armName || className || '';
  })();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon color="primary" />
        Add Students to Class
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="body2">
              Select the class and arm you want to assign students to, then search for unassigned
              students to add them.
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Target Class & Arm
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Programme</InputLabel>
                  <Select
                    value={targetProgramme}
                    label="Programme"
                    onChange={(e) => setTargetProgramme(e.target.value)}
                  >
                    {programmes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.programme_name || p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={!targetProgramme}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={targetClass}
                    label="Class"
                    onChange={(e) => setTargetClass(e.target.value)}
                  >
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.class_name || c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={!targetClass}>
                  <InputLabel>Arm</InputLabel>
                  <Select
                    value={targetArm}
                    label="Arm"
                    onChange={(e) => setTargetArm(e.target.value)}
                  >
                    {arms.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.arm_names || a.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {selectedArmLabel && (
              <Alert severity="success" sx={{ mt: 1.5, py: 0.5 }}>
                <Typography variant="body2">
                  Learner will be added to: <strong>{selectedArmLabel}</strong>
                </Typography>
              </Alert>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Search for Learners
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter student name or admission number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSearch}
                disabled={!targetArm}
                sx={{ minWidth: 100, whiteSpace: 'nowrap' }}
              >
                Search
              </Button>
            </Stack>

            {!targetArm && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                Please select a target class and arm first
              </Typography>
            )}
          </Box>

          {hasSearched && (
            <Box>
              <TableContainer variant="outlined" sx={{ borderRadius: 2, maxHeight: 340 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedIds.length > 0 && selectedIds.length < students.length
                          }
                          checked={students.length > 0 && selectedIds.length === students.length}
                          onChange={handleSelectAll}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Alert severity="info" sx={{ justifyContent: 'center' }}>
                            {searchInput
                              ? `No unassigned students found matching "${searchInput}".`
                              : 'No unassigned students found. All students are already enrolled in a class.'}
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow
                          key={student.user_id}
                          hover
                          selected={selectedIds.includes(student.user_id)}
                          onClick={() => handleSelectOne(student.user_id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedIds.includes(student.user_id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={student.avatar}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: 'primary.light',
                                  color: 'primary.main',
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}
                              >
                                {(student.name || '?').charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.name}
                                </Typography>
                                <Chip
                                  label={student.admission_no}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={student.gender}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: 11,
                                bgcolor:
                                  student.gender?.toUpperCase() === 'MALE'
                                    ? 'info.light'
                                    : 'success.light',
                                color:
                                  student.gender?.toUpperCase() === 'MALE'
                                    ? 'info.main'
                                    : 'success.main',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={student.status || 'present'}
                              size="small"
                              color="default"
                              sx={{ fontWeight: 600, fontSize: 11, textTransform: 'capitalize' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {meta && (
                <TablePagination
                  component="div"
                  count={meta.total || 0}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              )}
            </Box>
          )}

          {selectedIds.length > 0 && (
            <Alert severity="success" sx={{ '& .MuiAlert-icon': { mr: 1 } }}>
              <Typography variant="body2" fontWeight={600}>
                {selectedIds.length} student{selectedIds.length > 1 ? 's' : ''} selected
              </Typography>
              {selectedArmLabel && (
                <Typography variant="body2">
                  Ready to add to <strong>{selectedArmLabel}</strong>
                </Typography>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={saving || selectedIds.length === 0 || !targetArm}
          startIcon={<AddIcon />}
        >
          {saving
            ? 'Adding...'
            : `Add ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''} to Class`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToClassModal;
