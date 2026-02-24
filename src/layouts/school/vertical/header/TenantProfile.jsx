import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTenantAuth } from '../../../../hooks/useTenantAuth';
import { useNotification } from '../../../../hooks/useNotification';
import user1 from '../../../../assets/images/users/1.jpg';

import {
  IconChevronDown,
  IconCurrencyDollar,
  IconMail,
  IconLogout,
} from '@tabler/icons-react';

const TenantProfile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { user, logout } = useTenantAuth();
  console.log('TenantProfile user:', user);

  const navigate = useNavigate();
  const notify = useNotification();

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        notify.success('Logged out successfully', 'Goodbye!');
        navigate('/login');
      } else {
        notify.error('Logout failed', 'Error');
      }
    } catch (error) {
      notify.error('An error occurred during logout', 'Error');
    }
    handleClose2();
  };

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = theme.palette.primary.light;

  /*profile data*/
  const profiledata = [
    {
      to: '/pages/account-settings',
      title: 'My Profile',
      subtitle: 'Account Settings',
      icon: <IconCurrencyDollar width="20" height="20" />,
      color: primary,
      lightcolor: primarylight,
    },
  ];

  // Get user display name and email
  // Tenant user structure might be directly the object or nested under .user
  const displayUser = user?.user || user;
  const displayName = displayUser?.name || 'Guest User';
  const firstName = displayName.split(' ')[0];
  const userEmail = displayUser?.email || 'user@example.com';
  const userAvatar = displayUser?.image || user1;

  return (
    <Box display="flex" gap={1}>
      {lgUp ? <Divider orientation="vertical" variant="middle" /> : null}

      <Button
        size="large"
        aria-label="menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            borderRadius: '9px',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={userAvatar}
          alt={'ProfileImg'}
          sx={{
            width: 30,
            height: 30,
          }}
        />
        <Box
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
            alignItems: 'center',
          }}
        >
          <Typography color="textprimary" variant="h5" fontWeight="400" sx={{ ml: 1 }}>
            Hi,
          </Typography>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              ml: 1,
            }}
          >
            {firstName}
          </Typography>
          <IconChevronDown width="20" height="20" />
        </Box>
      </Button>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
            pb: 2,
          },
        }}
      >
        <Typography variant="h4">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar src={userAvatar} alt={'ProfileImg'} sx={{ width: 95, height: 95 }} />
          <Box>
            <Typography variant="h4" fontWeight={500} color="textPrimary">
              {displayName}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width="18" height="18" />
              {userEmail}
            </Typography>
          </Box>
        </Stack>
        <Divider />

        {profiledata.map((prf) => (
          <Box key={prf.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link to={prf.to}>
                <Stack direction="row" spacing={2}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                    sx={{
                      bgcolor: prf.lightcolor,
                      color: prf.color,
                      boxShadow: 'none',
                      minWidth: '50px',
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                    }}
                  >
                    {prf.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      className="text-hover"
                      color="textPrimary"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {prf.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="h6"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {prf.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))}

        <Box mt={2}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleLogout}
            startIcon={<IconLogout width="18" height="18" />}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default TenantProfile;
