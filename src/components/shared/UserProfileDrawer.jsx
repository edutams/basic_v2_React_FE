import React, { useState, useEffect, useMemo } from 'react';
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
  Collapse,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  IconSearch,
  IconLockAccess,
  IconFolder,
  IconChevronDown,
  IconChevronUp,
  IconFilter,
} from '@tabler/icons-react';
import {
  groupPermissionsByModule,
  prettifyModuleName,
  getPermissionModule,
} from '@/utils/permissionGrouping';
import aclApi from '@/api/tenant/acl/aclApi';

const UserProfileDrawer = ({ open, onClose, user, loading = false, onAction }) => {
  const theme = useTheme();

  // --- All Hooks at Top Level (Unconditional Execution) ---
  const [copiedField, setCopiedField] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedModuleTab, setSelectedModuleTab] = useState('ALL');
  const [collapsedModules, setCollapsedModules] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser, setCurrentUser] = useState(user);
  const [profileData, setProfileData] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [fetchingActivities, setFetchingActivities] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(0);
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(10);
  const [activityTotal, setActivityTotal] = useState(0);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState(null);

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
    setProfileData(null);
  }, [user]);

  const targetUser = useMemo(() => {
    return { ...(currentUser || user || {}), ...(profileData || {}) };
  }, [currentUser, user, profileData]);

  const targetId = targetUser?.id || targetUser?.user_id;

  useEffect(() => {
    if (open && targetId && !profileData && !fetchingProfile) {
      setFetchingProfile(true);
      aclApi
        .getSchoolUserProfile(targetId)
        .then((res) => {
          if (res?.data) {
            setProfileData(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
        })
        .finally(() => {
          setFetchingProfile(false);
        });
    }
  }, [open, targetId, profileData, fetchingProfile]);

  useEffect(() => {
    if (activeModal === 'view_activity' && targetId) {
      setFetchingActivities(true);
      aclApi
        .getUserActivityLogs(targetId, {
          page: activityPage + 1,
          limit: activityRowsPerPage,
        })
        .then((res) => {
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res)
                ? res
                : [];
          setUserActivities(list);
          setActivityTotal(res?.total || res?.data?.total || list.length);
        })
        .catch((err) => {
          console.error('Failed to fetch user activity logs:', err);
        })
        .finally(() => {
          setFetchingActivities(false);
        });
    }
  }, [activeModal, targetId, activityPage, activityRowsPerPage]);

  const handleChangeActivityPage = (event, newPage) => {
    setActivityPage(newPage);
  };

  const handleChangeActivityRowsPerPage = (event) => {
    setActivityRowsPerPage(parseInt(event.target.value, 10));
    setActivityPage(0);
  };

  const formatRoleName = (str) => {
    if (!str) return '';
    const clean = String(str).trim();
    if (!clean) return '';
    return clean
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // --- Comprehensive Multi-Role Extractor matching SchoolAssignmentManagement ---
  const parsedRoles = useMemo(() => {
    if (!targetUser) return ['User'];
    const rolesSet = new Set();

    const addRole = (val) => {
      if (!val) return;
      if (typeof val === 'object' && val !== null) {
        const name = val.name || val.role_name || val.title || val.user_type_name;
        if (name) rolesSet.add(formatRoleName(name));
      } else if (typeof val === 'string' && val.trim()) {
        rolesSet.add(formatRoleName(val));
      }
    };

    // Priority 1: Direct Spatie roles from user.roles or user.assignedRoles (as in SchoolAssignmentManagement)
    const mainRoles = targetUser.roles || targetUser.assignedRoles;
    if (Array.isArray(mainRoles) && mainRoles.length > 0) {
      mainRoles.forEach(addRole);
    } else if (mainRoles && typeof mainRoles === 'object') {
      addRole(mainRoles);
    }

    // Priority 2: Check role_names or roles_list
    if (rolesSet.size === 0) {
      if (Array.isArray(targetUser.role_names)) {
        targetUser.role_names.forEach(addRole);
      }
      if (Array.isArray(targetUser.roles_list)) {
        targetUser.roles_list.forEach(addRole);
      }
    }

    // Priority 3: Check activity log properties
    if (rolesSet.size === 0 && targetUser.properties) {
      const p = targetUser.properties;
      const pRoles = p.causer_roles || p.roles || p.role || p.user_roles || p.Roles || p['User Role'];
      if (Array.isArray(pRoles)) {
        pRoles.forEach(addRole);
      } else if (pRoles) {
        addRole(pRoles);
      }
    }

    // Priority 4: Check single role property (e.g. targetUser.role)
    if (rolesSet.size === 0 && targetUser.role) {
      if (Array.isArray(targetUser.role)) {
        targetUser.role.forEach(addRole);
      } else {
        addRole(targetUser.role);
      }
    }

    // Priority 5: Fallback to user_type_name or user_type if no Spatie role is attached
    if (rolesSet.size === 0) {
      if (targetUser.user_type_name) {
        addRole(targetUser.user_type_name);
      } else if (targetUser.user_type) {
        addRole(targetUser.user_type);
      }
    }

    const list = Array.from(rolesSet).filter(Boolean);
    if (list.length > 0) return list;
    return ['User'];
  }, [targetUser]);

  const userPermissions = useMemo(() => {
    if (profileData?.all_permissions && Array.isArray(profileData.all_permissions) && profileData.all_permissions.length > 0) {
      return profileData.all_permissions;
    }
    if (!targetUser) return ['dashboard.index', 'profile.view', 'activity_log.index', 'notifications.read', 'account_settings.update'];
    if (targetUser.permissions && Array.isArray(targetUser.permissions) && targetUser.permissions.length > 0) {
      return targetUser.permissions;
    }
    if (targetUser.all_permissions && Array.isArray(targetUser.all_permissions) && targetUser.all_permissions.length > 0) {
      return targetUser.all_permissions;
    }
    return [
      'dashboard.index',
      'profile.view',
      'activity_log.index',
      'notifications.read',
      'account_settings.update',
      'tenant.setup.index',
      'tenant.users.manage',
      'reports.export',
    ];
  }, [profileData, targetUser]);

  const formattedPermissionsList = useMemo(() => {
    return userPermissions.map((perm) => {
      if (typeof perm === 'object' && perm !== null) {
        return {
          name: perm.name || perm.title || String(perm),
          description: perm.description || perm.label || perm.name || String(perm),
          module: perm.module || perm.group_name || perm.module_name || getPermissionModule(perm),
        };
      }
      const str = String(perm);
      return {
        name: str,
        description: str.replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        module: getPermissionModule({ name: str }),
      };
    });
  }, [userPermissions]);

  const allModuleGroups = useMemo(() => {
    return groupPermissionsByModule(formattedPermissionsList);
  }, [formattedPermissionsList]);

  const filteredPermissions = useMemo(() => {
    let list = formattedPermissionsList;
    if (selectedModuleTab !== 'ALL') {
      list = list.filter((p) => p.module === selectedModuleTab);
    }
    const term = permissionSearch?.toLowerCase() || '';
    if (!term) return list;
    return list.filter(
      (permission) =>
        permission?.name?.toLowerCase()?.includes(term) ||
        permission?.description?.toLowerCase()?.includes(term) ||
        permission?.module?.toLowerCase()?.includes(term),
    );
  }, [formattedPermissionsList, selectedModuleTab, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByModule(filteredPermissions);
  }, [filteredPermissions]);

  const toggleModuleCollapse = (moduleKey) => {
    setCollapsedModules((prev) => ({ ...prev, [moduleKey]: !prev[moduleKey] }));
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

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return 'st';
      case 2:  return 'nd';
      case 3:  return 'rd';
      default: return 'th';
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };

  const formatActivityDate = (dateStr, fallbackRelative) => {
    if (!dateStr) return fallbackRelative || '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallbackRelative || dateStr;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[d.getDay()];
    const dayOfMonth = d.getDate();
    const ordinal = getOrdinalSuffix(dayOfMonth);
    const year = d.getFullYear();
    const relative = getRelativeTime(d);

    return `${dayName} ${dayOfMonth}${ordinal}, ${year} (${relative})`;
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

  const getRoleSx = (roleName) => {
    if (!roleName) return {};
    const normalized = String(roleName).toLowerCase().trim().replace(/[\s-]+/g, '_');

    const roleStyles = {
      user: {
        backgroundColor: theme.palette.success?.light || alpha(theme.palette.success.main, 0.15),
        color: theme.palette.success?.main || 'success.main',
        borderColor: alpha(theme.palette.success.main, 0.3),
      },
      admin: {
        backgroundColor: theme.palette.error?.light || alpha(theme.palette.error.main, 0.15),
        color: theme.palette.error?.main || 'error.main',
        borderColor: alpha(theme.palette.error.main, 0.3),
      },
      tenant_admin: {
        backgroundColor: theme.palette.error?.light || alpha(theme.palette.error.main, 0.15),
        color: theme.palette.error?.main || 'error.main',
        borderColor: alpha(theme.palette.error.main, 0.3),
      },
      super_admin: {
        backgroundColor: theme.palette.primary?.light || alpha(theme.palette.primary.main, 0.15),
        color: theme.palette.primary?.main || 'primary.main',
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      teacher: {
        backgroundColor: theme.palette.warning?.light || alpha(theme.palette.warning.main, 0.15),
        color: theme.palette.warning?.main || 'warning.main',
        borderColor: alpha(theme.palette.warning.main, 0.3),
      },
      staff: {
        backgroundColor: theme.palette.info?.light || alpha(theme.palette.info.main, 0.15),
        color: theme.palette.info?.main || 'info.main',
        borderColor: alpha(theme.palette.info.main, 0.3),
      },
      subject_teacher: {
        backgroundColor: theme.palette.secondary?.light || alpha(theme.palette.secondary.main, 0.15),
        color: theme.palette.secondary?.main || 'secondary.main',
        borderColor: alpha(theme.palette.secondary.main, 0.3),
      },
      student: {
        backgroundColor: alpha(theme.palette.purple?.A50 || theme.palette.primary.main, 0.15),
        color: theme.palette.purple?.A100 || theme.palette.primary.dark,
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      learner: {
        backgroundColor: alpha(theme.palette.purple?.A50 || theme.palette.primary.main, 0.15),
        color: theme.palette.purple?.A100 || theme.palette.primary.dark,
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      bursar: {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.dark,
        borderColor: alpha(theme.palette.primary.main, 0.3),
      },
      parent: {
        backgroundColor: alpha(theme.palette.secondary.main, 0.15),
        color: theme.palette.secondary.main,
        borderColor: alpha(theme.palette.secondary.main, 0.3),
      },
    };

    return (
      roleStyles[normalized] || {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
        borderColor: alpha(theme.palette.primary.main, 0.25),
      }
    );
  };

  const renderRolesRow = (icon, label, roles) => (
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
          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
            {roles.map((roleName, i) => (
              <Chip
                key={i}
                size="small"
                label={roleName}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  height: 22,
                  borderRadius: '8px',
                  border: '1px solid',
                  ...getRoleSx(roleName),
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
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
                      {parsedRoles.map((r, idx) => (
                        <Chip
                          key={idx}
                          size="small"
                          label={r}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            borderRadius: '8px',
                            border: '1px solid',
                            ...getRoleSx(r),
                          }}
                        />
                      ))}
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
                    {renderBasicRow(<IconCake size={18} />, 'Date of Birth (DOB)', dob)}
                    {renderBasicRow(<IconMapPin size={18} />, 'Address', address)}
                    {renderBasicRow(<IconGenderGenderless size={18} />, 'Gender', sex)}
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

              {/* Unified Single Card for Account & Role Specs */}
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
                    Account & Role Specs
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<IconShieldCheck size={16} />}
                    onClick={() => setActiveModal('view_permissions')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1.5,
                      fontWeight: 600,
                      fontSize: '0.725rem',
                      py: 0.25,
                      px: 1.25,
                    }}
                  >
                    View Permissions
                  </Button>
                </Box>

                {/* Card Body - Single Container */}
                <Box p={2}>
                  <Stack spacing={1} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                    {renderRolesRow(<IconShieldCheck size={18} />, 'User Role', parsedRoles)}
                    {username !== '—' && renderBasicRow(<IconId size={18} />, 'User ID', username, 'username')}
                    {organizationName !== '—' && renderBasicRow(<IconBuilding size={18} />, 'Organization', organizationName)}
                    {renderBasicRow(<IconCalendar size={18} />, 'Date Joined', createdDate)}
                  </Stack>
                </Box>
              </Paper>
            </Box>

            {/* Footer Bar */}
            {/* <Box
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
            </Box> */}
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
              <TextField fullWidth size="small" select label="Gender" name="sex" value={editForm.sex} onChange={handleEditFormChange}>
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
      <Dialog open={activeModal === 'view_activity'} onClose={() => setActiveModal(null)} maxWidth="lg" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                p: 1,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <IconHistory size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                User Activity Log
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Audit trail of system activities performed by {fullName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setActiveModal(null)} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {/* Search bar */}
          <Box mb={2} display="flex" gap={1.5} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Search user activities..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
            />
            <Chip
              label={`${activityTotal} Total`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: '8px', flexShrink: 0 }}
            />
          </Box>

          {fetchingActivities ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress size={32} />
            </Box>
          ) : userActivities.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <IconHistory size={40} color={theme.palette.text.disabled} />
              <Typography variant="subtitle1" fontWeight={600} mt={1} color="text.secondary">
                No Activity Records Found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                There are no recorded system actions for this user yet.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 380 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>S/N</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>Date Performed</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userActivities
                      .filter((act) => {
                        if (!activitySearch.trim()) return true;
                        const q = activitySearch.toLowerCase();
                        return (
                          (act.description && act.description.toLowerCase().includes(q)) ||
                          (act.log_name && act.log_name.toLowerCase().includes(q)) ||
                          (act.event && act.event.toLowerCase().includes(q))
                        );
                      })
                      .map((item, idx) => (
                        <TableRow key={item.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}>
                            {activityPage * activityRowsPerPage + idx + 1}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={item.log_name ? item.log_name.toUpperCase() : 'SYSTEM'}
                                color="primary"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                }}
                              />
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {item.description || 'System Activity Executed'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.775rem', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {formatActivityDate(item.created_at, item.my_updated_at)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<IconEye size={15} />}
                              onClick={() => setSelectedActivityDetail(item)}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '0.725rem',
                                textTransform: 'none',
                                py: 0.25,
                                px: 1.25,
                                fontWeight: 600,
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={activityTotal}
                rowsPerPage={activityRowsPerPage}
                page={activityPage}
                onPageChange={handleChangeActivityPage}
                onRowsPerPageChange={handleChangeActivityRowsPerPage}
              />
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" size="small" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4b. Activity Log Details Dialog */}
      <Dialog
        open={Boolean(selectedActivityDetail)}
        onClose={() => setSelectedActivityDetail(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Activity Details</Typography>
          <IconButton onClick={() => setSelectedActivityDetail(null)} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedActivityDetail && (
            <Stack spacing={2}>
              <Box p={2} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  ACTION DESCRIPTION
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary.main">
                  {selectedActivityDetail.description || '—'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    MODULE / LOG NAME
                  </Typography>
                  <Chip
                    size="small"
                    label={(selectedActivityDetail.log_name || 'SYSTEM').toUpperCase()}
                    color="primary"
                    sx={{ mt: 0.5, fontWeight: 700 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    DATE & TIME
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {formatActivityDate(selectedActivityDetail.created_at, selectedActivityDetail.my_updated_at)}
                  </Typography>
                </Grid>
              </Grid>

              {selectedActivityDetail.properties && Object.keys(selectedActivityDetail.properties).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    PROPERTIES / ATTRIBUTES
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                      borderRadius: 2,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedActivityDetail.properties, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedActivityDetail(null)} variant="contained" size="small" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. View User Permissions Modal (Clean & Simple) */}
      <Dialog open={activeModal === 'view_permissions'} onClose={() => setActiveModal(null)} maxWidth="md" fullWidth>
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <IconShieldCheck size={22} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700}>
              Permissions Granted to - <Box component="span" color="primary.main">{fullName}</Box>
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModal(null)} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {/* Simple Search Input */}
          <TextField
            placeholder="Search permissions..."
            type="text"
            fullWidth
            size="small"
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
              endAdornment: permissionSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setPermissionSearch('')}>
                    <IconX size={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Clean Grouped Permissions */}
          {groupedPermissions.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ p: 3, textAlign: 'center' }}>
              No matching permissions found.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
              {groupedPermissions.map((group) => (
                <Box
                  key={group.module}
                  sx={{
                    mb: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Module Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}
                      >
                        {prettifyModuleName(group.module)}
                      </Typography>
                    </Box>
                    <Chip label={`${group.permissions.length} Permissions`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  </Box>

                  {/* Module Item List */}
                  <Stack divider={<Divider flexItem />}>
                    {group.permissions.map((permission, index) => (
                      <Box
                        key={permission.name || index}
                        sx={{
                          px: 2,
                          py: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '4px',
                              bgcolor: 'primary.main',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </Box>
                          <Box minWidth={0} flex={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {permission.description || permission.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} noWrap display="block">
                              {permission.name}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="Granted" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setActiveModal(null)} variant="contained" size="small" color="primary">
            Close
          </Button>
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
