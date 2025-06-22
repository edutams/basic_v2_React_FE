import React from 'react';
import { Grid, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { NavLink } from 'react-router';
import PropTypes from 'prop-types';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumb = ({ subtitle, items, title, children }) => (
  <Grid
    container mb={6} alignItems='center' justifyContent="space-between"
  >
    <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
      <Typography color="textSecondary" fontWeight="400" variant="h4">
        {subtitle}
      </Typography>
      <Typography
        fontWeight="700"
        variant="h1"
        sx={{
          lineHeight: '1.235',
        }}
      >
        {title}
      </Typography>
    </Grid>

    <Grid
      size={{ xs: 12, md: 6 }}
      order={{ xs: 1, md: 2 }}
      display="flex"
      flexDirection="column"
      alignItems={{ xs: 'flex-start', md: 'flex-end' }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: { xs: 2, md: 0 } }}
      >
        {items
          ? items.map((item) => (
            <div key={item.title}>
              {item.to ? (
                <Link underline="none" color="inherit" component={NavLink} to={item.to}>
                  {item.title}
                </Link>
              ) : (
                <Typography color="textPrimary">{item.title}</Typography>
              )}
            </div>
          ))
          : ''}
      </Breadcrumbs>

      {children && (
        <Box
          gap={1}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            width: '100%',
            mt: 1
          }}
        >
          {children}
        </Box>
      )}
    </Grid>
  </Grid>
);

Breadcrumb.propTypes = {
  subtitle: PropTypes.string,
  items: PropTypes.array,
  title: PropTypes.string,
  children: PropTypes.node,
};

export default Breadcrumb;
