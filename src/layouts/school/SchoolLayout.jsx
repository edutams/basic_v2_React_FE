import { useContext } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SchoolHeader from './vertical/header/SchoolHeader';
import SchoolSidebar from './vertical/sidebar/SchoolSidebar';
import DashboardFooter from '@/components/shared/DashboardFooter';
import { CustomizerContext } from '@/context/CustomizerContext';
import ScrollToTop from '@/components/shared/ScrollToTop';
import LoadingBar from '@/LoadingBar';
import config from '@/context/config';

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
