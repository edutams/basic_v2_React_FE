import { useContext, useEffect, useRef } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SchoolHeader from './vertical/header/SchoolHeader';
import ImpersonationBar from './vertical/header/ImpersonationBar';
import SubscriptionBanner from './vertical/header/SubscriptionBanner';
import SchoolSidebar from './vertical/sidebar/SchoolSidebar';
import Customizer from '../landlord/shared/customizer/Customizer';
import DashboardFooter from '../../components/shared/DashboardFooter';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { TenantAuthContext } from '../../context/TenantContext/auth';
import { useSnackbar } from '../../context/SnackbarContext';
import Navigation from './horizontal/navbar/SchoolNavigation';
import HorizontalHeader from './horizontal/header/SchoolHeader';
import ScrollToTop from '../../components/shared/ScrollToTop';
// import LoadingBar from '../../LoadingBar';
import config from 'src/context/config';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  overflowX: 'auto',
}));

const PageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
  zIndex: 1,
  // backgroundColor: 'transparent',//
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#e4e4e4a9',
  overflowX: 'auto',
}));

const SchoolLayout = () => {
  // const { isCollapse } = useContext(CustomizerContext);
  const { activeLayout, isLayout, activeMode, isCollapse } = useContext(CustomizerContext);
  const { isImpersonated, subscriptionStatus } = useContext(TenantAuthContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useSnackbar();
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const lockNoticeShownRef = useRef(false);

  // An admin clicking into a page while the subscription is locked (e.g. a
  // stale bookmark, or TenantProtectedRoute letting admins through so they
  // can still reach /subscriptions from anywhere) previously just hit a page
  // that silently never loaded any data — every data call 402s with the
  // same "subscription_locked" payload tenant_api.js already turns into
  // this event. Surface it once (parallel 402s on page mount shouldn't
  // stack several toasts) and land admins on the subscription page itself.
  useEffect(() => {
    const handleLocked = (event) => {
      // A 402 can still be in flight from a background fetch (dashboard
      // stats, a poll, whatever was on screen) at the exact moment the user
      // logs out — logout itself already cleared the token and is about to
      // navigate to /login. Racing that with a navigate('/subscriptions')
      // here previously meant whichever call finished last decided where
      // the user actually landed, so logout could visibly "fail" even
      // though the server-side logout had already succeeded. Once there's
      // no token, the session is gone or going — this event is stale,
      // ignore it entirely rather than fighting over where to redirect.
      if (!localStorage.getItem('tenant_access_token')) {
        return;
      }

      const detail = event.detail || {};
      if (!lockNoticeShownRef.current) {
        lockNoticeShownRef.current = true;
        showError(detail.message || "Your school's subscription has expired.", { duration: 8000 });
        window.setTimeout(() => {
          lockNoticeShownRef.current = false;
        }, 5000);
      }
      if (detail.audience === 'admin' && pathnameRef.current !== '/subscriptions') {
        navigate('/subscriptions');
      }
    };
    window.addEventListener('tenant_subscription:locked', handleLocked);
    return () => window.removeEventListener('tenant_subscription:locked', handleLocked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscriptionTier = subscriptionStatus?.tier;
  const showSubscriptionBanner = subscriptionTier && subscriptionTier !== 'active';

  return (
    <>
      {/* <LoadingBar /> */}

      <MainWrapper>
        {activeLayout === 'horizontal' ? '' : <SchoolSidebar />}
        <PageWrapper
          className="page-wrapper"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            ...(activeLayout === 'vertical' && {
              paddingTop: `${
                config.topbarHeight +
                (isImpersonated ? config.impersonationBarHeight : 0) +
                (showSubscriptionBanner ? config.subscriptionBannerHeight : 0)
              }px`,
            }),
            ...(isCollapse === 'mini-sidebar' && {
              [theme.breakpoints.up('lg')]: { ml: `${MiniSidebarWidth}px` },
            }),
          }}
        >
          {activeLayout === 'horizontal' ? (
            <HorizontalHeader />
          ) : (
            <>
              <SchoolHeader />
              <ImpersonationBar />
              <SubscriptionBanner />
            </>
          )}

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
