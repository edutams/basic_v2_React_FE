import { Avatar, Box, Typography, Grid, Stack } from '@mui/material';
import * as dropdownData from './data';
import { Link } from 'react-router';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';

const AppLinks = () => {
  return (
    (<Grid container spacing={3} mb={3}>
      {dropdownData.appsLink.map((links, index) => (
        <Grid
          key={index}
          size={{
            lg: 6
          }}>
          <Link to={links.href} className="hover-text-primary">
            <Stack direction="row" spacing={2}>
              <Box
                minWidth="45px"
                height="45px"
                bgcolor="grey.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Avatar
                  src={links.avatar}
                  alt={links.avatar}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  color="textPrimary"
                  noWrap
                  className="text-hover"
                  sx={{
                    width: '240px',
                  }}
                >
                  {links.title}
                </Typography>
                <Typography
                  color="textSecondary"
                  variant="subtitle2"
                  fontSize="12px"
                  sx={{
                    width: '240px',
                  }}
                  noWrap
                >
                  {links.subtext}
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Grid>
      ))}
    </Grid>)
  );
};

export default AppLinks;
