import React from 'react';
import { useMediaQuery, Box, Drawer, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import SchoolSidebarItems from './SchoolSidebarItems';
import Logo from '../../../landlord/shared/logo/Logo';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext } from 'react';
import { TenantAuthContext } from 'src/context/TenantContext/auth';

const SchoolSidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { isCollapse, isSidebarHover, setIsSidebarHover, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);
  // The agent/organization that onboarded this school sets this (falls back
  // to the school's own uploaded logo, then the default wordmark) — see
  // getAcademicInfo() on the backend. Refetched on every reload, so an
  // agent changing their own logo reaches every school under them without
  // any extra sync.
  const { tenantInfo } = useContext(TenantAuthContext);

  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;

  const theme = useTheme();
  const toggleWidth =
    isCollapse == 'mini-sidebar' && !isSidebarHover ? MiniSidebarWidth : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse == 'mini-sidebar') {
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
          ...(isCollapse == 'mini-sidebar' && {
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
            },
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box px={3} sx={{ flexShrink: 0 }}>
              <Logo logoUrl={tenantInfo?.logo_url} />
            </Box>
            <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
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
        },
      }}
    >
      <Box px={2}>
        <Logo logoUrl={tenantInfo?.logo_url} />
      </Box>
      <SchoolSidebarItems />
    </Drawer>
  );
};

export default SchoolSidebar;
