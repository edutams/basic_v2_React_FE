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
import config from '@/context/config';
import { CustomizerContext } from '@/context/CustomizerContext';
import { AuthContext } from '@/context/AgentContext/auth';

/**
 * Fixed strip docked directly beneath the landlord header, spanning the same
 * sidebar-aware width. Shown only while an admin is impersonating an agent.
 * Page content scrolls beneath it the same way it scrolls beneath the header.
 */
const ImpersonationBar = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const { isCollapse } = useContext(CustomizerContext);
  const { isImpersonating, user, stopImpersonation } = useContext(AuthContext);

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isImpersonating) {
    return null;
  }

  const displayUser = user?.user || user;
  const displayName = [displayUser?.fname, displayUser?.lname].filter(Boolean).join(' ') || 'this agent';
  const organizationName = displayUser?.organization?.organization_name || null;

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
          {organizationName ? ` (${organizationName})` : ''}
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
            You are currently impersonating <strong>{displayName}</strong>
            {organizationName ? (
              <>
                {' '}
                at <strong>{organizationName}</strong>
              </>
            ) : null}
            . Returning will restore your admin session.
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
