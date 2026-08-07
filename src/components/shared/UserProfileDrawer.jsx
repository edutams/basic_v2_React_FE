import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  CircularProgress,
  Paper,
  Tooltip,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconCalendar,
  IconShieldCheck,
  IconX,
  IconId,
  IconCopy,
  IconCheck,
  IconCake,
  IconMapPin,
  IconGenderGenderless,
  IconDotsVertical,
  IconEdit,
  IconCamera,
  IconLock,
  IconHistory,
  IconPrinter,
  IconEye,
  IconEyeOff,
  IconUpload,
} from '@tabler/icons-react';

const UserProfileDrawer = ({ open, onClose, user, loading = false, onAction }) => {
  const theme = useTheme();

  // --- All Hooks at Top Level ---
  const [copiedField, setCopiedField] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser, setCurrentUser] = useState(user);

  const [editForm, setEditForm] = useState({
    fname: '',
    mname: '',
    lname: '',
    email: '',
    phone: '',
    dob: '',
    sex: 'Male',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const targetUser = currentUser || user;

  const formatDOB = (val) => {
    if (!val || val === '—') return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return String(val);
    }
  };

  const formatSex = (val) => {
    if (!val || val === '—') return '—';
    const s = String(val).trim();
    if (s.toLowerCase() === 'm' || s.toLowerCase() === 'male') return 'Male';
    if (s.toLowerCase() === 'f' || s.toLowerCase() === 'female') return 'Female';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getRawValue = (keys) => {
    if (!targetUser) return null;
    for (const key of keys) {
      let val = targetUser[key];
      if (val === undefined || val === null || val === '') {
        const matchingKey = Object.keys(targetUser).find((k) => k.toLowerCase() === key.toLowerCase());
        if (matchingKey) val = targetUser[matchingKey];
      }
      if ((val === undefined || val === null || val === '') && targetUser.student) {
        val = targetUser.student[key];
        if (val === undefined || val === null || val === '') {
          const matchingKey = Object.keys(targetUser.student).find((k) => k.toLowerCase() === key.toLowerCase());
          if (matchingKey) val = targetUser.student[matchingKey];
        }
      }
      if ((val === undefined || val === null || val === '') && targetUser.properties) {
        val = targetUser.properties[key];
        if (val === undefined || val === null || val === '') {
          const matchingKey = Object.keys(targetUser.properties).find((k) => k.toLowerCase() === key.toLowerCase());
          if (matchingKey) val = targetUser.properties[matchingKey];
        }
      }
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
    return null;
  };

  const email = getRawValue(['email', 'Email']) || '—';
  const phone = getRawValue(['phone', 'phone_number', 'mobile', 'Phone']) || '—';
  const username = getRawValue(['username', 'Username', 'user_id', 'User ID']) || '—';
  const rawDob = getRawValue(['dob', 'date_of_birth', 'birth_date', 'DOB', 'Date of Birth', 'birthdate']);
  const dob = formatDOB(rawDob);
  const rawAddress = getRawValue(['address', 'residential_address', 'location', 'Address', 'home_address']);
  const address = rawAddress || '—';
  const rawSex = getRawValue(['sex', 'gender', 'Sex', 'Gender']);
  const sex = formatSex(rawSex);

  // Initialize edit form when edit modal opens
  useEffect(() => {
    if (activeModal === 'edit_profile' && targetUser) {
      setEditForm({
        fname: targetUser.fname || targetUser.name?.split(' ')[0] || '',
        mname: targetUser.mname || '',
        lname: targetUser.lname || targetUser.name?.split(' ')[1] || '',
        email: email !== '—' ? email : '',
        phone: phone !== '—' ? phone : '',
        dob: rawDob || '',
        sex: sex !== '—' ? sex : 'Male',
        address: address !== '—' ? address : '',
      });
    }
  }, [activeModal, targetUser, email, phone, rawDob, sex, address]);

  if (!open && !activeModal) return null;

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleMenuItemClick = (actionType) => {
    handleCloseMenu();
    if (actionType === 'print_profile') {
      window.print();
    } else {
      setActiveModal(actionType);
    }
    if (onAction) {
      onAction(actionType, targetUser);
    }
  };

  const fullName = targetUser
    ? targetUser.full_name ||
      (targetUser.fname && targetUser.lname
        ? `${targetUser.fname} ${targetUser.mname ? targetUser.mname + ' ' : ''}${targetUser.lname}`.trim()
        : targetUser.name || 'System User')
    : 'User Profile';

  const userType = targetUser
    ? targetUser.user_type?.user_type_name ||
      targetUser.role ||
      targetUser.user_type_name ||
      (targetUser.organization ? 'Landlord / Agent User' : 'Tenant User')
    : '—';
  const organizationName = targetUser?.organization?.organization_name || targetUser?.organization?.name || '—';

  const status = String(targetUser?.status || 'active').toLowerCase();
  const createdDate = targetUser?.created_at
    ? new Date(targetUser.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const getInitials = () => {
    if (!targetUser) return 'U';
    if (targetUser.fname && targetUser.lname) {
      return `${targetUser.fname.charAt(0)}${targetUser.lname.charAt(0)}`.toUpperCase();
    }
    if (fullName && fullName !== 'System User') {
      const parts = fullName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleCopy = (text, fieldName) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setCurrentUser((prev) => ({
      ...prev,
      fname: editForm.fname,
      mname: editForm.mname,
      lname: editForm.lname,
      email: editForm.email,
      phone: editForm.phone,
      dob: editForm.dob,
      sex: editForm.sex,
      address: editForm.address,
      full_name: `${editForm.fname} ${editForm.mname ? editForm.mname + ' ' : ''}${editForm.lname}`.trim(),
    }));
    setActiveModal(null);
    showToast('Profile details updated successfully!');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePicture = () => {
    if (imagePreview) {
      setCurrentUser((prev) => ({ ...prev, avatar: imagePreview }));
      setImagePreview(null);
      setActiveModal(null);
      showToast('Profile picture updated successfully!');
    }
  };

  const handleSavePassword = () => {
    if (!passwordForm.current_password) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    setActiveModal(null);
    showToast('Password changed successfully!');
  };

  const renderBasicRow = (icon, label, value, copyableKey = null) => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      py={1.25}
      px={1}
      sx={{
        transition: 'all 0.2s ease',
        borderRadius: 1.5,
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.5) : 'grey.50',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.75} flex={1} minWidth={0}>
        <Box
          sx={{
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            p: 1,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box minWidth={0} flex={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.675rem' }}>
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ fontSize: '0.875rem' }}>
            {value || '—'}
          </Typography>
        </Box>
      </Box>

      {copyableKey && value && value !== '—' && (
        <Tooltip title={copiedField === copyableKey ? 'Copied!' : 'Copy'} placement="top">
          <IconButton
            size="small"
            onClick={() => handleCopy(value, copyableKey)}
            sx={{
              color: copiedField === copyableKey ? 'success.main' : 'text.secondary',
              bgcolor: alpha(theme.palette.divider, 0.3),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' },
              ml: 1,
            }}
          >
            {copiedField === copyableKey ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={Boolean(open && targetUser)}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420, md: 460 },
            boxSizing: 'border-box',
            bgcolor: 'background.default',
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5} flex={1}>
            <CircularProgress />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" height="100%">
            {/* Hero Banner Header */}
            <Box
              sx={{
                position: 'relative',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                pt: 3,
                pb: 6,
                px: 3,
                color: '#fff',
                overflow: 'hidden',
              }}
            >
              {/* Decorative background glow elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  filter: 'blur(20px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  filter: 'blur(15px)',
                }}
              />

              {/* Header Toolbar */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconUser size={20} style={{ opacity: 0.9 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', opacity: 0.9 }}>
                    User Profile Card
                  </Typography>
                </Box>
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.28)' },
                  }}
                >
                  <IconX size={18} />
                </IconButton>
              </Box>
            </Box>

            {/* Profile Identity Card (Overlapping Hero Banner) */}
            <Box px={3} sx={{ mt: -4, mb: 2, position: 'relative', zIndex: 1 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box display="flex" alignItems="center" gap={2.5}>
                  <Avatar
                    src={targetUser?.avatar || targetUser?.profile_picture || targetUser?.picture || ''}
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: 'primary.main',
                      fontSize: 26,
                      fontWeight: 700,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      border: `3px solid ${theme.palette.background.paper}`,
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="h6" fontWeight={700} noWrap sx={{ fontSize: '1.15rem', color: 'text.primary' }}>
                      {fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1, fontSize: '0.825rem' }}>
                      {email}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.75} alignItems="center">
                      <Chip
                        size="small"
                        label={userType}
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                      />
                      <Chip
                        size="small"
                        label={status.toUpperCase()}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.675rem',
                          height: 22,
                          bgcolor: status === 'active' || status === '1' ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.grey[500], 0.12),
                          color: status === 'active' || status === '1' ? 'success.main' : 'text.secondary',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Drawer Body Scrollable Content */}
            <Box px={3} py={1} flex={1} sx={{ overflowY: 'auto' }}>
              {/* Unified Single Card for Basic Information */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  mb: 3,
                }}
              >
                {/* Card Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  px={2.5}
                  py={1.5}
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : 'grey.50',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.75rem' }}>
                    Basic Information
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleOpenMenu}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' },
                    }}
                  >
                    <IconDotsVertical size={18} />
                  </IconButton>
                </Box>

                {/* Card Body - Single Container */}
                <Box p={2}>
                  <Stack spacing={1} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                    {renderBasicRow(<IconMail size={18} />, 'Email Address', email, 'email')}
                    {renderBasicRow(<IconPhone size={18} />, 'Phone Number', phone, 'phone')}
                    {renderBasicRow(<IconCake size={18} />, 'Date of Birth (DOB)', dob, 'dob')}
                    {renderBasicRow(<IconMapPin size={18} />, 'Address', address, 'address')}
                    {renderBasicRow(<IconGenderGenderless size={18} />, 'Sex / Gender', sex, 'sex')}
                  </Stack>
                </Box>
              </Paper>

              {/* Actions Dropdown Menu */}
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    borderRadius: 2,
                    minWidth: 220,
                    mt: 0.5,
                    border: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <MenuItem onClick={() => handleMenuItemClick('edit_profile')}>
                  <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                  <ListItemText primary="Edit Profile Details" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('change_picture')}>
                  <ListItemIcon><IconCamera size={18} /></ListItemIcon>
                  <ListItemText primary="Change Profile Picture" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('change_password')}>
                  <ListItemIcon><IconLock size={18} /></ListItemIcon>
                  <ListItemText primary="Change Password" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('view_activity')}>
                  <ListItemIcon><IconHistory size={18} /></ListItemIcon>
                  <ListItemText primary="View Activity Log" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>

                <MenuItem onClick={() => handleMenuItemClick('print_profile')}>
                  <ListItemIcon><IconPrinter size={18} /></ListItemIcon>
                  <ListItemText primary="Print Profile" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </MenuItem>
              </Menu>

              {/* Account & Role Specifications Section */}
              <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, mb: 1.5, display: 'block' }}>
                Account & Role Specs
              </Typography>
              <Stack spacing={1.5} mb={3}>
                {renderBasicRow(<IconShieldCheck size={18} />, 'System Role / Guard', userType)}
                {username !== '—' && renderBasicRow(<IconId size={18} />, 'Username', username, 'username')}
                {organizationName !== '—' && renderBasicRow(<IconBuilding size={18} />, 'Organization', organizationName)}
                {renderBasicRow(<IconCalendar size={18} />, 'Date Joined', createdDate)}
              </Stack>
            </Box>

            {/* Footer Bar */}
            <Box
              p={2.5}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Button
                variant="outlined"
                size="medium"
                color="inherit"
                onClick={() => handleCopy(email, 'footer_email')}
                startIcon={copiedField === 'footer_email' ? <IconCheck size={16} /> : <IconCopy size={16} />}
                sx={{ borderRadius: 2 }}
              >
                {copiedField === 'footer_email' ? 'Email Copied' : 'Copy Email'}
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={onClose}
                color="primary"
                sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
              >
                Done
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* --- Action Sub-Modals --- */}

      {/* 1. Edit Profile Details Modal */}
      <Dialog open={activeModal === 'edit_profile'} onClose={() => setActiveModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Edit Profile Details</Typography>
          <IconButton onClick={() => setActiveModal(null)} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="First Name" name="fname" value={editForm.fname} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Middle Name" name="mname" value={editForm.mname} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Last Name" name="lname" value={editForm.lname} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Email Address" type="email" name="email" value={editForm.email} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Phone Number" name="phone" value={editForm.phone} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Date of Birth" type="date" name="dob" value={editForm.dob} InputLabelProps={{ shrink: true }} onChange={handleEditFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" select label="Sex / Gender" name="sex" value={editForm.sex} onChange={handleEditFormChange}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} size="small" label="Address" name="address" value={editForm.address} onChange={handleEditFormChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" size="small" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* 2. Change Profile Picture Modal */}
      <Dialog open={activeModal === 'change_picture'} onClose={() => setActiveModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Change Profile Picture</Typography>
          <IconButton onClick={() => setActiveModal(null)} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Avatar
            src={imagePreview || targetUser?.avatar || ''}
            sx={{ width: 100, height: 100, mx: 'auto', mb: 2.5, border: `3px solid ${theme.palette.primary.main}`, boxShadow: 3 }}
          >
            {getInitials()}
          </Avatar>
          <Button variant="outlined" size="small" component="label" startIcon={<IconUpload size={18} />}>
            Select Image
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleSavePicture} variant="contained" size="small" color="primary" disabled={!imagePreview}>Update Picture</Button>
        </DialogActions>
      </Dialog>

      {/* 3. Change Password Modal */}
      <Dialog open={activeModal === 'change_password'} onClose={() => setActiveModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Change Password</Typography>
          <IconButton onClick={() => setActiveModal(null)} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                      {showPasswords.current ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                      {showPasswords.new ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                      {showPasswords.confirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={handleSavePassword} variant="contained" size="small" color="primary">Update Password</Button>
        </DialogActions>
      </Dialog>

      {/* 4. View Activity Log Modal */}
      <Dialog open={activeModal === 'view_activity'} onClose={() => setActiveModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>User Activity History</Typography>
          <IconButton onClick={() => setActiveModal(null)} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Box p={2.5} sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Viewing audit trail and system activity entries associated with <strong>{fullName}</strong> ({email}).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" size="small" color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfileDrawer;
