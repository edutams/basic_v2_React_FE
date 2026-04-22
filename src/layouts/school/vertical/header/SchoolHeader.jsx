import React, { useContext } from 'react';
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

  const TopbarHeight = config.topbarHeight;
  const theme = useTheme();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
    maxWidth: isLayout === 'boxed' ? '1300px' : '100%!important',
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
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
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default SchoolHeader;
