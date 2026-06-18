import React, { useContext, useState } from 'react';
import {
  IconButton,
  Box,
  AppBar,
  useMediaQuery,
  Toolbar,
  styled,
  Stack,
  Button,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { IconMenu2, IconMoon, IconSun, IconArrowLeft, IconSchool } from '@tabler/icons-react';
import config from 'src/context/config';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import Search from '../../../landlord/vertical/header/Search';
import Language from '../../../landlord/vertical/header/Language';
import Notifications from '../../../landlord/vertical/header/Notification';
import Profile from './TenantProfile';
import { TenantAuthContext } from '../../../../context/TenantContext/auth';

const SchoolHeader = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const {
    activeMode,
    setActiveMode,
    setIsCollapse,
    isCollapse,
    isMobileSidebar,
    setIsMobileSidebar,
    isLayout,
  } = useContext(CustomizerContext);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const { isImpersonated, stopImpersonation, tenantInfo } = useContext(TenantAuthContext);

  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;
  const schoolName = tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || null;
  const academicSession = tenantInfo?.academic_session ?? null;
  const academicTerm = tenantInfo?.academic_term ?? null;
  const academicWeek = tenantInfo?.academic_week ?? null;

  const TopbarHeight = config.topbarHeight;
  const theme = useTheme();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    zIndex: 1200,
    // Account for sidebar width on large screens
    [theme.breakpoints.up('lg')]: {
      minHeight: TopbarHeight,
      marginLeft:
        isCollapse === 'mini-sidebar' ? `${config.miniSidebarWidth}px` : `${config.sidebarWidth}px`,
    },
    // On smaller screens, full width
    [theme.breakpoints.down('lg')]: {
      minHeight: TopbarHeight,
      marginLeft: 0,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: `${theme.palette.text.primary} !important`,
    paddingLeft: '288px !important',
    paddingRight: '16px !important',
    // On smaller screens, reduce padding
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '18px !important',
    },
  }));

  const CollpaseMenubar = styled(Box)(({ theme }) => ({
    position: 'absolute',
    left: '4px',
    top: '4px',
    right: '4px',
    padding: '7px 15px',
    background: theme.palette.background.paper,
    border: `1px solid ${borderColor}`,
    zIndex: 1,
    borderRadius: '7px',
  }));

  const [isVisible, setIsVisible] = useState(false);

  return (
    <AppBarStyled
      position="fixed"
      color="default"
      sx={{
        ...(lgUp && {
          marginLeft:
            isCollapse === 'mini-sidebar'
              ? `${config.miniSidebarWidth}px`
              : `${config.sidebarWidth}px`,
        }),
      }}
    >
      <ToolbarStyled
        sx={{
          paddingLeft: lgUp
            ? `${(isCollapse === 'mini-sidebar' ? config.miniSidebarWidth : config.sidebarWidth) + 18}px !important`
            : '18px !important',
        }}
      >
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={() => {
            if (lgUp) {
              isCollapse === 'full-sidebar'
                ? setIsCollapse('mini-sidebar')
                : setIsCollapse('full-sidebar');
            } else {
              setIsMobileSidebar(!isMobileSidebar);
            }
          }}
        >
          <IconMenu2 size="21" />
        </IconButton>

        {lgUp ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Search />
            {tenantInfo && (
              <Stack direction="column" spacing={0.5} alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={schoolLogo || undefined}
                    alt={schoolName || 'School Logo'}
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: schoolLogo ? 'transparent' : 'grey.200',
                    }}
                  >
                    {!schoolLogo && <IconSchool size={22} color="#9e9e9e" />}
                  </Avatar>
                  {schoolName && (
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        color: 'text.primary',
                        display: { xs: 'none', sm: 'block' },
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        maxWidth: 350,
                      }}
                    >
                      {schoolName}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        ) : null}
        {isImpersonated && (
          <Box
            sx={{
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
              sx={{
                display: { xs: 'none', sm: 'block' },
                whiteSpace: 'nowrap',
              }}
            >
              Logged in as
            </Typography>

            <Button
              size="small"
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

        {tenantInfo && (
          <Box sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
            <Stack spacing={0} sx={{ lineHeight: 1.2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Active Term
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {academicSession || 'No Active Session'} | {academicTerm || 'No active term'} |{' '}
                {academicWeek || 'No active week'}
              </Typography>
            </Stack>
          </Box>
        )}

        <Stack direction="row" gap={1} alignItems="center">
          <IconButton color="inherit">
            {activeMode === 'light' ? (
              <IconMoon size="21" onClick={() => setActiveMode('dark')} />
            ) : (
              <IconSun size="21" onClick={() => setActiveMode('light')} />
            )}
          </IconButton>

          {/* <Language /> */}
          <Notifications />
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
