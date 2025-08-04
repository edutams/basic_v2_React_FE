import React from 'react';
import { useMediaQuery, Box, Drawer, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import SchoolSidebarItems from './SchoolSidebarItems';
import Logo from '../../../full/shared/logo/Logo';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext } from 'react';

const SchoolSidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const {
    isCollapse,
    isSidebarHover,
    setIsSidebarHover,
    isMobileSidebar,
    setIsMobileSidebar,
  } = useContext(CustomizerContext);

  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;

  const theme = useTheme();
  const toggleWidth =
    isCollapse == "mini-sidebar" && !isSidebarHover
      ? MiniSidebarWidth
      : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse == "mini-sidebar") {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: toggleWidth,
          flexShrink: 0,
          ...(isCollapse == "mini-sidebar" && {
            position: 'absolute',
          }),
        }}
      >
        <Drawer
          anchor="left"
          open
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                transition: theme.transitions.create('width', {
                  duration: theme.transitions.duration.shortest,
                }),
                width: toggleWidth,
              },
            }
          }}
        >
          <Box
            sx={{
              height: '100%',
            }}
          >
            <Box px={3}>
              <Logo />
            </Box>
            <Scrollbar sx={{ height: 'calc(100% - 244px)' }}>
              <SchoolSidebarItems />
            </Scrollbar>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebar}
      onClose={() => setIsMobileSidebar(false)}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: SidebarWidth,
            border: '0 !important',
            boxShadow: (theme) => theme.shadows[8],
          },
        }
      }}
    >
      <Box px={2}>
        <Logo />
      </Box>
      <SchoolSidebarItems />
    </Drawer>
  );
};

export default SchoolSidebar;
