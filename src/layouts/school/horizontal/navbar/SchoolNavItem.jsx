import React from 'react';
import { ListItemButton, ListItem, styled, ListItemText, useTheme } from '@mui/material';
import { Link } from 'react-router';

const SchoolNavItem = ({ item, level, pathDirect, onClick }) => {
  const Icon = item?.icon;
  const theme = useTheme();
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    display: 'block',
    userSelect: 'none',
  }));

  const ListItemButtonStyled = styled(ListItemButton)(() => ({
    padding: '8px 10px',
    borderRadius: `8px`,
    marginBottom: level > 1 ? '3px' : '0px',
    color: theme.palette.text.secondary,
    paddingLeft: '10px',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  }));

  return (
    <ListItemStyled>
      <ListItemButtonStyled
        component={Link}
        to={item.href}
        disabled={item.disabled}
        selected={pathDirect === item.href}
        target={item.external ? '_blank' : ''}
        onClick={onClick}
      >
        <ListItemText>{item.title}</ListItemText>
      </ListItemButtonStyled>
    </ListItemStyled>
  );
};

export default SchoolNavItem;