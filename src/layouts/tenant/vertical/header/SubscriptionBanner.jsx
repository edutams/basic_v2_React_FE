import { useContext } from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { TenantAuthContext } from '@/context/TenantContext/auth';

// Tenant-guard Spatie roles that can manage the school's subscription — same
// list as config/subscription.php's admin_roles on the backend, and
// TenantProtectedRoute.jsx's ADMIN_TIER_ROLES. Only they see this banner:
// end users must never be told their school is behind on payment (see
// SubscriptionLockedNotice for their generic, role-blind message instead).
const ADMIN_TIER_ROLES = ['super_admin', 'school_admin', 'school_owner', 'school_head'];

/**
 * Fixed strip docked beneath the header (and beneath the impersonation bar,
 * if that's showing too) — same sidebar-aware positioning pattern as
 * ImpersonationBar.jsx. Hidden while the subscription is fully active;
 * amber during the free grace period with a due date, red once locked.
 */
const SubscriptionBanner = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();
  const { isCollapse } = useContext(CustomizerContext);
  const { subscriptionStatus, isImpersonated, roles } = useContext(TenantAuthContext);

  const tier = subscriptionStatus?.tier;
  const isAdminTier =
    Array.isArray(roles) &&
    roles.some((r) => ADMIN_TIER_ROLES.includes(typeof r === 'string' ? r : r?.name));

  if (!tier || tier === 'active' || !isAdminTier) {
    return null;
  }

  const isLocked = tier === 'locked';
  const label = subscriptionStatus?.session_name && subscriptionStatus?.term_name
    ? `${subscriptionStatus.session_name} - ${subscriptionStatus.term_name}`
    : null;
  const dueDateLabel = subscriptionStatus?.due_date
    ? new Date(subscriptionStatus.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const message =
    subscriptionStatus?.message ||
    (isLocked
      ? `Your school's subscription${label ? ` for ${label}` : ''} has expired. Please renew to restore full access.`
      : `Your subscription${label ? ` for ${label}` : ''} is due${dueDateLabel ? ` on ${dueDateLabel}` : ' soon'}.`);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: `${config.topbarHeight + (isImpersonated ? config.impersonationBarHeight : 0)}px`,
        left: 0,
        right: 0,
        minHeight: `${config.subscriptionBannerHeight}px`,
        zIndex: 1198,
        bgcolor: isLocked ? 'error.main' : 'warning.main',
        borderBottom: `1px solid ${isLocked ? theme.palette.error.dark : theme.palette.warning.dark}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 0 },
        ...(lgUp && {
          left:
            isCollapse === 'mini-sidebar'
              ? `${config.miniSidebarWidth}px`
              : `${config.sidebarWidth}px`,
        }),
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: isLocked ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>

      <Button
        variant="contained"
        size="small"
        onClick={() => navigate('/subscriptions')}
        sx={{
          whiteSpace: 'nowrap',
          fontSize: { xs: '12px', sm: '13px' },
          flexShrink: 0,
          bgcolor: isLocked ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          color: isLocked ? 'error.main' : '#ffffff',
          '&:hover': { bgcolor: isLocked ? '#f3f4f6' : 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        Manage Subscription
      </Button>
    </Box>
  );
};

export default SubscriptionBanner;
