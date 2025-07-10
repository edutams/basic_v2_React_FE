import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavLink } from 'react-router';
import PropTypes from 'prop-types';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumb = ({ subtitle, items, title, children }) => (
  <Box
    mb={3}
    display="flex"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
    flexWrap="wrap"
    gap={2}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        flex: 1,
      }}
    >
      {subtitle && (
        <Typography
          color="textSecondary"
          fontWeight="400"
          variant="subtitle2"
          sx={{
            fontSize: { xs: '0.9rem', md: '1.1rem' },
            mb: 0.5,
            textAlign: 'left',
          }}
        >
          {subtitle}
        </Typography>
      )}
      <Typography
        fontWeight="700"
        variant="h5"
        sx={{
          fontSize: { xs: '1rem', md: '1.5rem' },
          lineHeight: 1.2,
          textAlign: 'left',
        }}
      >
        {title}
      </Typography>
    </Box>

    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'flex-end', md: 'flex-end' },
        minWidth: 0,
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          mb: { xs: children ? 1 : 0, md: 0 },
          fontSize: { xs: '0.9rem', md: '1rem' },
        }}
      >
        {items &&
          items.map((item) => (
            <div key={item.title}>
              {item.to ? (
                <Link underline="none" color="inherit" component={NavLink} to={item.to}>
                  {item.title}
                </Link>
              ) : (
                <Typography color="textPrimary">{item.title}</Typography>
              )}
            </div>
          ))}
      </Breadcrumbs>
      {children && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            mt: 0.5,
            gap: 1,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  </Box>
);

Breadcrumb.propTypes = {
  subtitle: PropTypes.string,
  items: PropTypes.array,
  title: PropTypes.string,
  children: PropTypes.node,
};

export default Breadcrumb;
