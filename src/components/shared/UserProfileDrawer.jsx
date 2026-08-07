import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
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
  IconShieldLock,
} from '@tabler/icons-react';

const UserProfileDrawer = ({ open, onClose, user, loading = false, onAction }) => {
  const theme = useTheme();
  const [copiedField, setCopiedField] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  if (!user && !loading) return null;

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuItemClick = (actionType) => {
    handleCloseMenu();
    if (actionType === 'print_profile') {
      window.print();
    }
    if (onAction) {
      onAction(actionType, user);
    }
  };

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
    if (!user) return null;
    for (const key of keys) {
      let val = user[key];
      if (val === undefined || val === null || val === '') {
        const matchingKey = Object.keys(user).find((k) => k.toLowerCase() === key.toLowerCase());
        if (matchingKey) val = user[matchingKey];
      }
      if ((val === undefined || val === null || val === '') && user.student) {
        val = user.student[key];
        if (val === undefined || val === null || val === '') {
          const matchingKey = Object.keys(user.student).find((k) => k.toLowerCase() === key.toLowerCase());
          if (matchingKey) val = user.student[matchingKey];
        }
      }
      if ((val === undefined || val === null || val === '') && user.properties) {
        val = user.properties[key];
        if (val === undefined || val === null || val === '') {
          const matchingKey = Object.keys(user.properties).find((k) => k.toLowerCase() === key.toLowerCase());
          if (matchingKey) val = user.properties[matchingKey];
        }
      }
      if (val !== undefined && val !== null && val !== '') {
        return val;
      }
    }
    return null;
  };

  const fullName = user
    ? user.full_name ||
      (user.fname && user.lname
        ? `${user.fname} ${user.mname ? user.mname + ' ' : ''}${user.lname}`.trim()
        : user.name || 'System User')
    : 'User Profile';

  const email = getRawValue(['email', 'Email']) || '—';
  const phone = getRawValue(['phone', 'phone_number', 'mobile', 'Phone']) || '—';
  const username = getRawValue(['username', 'Username', 'user_id', 'User ID']) || '—';
  const rawDob = getRawValue(['dob', 'date_of_birth', 'birth_date', 'DOB', 'Date of Birth', 'birthdate']);
  const dob = formatDOB(rawDob);
  const rawAddress = getRawValue(['address', 'residential_address', 'location', 'Address', 'home_address']);
  const address = rawAddress || '—';
  const rawSex = getRawValue(['sex', 'gender', 'Sex', 'Gender']);
  const sex = formatSex(rawSex);

  const userType = user
    ? user.user_type?.user_type_name ||
      user.role ||
      user.user_type_name ||
      (user.organization ? 'Landlord / Agent User' : 'Tenant User')
    : '—';
  const organizationName = user?.organization?.organization_name || user?.organization?.name || '—';

  const status = String(user?.status || 'active').toLowerCase();
  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const getInitials = () => {
    if (!user) return 'U';
    if (user.fname && user.lname) {
      return `${user.fname.charAt(0)}${user.lname.charAt(0)}`.toUpperCase();
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
    <Drawer
      anchor="right"
      open={open}
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
                  src={user?.avatar || user?.profile_picture || user?.picture || ''}
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

              <Divider sx={{ my: 0.5 }} />

              <MenuItem onClick={() => handleMenuItemClick('2fa_settings')}>
                <ListItemIcon><IconShieldLock size={18} /></ListItemIcon>
                <ListItemText primary="2FA Settings" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
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
  );
};

export default UserProfileDrawer;
