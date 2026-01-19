import React from 'react';
import { Box, List, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router';
import SchoolMenuItems from '../../vertical/sidebar/SchoolMenuItems';
import SchoolNavItem from './SchoolNavItem';
import SchoolNavCollapse from './SchoolNavCollapse';

const SchoolNavListing = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  return (
    <Box>
      <List sx={{ p: 0, display: 'flex', gap: 1, zIndex: '99' }}>
        {SchoolMenuItems.map((item) => {
          if (item.subheader) {
            return null;
          } else if (item.children) {
            return (
              <SchoolNavCollapse
                menu={item}
                pathDirect={pathDirect}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
              />
            );
          } else {
            return (
              <SchoolNavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SchoolNavListing;