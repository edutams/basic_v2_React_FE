import { useContext } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet } from 'react-router';
import Header from './vertical/header/Header';
import Sidebar from './vertical/sidebar/Sidebar';
import Customizer from './shared/customizer/Customizer';
import Navigation from './horizontal/navbar/Navigation';
import HorizontalHeader from './horizontal/header/Header';
import ScrollToTop from '../../components/shared/ScrollToTop';
import LoadingBar from '../../LoadingBar';
import DashboardFooter from '../../components/shared/DashboardFooter';
import { CustomizerContext } from 'src/context/CustomizerContext';
import config from 'src/context/config';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  overflowX: 'auto', // Added for potential horizontal scrolling
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  // paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
  overflowX: 'auto', // Added for potential horizontal scrolling
}));

const FullLayout = () => {
  const { activeLayout, isLayout, activeMode, isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;

  const theme = useTheme();

  return (
    <>
      <LoadingBar />

      <MainWrapper
      >
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
            ...(isCollapse === "mini-sidebar" && {
              [theme.breakpoints.up('lg')]: { ml: `${MiniSidebarWidth}px` },
            }),
          }}
        >
          {/* ------------------------------------------- */}
          {/* Header */}
          {/* ------------------------------------------- */}
          {activeLayout === 'horizontal' ? <HorizontalHeader /> : <Header />}
          {/* PageContent */}
          {activeLayout === 'horizontal' ? <Navigation /> : ''}
          <Container
            sx={{
              maxWidth: isLayout === 'boxed' ? '1300px !important'  : '100%!important',
              overflowX: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ------------------------------------------- */}
            {/* PageContent */}
            {/* ------------------------------------------- */}
            <Box mt={4} sx={{ flex: 1, overflowX: 'auto' }}>
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
