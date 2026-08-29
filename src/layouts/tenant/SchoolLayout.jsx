import { useContext } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SchoolHeader from './vertical/header/SchoolHeader';
import SchoolSidebar from './vertical/sidebar/SchoolSidebar';
import Customizer from '../landlord/shared/customizer/Customizer';
import DashboardFooter from '../../components/shared/DashboardFooter';
import { CustomizerContext } from 'src/context/CustomizerContext';
import Navigation from './horizontal/navbar/SchoolNavigation';
import HorizontalHeader from './horizontal/header/SchoolHeader';
import ScrollToTop from '../../components/shared/ScrollToTop';
import LoadingBar from '../../LoadingBar';
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
  // backgroundColor: 'transparent',
  backgroundColor: '#e4e4e4a9',
  overflowX: 'auto',
}));

const SchoolLayout = () => {
  // const { isCollapse } = useContext(CustomizerContext);
  const { activeLayout, isLayout, activeMode, isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();

  return (
    <>
      <LoadingBar />

      <MainWrapper>
        {activeLayout === 'horizontal' ? '' : <SchoolSidebar />}
        <PageWrapper
          className="page-wrapper"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            ...(activeLayout === 'vertical' && { paddingTop: '70px' }),
            ...(isCollapse === 'mini-sidebar' && {
              [theme.breakpoints.up('lg')]: { ml: `${MiniSidebarWidth}px` },
            }),
          }}
        >
          {activeLayout === 'horizontal' ? <HorizontalHeader /> : <SchoolHeader />}

          {activeLayout === 'horizontal' ? <Navigation /> : ''}

          <Container
            sx={{
              maxWidth: isLayout === 'boxed' ? '1300px !important' : '100%!important',
              overflowX: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box sx={{ flex: 1, overflowX: 'auto', py: 3, }}>
              <ScrollToTop>
                <Outlet />
              </ScrollToTop>
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
