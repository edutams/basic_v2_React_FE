import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  styled,
  useMediaQuery,
  IconButton,
  Box,
  Stack,
  Container,
  Button,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconMenu2,
  IconMoon,
  IconSun,
  IconCategory2,
  IconX,
  IconArrowLeft,
} from '@tabler/icons-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import config from 'src/context/config';
import Logo from '../../../landlord/shared/logo/Logo';
import Search from '../../../landlord/vertical/header/Search';
import Language from '../../../landlord/vertical/header/Language';
import Notifications from '../../../landlord/vertical/header/Notification';
import Profile from '../../../landlord/vertical/header/Profile';
import { TenantAuthContext } from '../../../../context/TenantContext/auth';
// import SchoolNavigation from './SchoolNavigation';

const SchoolHeader = () => {
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const [isVisible, setIsVisible] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { activeMode, setActiveMode, isLayout, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);
  const { isImpersonating, stopImpersonation, tenantInfo } = useContext(TenantAuthContext);
  const TopbarHeight = config.topbarHeight;

  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;
  const schoolName = tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || null;
  const academicSession = tenantInfo?.academic_session ?? 'No Active Session';
  const academicTerm = tenantInfo?.academic_term ?? 'No active term';
  const academicWeek = tenantInfo?.academic_week ?? 'No active week';

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    margin: '0 auto',
    width: '100%',
    color: `${theme.palette.text.primary} !important`,
    paddingLeft: '16px !important',
    paddingRight: '16px !important',
  }));

  const CollpaseMenubar = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
    display: 'flex',
    justifyContent: 'space-between',
    background: theme.palette.background.paper,
    padding: '16px',
    borderRadius: '12px',
    marginTop: '15px',
    boxShadow: theme.shadows[8],
  }));

  const MobileRightSidebar = () => {
    return (
      <IconButton size="large" color="inherit" onClick={() => setIsVisible(!isVisible)}>
        <IconCategory2 size="21" />
      </IconButton>
    );
  };

  return (
    <AppBarStyled position="sticky" color="default" elevation={8}>
      <ToolbarStyled
        sx={{
          maxWidth: isLayout === 'boxed' ? '1300px' : '100%!important',
        }}
      >
        <Box sx={{ width: lgDown ? '40px' : 'auto', overflow: 'hidden' }}>
          <Logo />
        </Box>

        {lgDown ? (
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => setIsMobileSidebar(!isMobileSidebar)}
          >
            <IconMenu2 size="21" />
          </IconButton>
        ) : (
          ''
        )}

        {lgUp ? (
          <Stack direction="row" spacing={2} alignItems="center">
            {(schoolLogo || schoolName || academicSession) && (
              <Stack direction="column" spacing={0.5} alignItems="flex-start">
                {(schoolLogo || schoolName) && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    {schoolLogo && (
                      <Avatar
                        src={schoolLogo}
                        alt={schoolName || 'School Logo'}
                        variant="rounded"
                        sx={{ width: 36, height: 36 }}
                      />
                    )}
                    {schoolName && (
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}
                      >
                        {schoolName}
                      </Typography>
                    )}
                  </Stack>
                )}
                {(academicSession || academicTerm || academicWeek) && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Active Term: {academicSession} | {academicTerm} | {academicWeek}
                  </Typography>
                )}
              </Stack>
            )}
            <Search />
          </Stack>
        ) : null}
        {lgUp ? <SchoolNavigation /> : null}

        {isImpersonating && (
          <Box
            sx={{
              // bgcolor: 'warning.main',
              bgcolor: '#593196',
              color: '#ffffff',
              px: { xs: 1, sm: 2 },
              py: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1 },
              ml: { xs: 1, sm: 2 },
              maxWidth: { xs: '160px', sm: 'none' },
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                whiteSpace: 'nowrap',
              }}
            >
              Logged in as
            </Typography>

            <Button
              size="small"
              color="inherit"
              onClick={() => setConfirmOpen(true)}
              sx={{
                whiteSpace: 'nowrap',
                fontSize: { xs: '10px', sm: '13px' },
                px: { xs: 0.75, sm: 1.5 },
                minWidth: 'unset',
              }}
            >
              {lgUp ? 'Return to my account' : 'Exit'}
            </Button>
          </Box>
        )}

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Return to your account?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              You are currently impersonating{' '}
              <strong>{tenantInfo?.tenant_name || tenantInfo?.school_name || 'this school'}</strong>
              . Returning will restore your admin session.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button color="inherit" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
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
        <Box flexGrow={1} />
        <Stack direction="row" gap={1} alignItems="center">
          <IconButton color="inherit">
            {activeMode === 'light' ? (
              <IconMoon size="21" onClick={() => setActiveMode('dark')} />
            ) : (
              <IconSun size="21" onClick={() => setActiveMode('light')} />
            )}
          </IconButton>

          <Language />
          <Notifications />
          {lgDown ? <MobileRightSidebar /> : null}
          <Profile />

          {isVisible && (
            <CollpaseMenubar>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box display="flex" gap={1}>
                  <Notifications />
                  <Language />
                  <Search />
                </Box>
                <IconButton color="inherit" onClick={() => setIsVisible(!isVisible)}>
                  <IconX size="21" />
                </IconButton>
              </Stack>
            </CollpaseMenubar>
          )}
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default SchoolHeader;
