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
  const { isImpersonated, stopImpersonation } = useContext(TenantAuthContext);

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

        {lgUp ? <Search /> : null}

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

          <Language />
          <Notifications />
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default SchoolHeader;
