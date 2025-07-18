import React from 'react';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material';
import Stack from '@mui/material/Stack';
import BannerContent from './BannerContent';
import bannerbgImg1 from 'src/assets/images/landingpage/bannerimg1.png';
import bannerbgImg2 from 'src/assets/images/landingpage/bannerimg2.png';

const Banner = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const SliderBox = styled(Box)(() => ({
    '@keyframes slideup': {
      '0%': {
        transform: 'translate3d(0, 0, 0)',
      },
      '100% ': {
        transform: 'translate3d(0px, -100%, 0px)',
      },
    },

    animation: 'slideup 35s linear infinite',
  }));

  const SliderBox2 = styled(Box)(() => ({
    '@keyframes slideDown': {
      '0%': {
        transform: 'translate3d(0, -100%, 0)',
      },
      '100% ': {
        transform: 'translate3d(0px, 0, 0px)',
      },
    },

    animation: 'slideDown 35s linear infinite',
  }));
  return (
    (<Box mb={10} sx={{ overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, lg: 6 }} >
            <BannerContent />
          </Grid>
          {lgUp ? (
            <Grid size={{ xs: 12, lg: 6, md: 4 }}>
              <Box
                p={3.2}
                sx={{
                  backgroundColor: (theme) => theme.palette.primary.light,
                  minWidth: '2000px',
                  height: 'calc(100vh - 100px)',
                  maxHeight: '790px',
                }}
              >
                <Stack direction={'row'}>
                  <Box>
                    <SliderBox>
                      <img src={bannerbgImg1} alt="banner" />
                    </SliderBox>
                    <SliderBox>
                      <img src={bannerbgImg1} alt="banner" />
                    </SliderBox>
                  </Box>
                  <Box>
                    <SliderBox2>
                      <img src={bannerbgImg2} alt="banner" />
                    </SliderBox2>
                    <SliderBox2>
                      <img src={bannerbgImg2} alt="banner" />
                    </SliderBox2>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ) : null}
        </Grid>
      </Container>
    </Box>)
  );
};

export default Banner;
