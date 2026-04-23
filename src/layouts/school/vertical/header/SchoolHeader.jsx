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
} from '@mui/material';
import { IconMenu2, IconMoon, IconSun, IconArrowLeft } from '@tabler/icons-react';
import config from 'src/context/config';
import { useTheme } from '@mui/material/styles';
import { CustomizerContext } from 'src/context/CustomizerContext';
import Search from '../../../full/vertical/header/Search';
import Language from '../../../full/vertical/header/Language';
import Notifications from '../../../full/vertical/header/Notification';
import Profile from './TenantProfile';
import { TenantAuthContext } from 'src/context/TenantContext/auth';

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
  const { isImpersonated, stopImpersonation, tenantInfo } = useContext(TenantAuthContext);

  const schoolLogo = tenantInfo?.logo_url || tenantInfo?.logo || null;
  const schoolName = tenantInfo?.school_name || tenantInfo?.name || tenantInfo?.tenant_name || null;
  const academicSession = tenantInfo?.academic_session ?? 'No Active Session';
  const academicTerm = tenantInfo?.academic_term ?? 'No active term';
  const academicWeek = tenantInfo?.academic_week ?? 'No active week';

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
      marginLeft: isCollapse === 'mini-sidebar' ? `${config.miniSidebarWidth}px` : `${config.sidebarWidth}px`,
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
          marginLeft: isCollapse === 'mini-sidebar' ? `${config.miniSidebarWidth}px` : `${config.sidebarWidth}px`,
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
                        sx={{
                          color: 'text.primary',
                          display: { xs: 'none', sm: 'block' },
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          maxWidth: 200,
                        }}
                      >
                        {schoolName}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        ) : null}

        {isImpersonated && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'warning.light',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              mr: 2,
            }}
          >
            <IconArrowLeft size={18} sx={{ mr: 1, color: 'warning.main' }} />
            <Button
              color="inherit"
              onClick={stopImpersonation}
              sx={{
                color: 'warning.main',
                fontWeight: 600,
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
              }}
            >
              {lgUp ? 'Return to my account' : 'Exit'}
            </Button>
          </Box>
        )}

        <Box flexGrow={1} />

        {(academicSession || academicTerm || academicWeek) && (
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
                {academicSession} | {academicTerm} | {academicWeek}
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
