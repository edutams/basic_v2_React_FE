import { useMediaQuery, Box, Drawer, Container } from '@mui/material';
import SchoolNavListing from './SchoolNavListing';
import Logo from '../../../full/shared/logo/Logo';
import SchoolSidebarItems from '../../vertical/sidebar/SchoolSidebarItems';
import { useContext } from 'react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import config from 'src/context/config';

const SchoolNavigation = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { isLayout, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const SidebarWidth = config.sidebarWidth;

  if (lgUp) {
    return (
      <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }} py={2}>
        <Container
          sx={{
            maxWidth: isLayout === 'boxed' ? '1300px !important' : '100%!important',
          }}
        >
          <SchoolNavListing />
        </Container>
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

export default SchoolNavigation;