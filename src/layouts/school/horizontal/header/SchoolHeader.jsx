import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, styled, useMediaQuery, IconButton, Box, Stack, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconMenu2, IconMoon, IconSun, IconCategory2, IconX } from '@tabler/icons-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import config from 'src/context/config';
import Logo from '../../../full/shared/logo/Logo';
import Search from '../../../full/vertical/header/Search';
import Language from '../../../full/vertical/header/Language';
import Notifications from '../../../full/vertical/header/Notification';
import Profile from '../../../full/vertical/header/Profile';
import SchoolNavigation from './SchoolNavigation';

const SchoolHeader = () => {
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const [isVisible, setIsVisible] = useState(false);

  const { activeMode, setActiveMode, isLayout, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    margin: "0 auto",
    width: "100%",
    color: `${theme.palette.text.primary} !important`,
    paddingLeft: "16px !important",
    paddingRight: "16px !important"
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
      <IconButton
        size="large"
        color="inherit"
        onClick={() => setIsVisible(!isVisible)}
      >
        <IconCategory2 size="21" />
      </IconButton>
    );
  };

  return (
    <AppBarStyled position="sticky" color="default" elevation={8}>
      <ToolbarStyled
        sx={{
          maxWidth: isLayout === "boxed" ? "1300px" : "100%!important",
        }}
      >
        <Box sx={{ width: lgDown ? "40px" : "auto", overflow: "hidden" }}>
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
          ""
        )}
        
        {lgUp ? <Search /> : null}
        {lgUp ? <SchoolNavigation /> : null}

        <Box flexGrow={1} />
        <Stack direction="row" gap={1} alignItems="center">
          <IconButton color="inherit">
            {activeMode === 'light' ? (
              <IconMoon size="21" onClick={() => setActiveMode("dark")} />
            ) : (
              <IconSun size="21" onClick={() => setActiveMode("light")} />
            )}
          </IconButton>

          <Language />
          <Notifications />
          {lgDown ? <MobileRightSidebar /> : null}
          <Profile />

          {isVisible && (
            <CollpaseMenubar>
              <Stack direction="row" justifyContent='space-between' spacing={1}>
                <Box display='flex' gap={1}>
                  <Notifications />
                  <Language />
                  <Search />
                </Box>
                <IconButton
                  color="inherit"
                  onClick={() => setIsVisible(!isVisible)}
                >
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