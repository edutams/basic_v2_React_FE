import { useContext } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './vertical/header/Header';
import ImpersonationBar from './vertical/header/ImpersonationBar';
import Sidebar from './vertical/sidebar/Sidebar';
import Customizer from './shared/customizer/Customizer';
import Navigation from './horizontal/navbar/Navigation';
import HorizontalHeader from './horizontal/header/Header';
import ScrollToTop from '@/components/shared/ScrollToTop';
// import LoadingBar from '@/LoadingBar';
import DashboardFooter from '@/components/shared/DashboardFooter';
import { CustomizerContext } from '@/context/CustomizerContext';
import { AuthContext } from '@/context/AgentContext/auth';
import config from '@/context/config';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  overflowX: 'auto',
}));

// const PageWrapper = styled('div')(({ theme }) => ({
//   display: 'flex',
//   flexGrow: 1,
//   // paddingBottom: '60px',
//   flexDirection: 'column',
//   zIndex: 1,
//   // backgroundColor: 'transparent',
//   backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#e4e4e4a9',
//   overflowX: 'auto',
// }));

const FullLayout = () => {
  const { activeLayout, isLayout, activeMode, isCollapse } = useContext(CustomizerContext);
  const { isImpersonating } = useContext(AuthContext);
  const MiniSidebarWidth = config.miniSidebarWidth;

  const theme = useTheme();

  return (
    <>
      {/* <LoadingBar /> */}

      <MainWrapper>
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        {activeLayout === 'horizontal' ? '' : <Sidebar />}
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}
        <PageWrapper
          className="page-wrapper"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            ...(activeLayout === 'vertical' && {
              paddingTop: `${config.topbarHeight + (isImpersonating ? config.impersonationBarHeight : 0)}px`,
            }),
            ...(isCollapse === 'mini-sidebar' && {
              [theme.breakpoints.up('lg')]: { ml: `${MiniSidebarWidth}px` },
            }),
          }}
        >
          {/* ------------------------------------------- */}
          {/* Header */}
          {/* ------------------------------------------- */}
          {activeLayout === 'horizontal' ? (
            <HorizontalHeader />
          ) : (
            <>
              <Header />
              <ImpersonationBar />
            </>
          )}
          {/* PageContent */}
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
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}
            <Box sx={{ flex: 1, overflowX: 'auto', py: 1 }}>
              <ScrollToTop>
                <Outlet />
              </ScrollToTop>
            </Box>
            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>

          {/* ------------------------------------------- */}
          {/* Footer */}
          {/* ------------------------------------------- */}
          <DashboardFooter />

          {/* <Customizer /> */}
        </PageWrapper>
      </MainWrapper>
    </>
  );
};

export default FullLayout;
