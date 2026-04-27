import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { getClassesWithDivisions } from 'src/context/TenantContext/services/tenant.service';
import guardianApi from 'src/api/parentApi';

const LinkWardModal = ({ open, onClose, parent, onSaved }) => {
  const parentName = parent?.user
    ? `${parent.user.fname} ${parent.user.lname}`
    : 'Parent';

  // ── search state ──────────────────────────────────────────────────────────
  const [search, setSearch]       = useState('');
  const [classId, setClassId]     = useState('');
  const [classes, setClasses]     = useState([]);
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);

  // ── linked wards ──────────────────────────────────────────────────────────
  const [linkedWards, setLinkedWards] = useState([]);
  const [saving, setSaving]           = useState(false);

  // ── load classes once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const data = await getClassesWithDivisions();
        const flat = [];
        (data || []).forEach((div) =>
          (div.programmes || []).forEach((prog) =>
            (prog.classes || []).forEach((cls) =>
              flat.push({ id: cls.id, label: `${prog.programme_code} - ${cls.class_code}` })
            )
          )
        );
        setClasses(flat);
      } catch 
      { notify('Failed to load classes. Class filter will be unavailable.', 'error'); }
    };
    load();
  }, [open]);

  // ── load existing wards when modal opens ──────────────────────────────────
  useEffect(() => {
    if (!open || !parent?.id) return;
    const load = async () => {
      try {
        const res = await guardianApi.getWards(parent.id);
        setLinkedWards(res?.data?.data ?? []);
      } catch { notify('Failed to load linked wards.', 'error'); }
    };
    load();
    setSearch('');
    setClassId('');
    setResults([]);
  }, [open, parent?.id]);

  const handleSearch = useCallback(async () => {
    if (!search.trim() && !classId) return;
    try {
      setSearching(true);
      const res = await guardianApi.searchLearners({
        search: search.trim(),
        class_id: classId || undefined,
      });
      setResults(res?.data?.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [search, classId]);

  const handleAdd = (learner) => {
    if (linkedWards.some((w) => w.id === learner.id)) return; 
    setLinkedWards((prev) => [...prev, learner]);
  };

  const handleRemove = (id) => {
    setLinkedWards((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await guardianApi.syncWards(
        parent.id,
        linkedWards.map((w) => w.id)
      );
      onSaved?.();
      onClose();
    } catch {
      notify('Failed to save linked wards. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography component="span" fontWeight={700}>
          {parentName}
        </Typography>
        <Typography component="span" color="text.secondary" fontWeight={400}>
          {' '}link to ward below
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {/* ── search bar ── */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 2,
            alignItems: 'center',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classId}
              label="Filter by Class"
              onChange={(e) => setClassId(e.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search Learner ID | Learner Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flex: 1 }}
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
            color="success"
            onClick={handleSearch}
            disabled={searching}
            sx={{ whiteSpace: 'nowrap', minWidth: 80 }}
          >
            {searching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        {/* ── search results ── */}
        {results.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Search results — click to link
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {results.map((learner) => {
                const alreadyLinked = linkedWards.some((w) => w.id === learner.id);
                return (
                  <Box
                    key={learner.id}
                    onClick={() => !alreadyLinked && handleAdd(learner)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1,
                      border: '1px solid',
                      borderColor: alreadyLinked ? 'success.light' : 'divider',
                      borderRadius: 2,
                      cursor: alreadyLinked ? 'default' : 'pointer',
                      bgcolor: alreadyLinked ? 'success.lighter' : 'background.paper',
                      '&:hover': !alreadyLinked ? { bgcolor: 'primary.lighter', borderColor: 'primary.main' } : {},
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {learner.name}
                    </Typography>
                    <Chip label={learner.class_arm || '—'} size="small" variant="outlined" />
                    {alreadyLinked && (
                      <Typography variant="caption" color="success.main">linked</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
            <Divider sx={{ mt: 2, mb: 1 }} />
          </Box>
        )}

        {/* ── linked wards list ── */}
        {linkedWards.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
            No wards linked yet. Search and click a learner to link them.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {linkedWards.map((ward) => (
              <Box
                key={ward.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {ward.name}
                </Typography>
                <Chip label={ward.class_arm || '—'} size="small" variant="outlined" />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemove(ward.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkWardModal;
