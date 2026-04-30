import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import ReusableModal from 'src/components/shared/ReusableModal';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getClassArms, getClassesWithDivisions } from '../../../context/TenantContext/services/tenant.service';
import learnerApi from 'src/api/learnerApi';
import { useNotification } from 'src/hooks/useNotification';

const LIST_HEIGHT = 160;

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
        display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.75,
        border: '1px solid', borderColor: 'divider', borderRadius: 2,
        bgcolor: 'background.paper', cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
        '&:hover': onClick ? { bgcolor: 'primary.lighter', borderColor: 'primary.main' } : {},
      }}
    >
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light' }}>
        <PersonIcon sx={{ fontSize: 16 }} />
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

const AddLearnerModal = ({
  open,
  onClose,
  classId,
  className,
  onSave,
  isLoading = false,
  showLinkParents = false,  
}) => {
  const notify = useNotification();
  const [classArms, setClassArms]   = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  const [parentSearch, setParentSearch]       = useState('');
  const [parentResults, setParentResults]     = useState([]);
  const [parentSearching, setParentSearching] = useState(false);
  const [linkedParents, setLinkedParents]     = useState([]);

  // load flat class list when no classId is pre-supplied
  useEffect(() => {
    if (classId || !open) return;
    getClassesWithDivisions()
      .then((data) => {
        const flat = [];
        (data || []).forEach((div) =>
          (div.programmes || []).forEach((prog) =>
            (prog.classes || []).forEach((cls) => {
              if (cls.status === 'active') {
                flat.push({
                  id: cls.id,
                  label: `${prog.programme_code} - ${cls.class_code}`,
                });
              }
            })
          )
        );
        setAllClasses(flat);
      })
      .catch(console.error);
  }, [open, classId]);

  // load arms whenever the effective classId changes
  const fetchArms = async (id) => {
    if (!id) { setClassArms([]); return; }
    try {
      const response = await getClassArms(id);
      setClassArms(response?.data?.data || response?.data || response || []);
    } catch (error) {
      console.error('Failed to fetch arms:', error);
    }
  };

  useEffect(() => {
    if (classId) fetchArms(classId);
  }, [classId]);

  const formik = useFormik({
    initialValues: {
      learner_id:   '',
      class_id:     classId || '',
      class_arm_id: '',
      last_name:    '',
      first_name:   '',
      middle_name:  '',
      gender:       '',
      date_of_birth: null,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave(values, linkedParents.map((p) => p.user_id));
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      setClassArms([]);
      setParentSearch('');
      setParentResults([]);
      setLinkedParents([]);
      if (classId) fetchArms(classId);
    }
  }, [open]);

  const handleClassChange = (e) => {
    formik.setFieldValue('class_id', e.target.value);
    formik.setFieldValue('class_arm_id', '');
    fetchArms(e.target.value);
  };

  const handleParentSearch = useCallback(async () => {
    if (!parentSearch.trim()) return;
    try {
      setParentSearching(true);
      const res = await learnerApi.searchGuardians({ search: parentSearch.trim() });
      const data = res?.data?.data ?? [];
      if (data.length === 0) notify.info('No parents found');
      setParentResults(data);
    } catch {
      notify.error('Search failed');
      setParentResults([]);
    } finally {
      setParentSearching(false);
    }
  }, [parentSearch]);

  const handleAddParent    = (p) => { if (!linkedParents.some((lp) => lp.user_id === p.user_id)) setLinkedParents((prev) => [...prev, p]); };
  const handleRemoveParent = (uid) => setLinkedParents((prev) => prev.filter((p) => p.user_id !== uid));

  const isValid =
    formik.values.last_name &&
    formik.values.first_name &&
    formik.values.gender &&
    formik.values.class_id &&
    formik.values.class_arm_id;

  const renderTitle = () =>
    classId ? (
      <>
        Add New Learner —{' '}
        <Typography component="span" color="primary" fontWeight={600}>
          {className}
        </Typography>
      </>
    ) : (
      'Add New Learner'
    );

  return (
    <ReusableModal open={open} onClose={onClose} title={renderTitle()} size="large">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="form" onSubmit={formik.handleSubmit}>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Learner ID"
              name="learner_id"
              value={formik.values.learner_id}
              onChange={formik.handleChange}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="Last Name" name="last_name" value={formik.values.last_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="First Name" name="first_name" value={formik.values.first_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <TextField label="Middle Name" name="middle_name" value={formik.values.middle_name}
                onChange={formik.handleChange} fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 45%' }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formik.values.gender} onChange={formik.handleChange} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 45%' }}>
              <DatePicker
                label="Date of Birth"
                value={formik.values.date_of_birth}
                onChange={(val) => formik.setFieldValue('date_of_birth', val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            {/* Class dropdown — only shown when classId is not pre-supplied */}
            {!classId && (
              <Box sx={{ flex: '1 1 45%' }}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select value={formik.values.class_id} onChange={handleClassChange} label="Class">
                    <MenuItem value="">Select Class</MenuItem>
                    {allClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Arm</InputLabel>
              <Select name="class_arm_id" value={formik.values.class_arm_id}
                onChange={formik.handleChange} label="Arm"
                disabled={!formik.values.class_id}>
                <MenuItem value="">Select Arm</MenuItem>
                {classArms.map((arm) => (
                  <MenuItem key={arm.id} value={arm.id}>
                    {arm.display_name || arm.arm_names || `Arm ${arm.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {showLinkParents && (
          <>
          <Box sx={{ bgcolor: '#F0F9FF', p: 2, borderRadius: 2, mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            Link Ward to Parents{' '}
            <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Search by parent name, ID or phone" value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParentSearch()}
              sx={{ flex: 1 }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <Button variant="contained" onClick={handleParentSearch} disabled={parentSearching} sx={{ whiteSpace: 'nowrap', minWidth: 80 }}>
              {parentSearching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
            </Button>
          </Box>
          </Box>

          {parentResults.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                {parentResults.length} result{parentResults.length !== 1 ? 's' : ''} — click to link
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: LIST_HEIGHT, overflowY: 'auto', pr: 0.5 }}>
                {parentResults.map((parent) => {
                  const alreadyLinked = linkedParents.some((p) => p.user_id === parent.user_id);
                  return (
                    <Box key={parent.user_id} sx={{ position: 'relative' }}>
                      <ParentRow parent={parent} onClick={!alreadyLinked ? () => handleAddParent(parent) : undefined} showRemove={false} />
                      {alreadyLinked && (
                        <Chip label="linked" color="success" size="small"
                          sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Divider sx={{ mt: 1.5, mb: 1 }} />
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
            Linked Parents {linkedParents.length > 0 && `(${linkedParents.length})`}
          </Typography>
          {linkedParents.length === 0 ? (
            <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center', '& .MuiAlert-icon': { mr: 1.5 } }}>
              No parents linked yet. Search and click a parent to link them.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: LIST_HEIGHT, overflowY: 'auto', pr: 0.5 }}>
              {linkedParents.map((parent) => (
                <ParentRow key={parent.user_id} parent={parent} showRemove onRemove={handleRemoveParent} />
              ))}
            </Box>
          )}
          </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button variant="contained" type="submit" disabled={isLoading || !isValid}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>

        </Box>
      </LocalizationProvider>
    </ReusableModal>
  );
};

AddLearnerModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  showLinkParents: PropTypes.bool,
};

export default AddLearnerModal;