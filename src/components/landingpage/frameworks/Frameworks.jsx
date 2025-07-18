import React from 'react';
import { Box, Container, Stack, styled } from '@mui/material';
import FrameworksTitle from './FrameworksTitle';

// images

import sliderImg from 'src/assets/images/landingpage/ang-flexy-landscape-img.png';

const SliderBox = styled(Box)(() => ({
  '@keyframes slide': {
    '0%': {
      transform: 'translate3d(0, 0, 0)',
    },
    '100% ': {
      transform: 'translate3d(-100%, 0, 0)',
    },
  },
  animation: 'slide 45s linear infinite',
}));

const Frameworks = () => {
  return (
    <Box
      bgcolor="action.hover"
      sx={{
        py: {
          xs: '70px',
          lg: '120px',
        },
      }}
    >
      <Container maxWidth="lg">
        {/* Title */}
        <FrameworksTitle />
      </Container>
      <Stack overflow="hidden" mt={6} direction={'row'}>
        <Box pr={3}>
          <SliderBox>
            <img src={sliderImg} alt="slide" height={'100%'} />
          </SliderBox>
        </Box>
        <Box>
          <SliderBox>
            <img src={sliderImg} alt="slide" height={'100%'} />
          </SliderBox>
        </Box>
      </Stack>
    </Box>
  );
};

export default Frameworks;
