import React from 'react';
import {
  ListItemButton,
  ListItem,
  styled,
  ListItemText,
  useTheme,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';
import SchoolNavItem from './SchoolNavItem';

const SchoolNavCollapse = ({ menu, level, pathWithoutLastPart, pathDirect, onClick }) => {
  const Icon = menu?.icon;
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    <>
      <ListItemStyled>
        <ListItemButtonStyled
          onClick={handleClick}
          selected={pathWithoutLastPart === menu.href}
        >
          <ListItemText color="inherit">{menu.title}</ListItemText>
          {menu.chip ? (
            <Chip
              color={menu.chipColor}
              variant={menu.variant ? menu.variant : 'filled'}
              size="small"
              label={menu.chip}
            />
          ) : null}
          <IconChevronDown size="1rem" />
        </ListItemButtonStyled>
      </ListItemStyled>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {menu.children?.map((item) => (
          <MenuItem key={item.id} onClick={handleClose}>
            <SchoolNavItem
              item={item}
              level={level + 1}
              pathDirect={pathDirect}
              onClick={onClick}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SchoolNavCollapse;