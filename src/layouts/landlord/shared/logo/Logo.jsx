import { useContext } from 'react';

import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from 'src/assets/images/logos/logo-dark.svg';
import { ReactComponent as LogoDarkRTL } from 'src/assets/images/logos/rtl-logo-dark.svg';
import { ReactComponent as LogoLight } from 'src/assets/images/logos/logo-white.svg';
import { ReactComponent as LogoLightRTL } from 'src/assets/images/logos/rtl-logo-white.svg';
import { styled, Box, Typography } from '@mui/material';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';

import EduTAMSLogoDark from '@/assets/images/logos/EduTAMS.jpeg';
import EduTAMSLogoLight from '@/assets/images/logos/EduTams2.png';

const Logo = () => {
  const { isCollapse, isSidebarHover, activeMode } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;

  // EduTAMS.jpeg is the full-color (green/black) wordmark, legible on the
  // light sidebar background. EduTams2.png is a white/cream wordmark meant
  // for dark backgrounds — it was previously used unconditionally, which
  // made it read as a blank white box against the light sidebar.
  const EduTAMSLogo = activeMode === 'dark' ? EduTAMSLogoLight : EduTAMSLogoDark;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse === 'mini-sidebar' && !isSidebarHover ? '40px' : 'auto',
    maxWidth: '100%',
    marginLeft: isCollapse === 'mini-sidebar' && !isSidebarHover ? '6px' : '0',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  }));

  const isMini = isCollapse === 'mini-sidebar' && !isSidebarHover;

  return (
    <LinkStyled to="/">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={EduTAMSLogo}
          alt="EduTAMS Logo"
          style={{
            height: isMini ? '32px' : '42px',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Box>
    </LinkStyled>
  );
};

export default Logo;
