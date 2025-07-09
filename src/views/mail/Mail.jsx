// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState, useContext } from 'react';
import { Button, Box, Drawer, useMediaQuery } from '@mui/material';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import EmailLists from '../../components/add-mail/component/EmailList';
import EmailFilter from '../../components/add-mail/component/EmailFilter';
import EmailSearch from '../../components/add-mail/component/EmailSearch';
import EmailContent from '../../components/add-mail/component/EmailContent';
import PageContainer from '../../components/container/PageContainer';
import AppCard from '../../components/shared/AppCard';
import { EmailContextProvider, EmailContext } from '../../context/EmailContext/index';

const drawerWidth = 240;
const secdrawerWidth = 340;

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Email',
  },
];

// Inner component to access context inside provider
const InnerEmail = () => {
  const { emails = [] } = useContext(EmailContext);
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const totalSent = emails.filter(email => email.sent).length;
  const totalReceived = emails.filter(email => email.inbox).length;
  console.log('Total Sent:', totalSent);
  console.log('Total Received:', totalReceived);

  return (
    <PageContainer title="Email App" description="this is email page">
      <Breadcrumb title="Email app" items={BCrumb} />

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 300px' }, minWidth: 0, maxWidth: { xs: '100%', sm: '300px' } }}>
          <Box
            component="div"
            sx={{
              boxShadow: 2,
              borderRadius: 1,
              p: { xs: 1.5, sm: 2 },
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              height: { xs: 'auto', sm: 90 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 }, color: 'grey.800' }}>Total</Box>
              <Box sx={{ fontWeight: 400, fontSize: { xs: 14, sm: 16 }, color: 'grey.500' }}>mail sent</Box>
            </Box>
            <Box sx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 700, color: 'primary.main', ml: { xs: 1, sm: 2 } }}>
              {totalSent || 0}
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 300px' }, minWidth: 0, maxWidth: { xs: '100%', sm: '300px' } }}>
          <Box
            component="div"
            sx={{
              boxShadow: 2,
              borderRadius: 1,
              p: { xs: 1.5, sm: 2 },
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              height: { xs: 'auto', sm: 90 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 }, color: 'grey.800' }}>Total</Box>
              <Box sx={{ fontWeight: 400, fontSize: { xs: 14, sm: 16 }, color: 'grey.500' }}>mail received</Box>
            </Box>
            <Box sx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 700, color: 'primary.main', ml: { xs: 1, sm: 2 } }}>
              {totalReceived || 0}
            </Box>
          </Box>
        </Box>
      </Box>

      <AppCard sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, flexDirection: { xs: 'column', md: 'row' }, p: 0 }}>
        {/* Left part */}
        <Drawer
          open={isLeftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          sx={{
            width: drawerWidth,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, position: 'relative', zIndex: 2 },
            flexShrink: 0,
          }}
          variant={lgUp ? 'permanent' : 'temporary'}
        >
          <EmailFilter />
        </Drawer>

        {/* Middle part */}
        <Box
          sx={{
            minWidth: 0,
            width: { xs: '100%', md: secdrawerWidth, lg: secdrawerWidth },
            flexShrink: 0,
          }}
        >
          <EmailSearch onClick={() => setLeftSidebarOpen(true)} />
          <EmailLists showrightSidebar={() => setRightSidebarOpen(true)} />
        </Box>

        {/* Right part */}
        {mdUp ? (
          <Drawer
            anchor="right"
            variant="permanent"
            sx={{
              zIndex: 0,
              width: '200px',
              flex: '1 1 auto',
              [`& .MuiDrawer-paper`]: { position: 'relative' },
            }}
          >
            <Box>
              <EmailContent />
            </Box>
          </Drawer>
        ) : (
          <Drawer
            anchor="right"
            open={isRightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: '85%' },
            }}
            variant="temporary"
          >
            <Box p={3}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => setRightSidebarOpen(false)}
                sx={{ mb: 3, display: { xs: 'block', md: 'none', lg: 'none' } }}
              >
                Back
              </Button>
              <EmailContent />
            </Box>
          </Drawer>
        )}
      </AppCard>
    </PageContainer>
  );
};

const Email = () => {
  return (
    <EmailContextProvider>
      <InnerEmail />
    </EmailContextProvider>
  );
};

export default Email;