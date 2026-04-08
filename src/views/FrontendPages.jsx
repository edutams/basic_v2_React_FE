import React from 'react';
import { Box } from '@mui/material';
import Banner from 'src/components/frontend-pages/homepage/banner/Banner';
import Features from 'src/components/frontend-pages/homepage/features/Features';
import ExceptionalFeature from 'src/components/frontend-pages/homepage/exceptional-feature/index';
import DefendFocus from 'src/components/frontend-pages/homepage/defend-focus/index';
import PowerfulDozens from 'src/components/frontend-pages/homepage/powerful-dozens';
import FAQ from 'src/components/frontend-pages/homepage/faq';
import HpHeader from 'src/components/frontend-pages/shared/header/HpHeader';
import Footer from 'src/components/frontend-pages/shared/footer';
import ScrollToTop from 'src/components/frontend-pages/shared/scroll-to-top';
import C2a from 'src/components/frontend-pages/shared/c2a';
import Leadership from 'src/components/frontend-pages/shared/leadership';

const FrontendPages = () => {
  return (
    <Box>
      <HpHeader />
      <Banner />
      <Features />
      <ExceptionalFeature />
      <DefendFocus />
      <PowerfulDozens />
      <FAQ />
      <Leadership />
      <C2a />
      <Footer />
      <ScrollToTop />
    </Box>
  );
};

export default FrontendPages;
