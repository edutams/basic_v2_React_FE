import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  InputAdornment,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { IMaskInput } from 'react-imask';
import { useFormik } from 'formik';
import { parentValidationSchema } from './validation/parentValidationSchema';
import PropTypes from 'prop-types';
import guardianApi from '@/api/tenant/guardians/parentApi';
import { getClassesWithDivisions } from '@/api/tenant/set-up/tenant-setup';
import { useNotification } from 'src/hooks/useNotification';

const PhoneMaskCustom = React.forwardRef(function PhoneMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000000000"
      definitions={{ 0: /[0-9]/ }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const EMPTY_FORM = {
  title: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  gender: '',
  occupation: '',
  relationship: '',
  address: '',
  password: '',
  confirm_password: '',
};

const LIST_HEIGHT = 160;

const getWardDisplay = (ward) => {
  if (ward.name !== undefined) {
    return {
      name: ward.name || '—',
      userIdCode: ward.user_id_code,
      classArm: ward.class_arm || '—',
    };
  }
  const reg = ward.student_registrations?.[0];
  const arm = reg?.class_arm;
  const armNames = arm?.arm_names;
  const armLabel = Array.isArray(armNames) ? armNames.filter(Boolean).join(', ') : armNames || '';
  const className = arm?.programme_class?.class?.class_name || '';
  return {
    name: `${ward.fname || ''} ${ward.lname || ''}`.trim() || '—',
    userIdCode: ward.user_id,
    classArm: [className, armLabel].filter(Boolean).join(' ') || '—',
  };
};

const ParentForm = ({
  selectedParent = null,
  onSubmit,
  onCancel,
  isEdit = false,
  isLoading = false,
  submitText,
  showConfirmPassword = false,
  hideWardLink = false,
  cancelLabel = 'Cancel',
  beforeActions = null,
}) => {
  const notify = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialValues =
    isEdit && selectedParent
      ? {
          title: selectedParent.title ?? '',
          first_name: selectedParent.user?.fname ?? '',
          last_name: selectedParent.user?.lname ?? '',
          middle_name: selectedParent.user?.mname ?? '',
          email: selectedParent.user?.email ?? '',
          phone: selectedParent.user?.phone ?? '',
          gender: selectedParent.user?.sex ?? '',
          occupation: selectedParent.occupation ?? '',
          relationship: selectedParent.relationship ?? '',
          address: selectedParent.user?.address ?? '',
          confirm_password: '',
        }
      : EMPTY_FORM;

  const [wardSearch, setWardSearch] = useState('');
  const [wardProgrammeClassId, setWardProgrammeClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [wardResults, setWardResults] = useState([]);
  const [wardSearching, setWardSearching] = useState(false);
  const [linkedWards, setLinkedWards] = useState([]);

  const formik = useFormik({
    initialValues,
    validationSchema: parentValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) =>
      onSubmit(
        values,
        linkedWards.map((w) => w.id),
      ),
  });

  useEffect(() => {
    if (isEdit) return;
    getClassesWithDivisions()
      .then((data) => {
        const flat = [];
        (data || []).forEach((div) =>
          (div.programmes || []).forEach((prog) =>
            (prog.classes || []).forEach((cls) =>
              flat.push({
                program_class_id: cls?.pivot?.id,
                label: `${prog.programme_code} - ${cls.class_code}`,
              }),
            ),
          ),
        );
        setClasses(flat);
      })
      .catch(() => notify.error('Failed to load classes'));
  }, [isEdit]);

  const handleWardSearch = useCallback(async () => {
    if (!wardSearch.trim() && !wardProgrammeClassId) return;
    try {
      setWardSearching(true);
      const res = await guardianApi.searchLearners({
        search: wardSearch.trim(),
        programme_class_id: wardProgrammeClassId || undefined,
      });
      const data = res?.data?.data ?? [];
      if (data.length === 0) notify.info('No learners found');
      setWardResults(data);
    } catch {
      notify.error('Search failed');
      setWardResults([]);
    } finally {
      setWardSearching(false);
    }
  }, [wardSearch, wardProgrammeClassId]);

  const handleAddWard = (l) => {
    if (!linkedWards.some((w) => w.id === l.id)) setLinkedWards((p) => [...p, l]);
  };
  const handleRemoveWard = (id) => setLinkedWards((p) => p.filter((w) => w.id !== id));

  const WardRow = ({ ward, onClick, showRemove }) => {
    const { name, userIdCode, classArm } = getWardDisplay(ward);
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 0.75,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
          '&:hover': onClick ? { bgcolor: 'primary.lighter', borderColor: 'primary.main' } : {},
        }}
      >
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light' }}>
          <PersonIcon sx={{ fontSize: 16 }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {name}
          </Typography>
          {userIdCode && (
            <Typography variant="caption" color="text.secondary" noWrap>
              ID: {userIdCode}
            </Typography>
          )}
        </Box>
        <Chip label={classArm} size="small" />
        {showRemove && (
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveWard(ward.id);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Title</InputLabel>
            <Select
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Title"
            >
              <MenuItem value="">—</MenuItem>
              {['Mr', 'Mrs', 'Miss', 'Dr', 'Prof', 'Alhaji', 'Alhaja', 'Chief'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Surname"
            name="last_name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
            helperText={formik.touched.last_name && formik.errors.last_name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="First Name"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Other Name"
            name="middle_name"
            value={formik.values.middle_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
            helperText={formik.touched.middle_name && formik.errors.middle_name}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Phone"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            inputProps={{ maxLength: 11, inputMode: 'numeric' }}
            InputProps={{ inputComponent: PhoneMaskCustom }}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={formik.touched.relationship && Boolean(formik.errors.relationship)}
          >
            <InputLabel>Relationship</InputLabel>
            <Select
              name="relationship"
              value={formik.values.relationship}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Relationship"
            >
              <MenuItem value="father">Father</MenuItem>
              <MenuItem value="mother">Mother</MenuItem>
              <MenuItem value="guardian">Guardian</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Occupation" name="occupation" value={formik.values.occupation}
            onChange={formik.handleChange} onBlur={formik.handleBlur} fullWidth
            error={formik.touched.occupation && Boolean(formik.errors.occupation)}
            helperText={formik.touched.occupation && formik.errors.occupation} />
        </Grid> */}

        {showConfirmPassword && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Password"
              name="password"
              value={formik.values.password || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        {showConfirmPassword && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Confirm Password"
              name="confirm_password"
              value={formik.values.confirm_password || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              type={showConfirm ? 'text' : 'password'}
              error={
                formik.values.confirm_password &&
                formik.values.password !== formik.values.confirm_password
              }
              helperText={
                formik.values.confirm_password &&
                formik.values.password !== formik.values.confirm_password
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Address"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            multiline
            rows={2}
            required
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
        </Grid>
      </Grid>

      {!isEdit && !hideWardLink && (
        <>
          <Box sx={{ bgcolor: '#F0F9FF', p: 2, borderRadius: 2, mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Link Wards to Parent{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                (optional)
              </Typography>
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mb: 1.5,
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 2,
                alignItems: 'center',
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  value={wardProgrammeClassId}
                  label="Filter by Class"
                  onChange={(e) => setWardProgrammeClassId(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.program_class_id} value={cls.program_class_id}>
                      {cls.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                placeholder="Search Learner ID | Name"
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWardSearch()}
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
                size="small"
                onClick={handleWardSearch}
                disabled={wardSearching}
                sx={{ whiteSpace: 'nowrap', minWidth: 80 }}
              >
                {wardSearching ? <CircularProgress size={18} color="inherit" /> : 'Search'}
              </Button>
            </Box>
          </Box>

          {wardResults.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: 'block' }}
              >
                {wardResults.length} result{wardResults.length !== 1 ? 's' : ''} — click to link
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  maxHeight: LIST_HEIGHT,
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {wardResults.map((learner) => {
                  const alreadyLinked = linkedWards.some((w) => w.id === learner.id);
                  return (
                    <Box key={learner.id} sx={{ position: 'relative' }}>
                      <WardRow
                        ward={learner}
                        onClick={!alreadyLinked ? () => handleAddWard(learner) : undefined}
                        showRemove={false}
                      />
                      {alreadyLinked && (
                        <Chip
                          label="linked"
                          color="success"
                          size="small"
                          sx={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Divider sx={{ mt: 1.5, mb: 1 }} />
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
            Linked Wards {linkedWards.length > 0 && `(${linkedWards.length})`}
          </Typography>
          {linkedWards.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 1.5, textAlign: 'center' }}
            >
              No wards linked yet. Search and click a learner to link them.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                maxHeight: LIST_HEIGHT,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {linkedWards.map((ward) => (
                <WardRow key={ward.id} ward={ward} showRemove />
              ))}
            </Box>
          )}
        </>
      )}

      {beforeActions && <Box sx={{ mt: 3 }}>{beforeActions}</Box>}

      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} sx={{ mt: 3 }}>
        <Button variant="contained" size="small" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button size="small" type="submit" disabled={isLoading || !formik.isValid}>
          {isLoading ? 'Saving...' : submitText || (isEdit ? 'Save Changes' : 'Add Parent')}
        </Button>
      </Box>
    </Box>
  );
};

ParentForm.propTypes = {
  selectedParent: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  isLoading: PropTypes.bool,
  submitText: PropTypes.string,
  showConfirmPassword: PropTypes.bool,
  hideWardLink: PropTypes.bool,
  cancelLabel: PropTypes.string,
  beforeActions: PropTypes.node,
};

export default ParentForm;
