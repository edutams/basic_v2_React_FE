import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, InputAdornment, Typography,
  IconButton, CircularProgress, Avatar, Chip, Divider, Alert,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { useNotification } from 'src/hooks/useNotification';
import learnerApi from 'src/api/learnerApi';
import PropTypes from 'prop-types';

const LIST_HEIGHT = 185;

const ParentRow = ({ parent, onClick, showRemove, onRemove }) => {
  const name = parent.name || `${parent.user?.fname || ''} ${parent.user?.lname || ''}`.trim() || '—';
  const idCode = parent.user_id_code || parent.user?.user_id || '—';
  const relationship = parent.relationship
    ? parent.relationship.charAt(0).toUpperCase() + parent.relationship.slice(1)
    : '—';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1,
        border: '1px solid', borderColor: 'divider', borderRadius: 2,
        bgcolor: 'background.paper', cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
        '&:hover': onClick ? { bgcolor: 'primary.lighter', borderColor: 'primary.main' } : {},
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
        <PersonIcon fontSize="small" />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>{name}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>ID: {idCode}</Typography>
      </Box>
      <Chip label={relationship} size="small" variant="outlined" />
      {showRemove && (
        <IconButton size="small" color="error"
          onClick={(e) => { e.stopPropagation(); onRemove(parent.user_id); }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

const LinkParentForm = ({ learner, onSave, onCancel }) => {
  const notify = useNotification();

  const [search, setSearch]             = useState('');
  const [results, setResults]           = useState([]);
  const [searching, setSearching]       = useState(false);
  const [linkedParents, setLinkedParents] = useState([]);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    if (!learner?.users?.id) return;
    setSearch(''); setResults([]);
    learnerApi.getParents(learner.users.id)
      .then((res) => setLinkedParents(res?.data?.data ?? []))
      .catch(() => notify.error('Failed to load linked parents'));
  }, [learner?.users?.id]);

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return;
    try {
      setSearching(true);
      const res = await learnerApi.searchGuardians({ search: search.trim() });
      const data = res?.data?.data ?? [];
      if (data.length === 0) notify.info('No parents found for that search');
      setResults(data);
    } catch {
      notify.error('Search failed');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [search]);

  const handleAdd = (parent) => {
    if (linkedParents.some((p) => p.user_id === parent.user_id)) return;
    setLinkedParents((prev) => [...prev, parent]);
  };

  const handleRemove = (userId) => {
    setLinkedParents((prev) => prev.filter((p) => p.user_id !== userId));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(linkedParents.map((p) => p.user_id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search by parent name, ID or phone" value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flex: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={searching} sx={{ whiteSpace: 'nowrap', minWidth: 80 }}>
          {searching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
        </Button>
      </Box>

      {/* search results */}
      {results.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} — click a parent to link
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: LIST_HEIGHT, overflowY: 'auto', pr: 0.5 }}>
            {results.map((parent) => {
              const alreadyLinked = linkedParents.some((p) => p.user_id === parent.user_id);
              return (
                <Box key={parent.user_id} sx={{ position: 'relative' }}>
                  <ParentRow
                    parent={parent}
                    onClick={!alreadyLinked ? () => handleAdd(parent) : undefined}
                    showRemove={false}
                  />
                  {alreadyLinked && (
                    <Chip label="linked" color="success" size="small"
                      sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  )}
                </Box>
              );
            })}
          </Box>
          <Divider sx={{ mt: 2, mb: 1 }} />
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Linked Parents {linkedParents.length > 0 && `(${linkedParents.length})`}
      </Typography>
      {linkedParents.length === 0 ? (
        <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
          No parents linked yet. Search and click a parent to link them.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: LIST_HEIGHT, overflowY: 'auto', pr: 0.5 }}>
          {linkedParents.map((parent) => (
            <ParentRow key={parent.user_id} parent={parent} showRemove onRemove={handleRemove} />
          ))}
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
        <Button color="inherit" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};

LinkParentForm.propTypes = {
  learner: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default LinkParentForm;
