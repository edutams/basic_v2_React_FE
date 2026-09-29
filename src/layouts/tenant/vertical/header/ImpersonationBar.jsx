import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import { resolveUserLabel } from '@/utils/roleLabels';

/**
 * Fixed strip docked directly beneath the school header, spanning the same
 * sidebar-aware width. Shown only while an admin is impersonating a
 * learner, staff member, or parent. Page content scrolls beneath it the
 * same way it scrolls beneath the header.
 */
const ImpersonationBar = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const { isCollapse } = useContext(CustomizerContext);
  const { isImpersonated, user, roles, stopImpersonation, tenantInfo } =
    useContext(TenantAuthContext);

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isImpersonated) {
    return null;
  }

  const displayUser = user?.user || user;
  const displayName = displayUser?.full_name || 'this user';
  // `roles` is the impersonated user's own roles (TenantAuthContext replaces
  // it on impersonation) — every user shares a base "user" role, so a
  // parent/learner falls back to their plain user type while staff resolve
  // to what they actually do (Bursar, Class Teacher, School Admin, etc.),
  // matching the same precedence SchoolDashboard.jsx uses to pick a dashboard.
  const roleLabel = resolveUserLabel({
    userTypeId: displayUser?.user_type_id,
    roles,
    staffType: displayUser?.staff?.staff_type,
  });

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: `${config.topbarHeight}px`,
          left: 0,
          right: 0,
          height: `${config.impersonationBarHeight}px`,
          zIndex: 1199,
          bgcolor: 'warning.main',
          borderBottom: `1px solid ${theme.palette.warning.dark}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 3 },
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
          noWrap
          sx={{
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Currently logged in as <strong>{displayName}</strong>
          {roleLabel ? ` (${roleLabel})` : ''}
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={() => setConfirmOpen(true)}
          sx={{
            whiteSpace: 'nowrap',
            fontSize: { xs: '12px', sm: '13px' },
            flexShrink: 0,
            bgcolor: 'rgba(0, 0, 0, 0.87)',
            color: '#ffffff',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          }}
        >
          {lgUp ? 'Return to my account' : 'Exit'}
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Return to your account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            You are currently impersonating <strong>{displayName}</strong> at{' '}
            <strong>{tenantInfo?.tenant_name || tenantInfo?.school_name || 'this school'}</strong>.
            Returning will restore your admin session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="inherit"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={() => {
              setConfirmOpen(false);
              stopImpersonation();
            }}
            sx={{ bgcolor: '#593196', color: '#ffffff', '&:hover': { bgcolor: '#4a2880' } }}
          >
            Yes, return to my account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImpersonationBar;
