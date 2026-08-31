import { useContext } from 'react';

import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from 'src/assets/images/logos/logo-dark.svg';
import { ReactComponent as LogoDarkRTL } from 'src/assets/images/logos/rtl-logo-dark.svg';
import { ReactComponent as LogoLight } from 'src/assets/images/logos/logo-white.svg';
import { ReactComponent as LogoLightRTL } from 'src/assets/images/logos/rtl-logo-white.svg';
import { styled, Box, Typography } from '@mui/material';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';

import EduTAMSLogo from '@/assets/images/logos/EduTAMS2.png';

const Logo = () => {
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;

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
