import { useContext } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router';
import SchoolHeader from './vertical/header/SchoolHeader';
import SchoolSidebar from './vertical/sidebar/SchoolSidebar';
import Customizer from '../full/shared/customizer/Customizer';
import DashboardFooter from '../../components/shared/DashboardFooter';
import { CustomizerContext } from 'src/context/CustomizerContext';
// import LoadingBar from '../../LoadingBar';
import config from 'src/context/config';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  overflowX: 'auto',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
  overflowX: 'auto',
}));

const SchoolLayout = () => {
  const { isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();

  return (
    <>
      {/* <LoadingBar /> */}
    
    <MainWrapper>
      <SchoolSidebar />
      <PageWrapper
        className="page-wrapper"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ...(isCollapse === "mini-sidebar" && {
            [theme.breakpoints.up('lg')]: { ml: `${MiniSidebarWidth}px` },
          }),
        }}
      >
        <SchoolHeader />
        <Container
          sx={{
            maxWidth: '100%!important',
            overflowX: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box mt={4} sx={{ flex: 1, overflowX: 'auto' }}>
            <Outlet />
          </Box>
        </Container>
        <DashboardFooter />
      </PageWrapper>
      {/* <Customizer /> */}
    </MainWrapper>
      </>
  );
};

export default SchoolLayout;
