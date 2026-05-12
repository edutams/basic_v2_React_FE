import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReusableModal from '../../shared/ReusableModal';
import eduTierApi from 'src/api/eduTierApi';

const ManageModulesModal = ({
  open,
  onClose,
  currentPackage,
  onModuleAssignment,
}) => {
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log(currentPackage?.id, 65555);

    if (!open || !currentPackage?.id) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await eduTierApi.getPackageModules(currentPackage.id);
        const allModules = res?.data || [];

        setModules(allModules);
        setSelectedModules(
          allModules
            .filter((m) => m.ckstatus || m.packages?.some(p => p.id === currentPackage.id))
            .map((m) => m.id)
        );
      } catch (err) {
        console.error(err);
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, currentPackage]);

  const handleToggle = (id) => {
    setSelectedModules((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {
    const assignedModules = modules.filter((m) =>
      selectedModules.includes(m.id)
    );

    onModuleAssignment(currentPackage, assignedModules);
    onClose();
  };

  const filteredModules = useMemo(() => {
    return modules
      .filter((module) =>
        (module.module_name || module.mod_name || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = (a.module_name || a.mod_name || '').toLowerCase();
        const nameB = (b.module_name || b.mod_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [modules, search]);

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={`Manage ${currentPackage?.package_name || 'Package'
        } Modules`}
      size="large"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Info */}
        <Typography variant="body2" color="text.secondary">
          {selectedModules.length} of {modules.length} modules selected
        </Typography>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
          }}
        />

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
              gap: 1,
              maxHeight: 400,
              overflowY: 'auto',
            }}
          >
            {filteredModules.map((module) => (
              <FormControlLabel
                key={module.id}
                control={
                  <Checkbox
                    checked={selectedModules.includes(module.id)}
                    onChange={() => handleToggle(module.id)}
                  />
                }
                label={module.module_name || module.mod_name}
              />
            ))}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            Save
          </Button>
        </Box>
      </Box>
    </ReusableModal>
  );
};

export default ManageModulesModal;