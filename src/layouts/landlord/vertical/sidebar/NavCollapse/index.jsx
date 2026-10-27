// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useContext, useEffect, useRef } from 'react';

import { useState } from 'react';

import { useLocation } from 'react-router-dom';

// mui imports
import {
  ListItemIcon,
  ListItemButton,
  Collapse,
  styled,
  ListItemText,
  useTheme,
} from '@mui/material';

// custom imports
import NavItem from '../NavItem';

// plugins
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CustomizerContext } from 'src/context/CustomizerContext';

// FC Component For Dropdown Menu
const NavCollapse = ({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick,
  controlledOpen,
  onToggleOpen,
}) => {
  const { isBorderRadius } = useContext(CustomizerContext);

  const Icon = menu?.icon;
  const theme = useTheme();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  // Controlled only when the parent passes a boolean (e.g. the top-level
  // sidebar module list, so only one module stays open at a time);
  // uncontrolled sub-levels keep their own independent open state exactly
  // as before.
  const isControlled = typeof controlledOpen === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(true);
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const collapseRef = useRef(null);
  const menuIcon =
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={2.5} size="1.3rem" />;

  const handleClick = () => {
    if (isControlled) {
      onToggleOpen?.();
    } else {
      setUncontrolledOpen((prev) => !prev);
    }
  };

  // menu collapse for sub-levels — only owns this when uncontrolled; the
  // parent handles route-driven open state itself in controlled mode.
  React.useEffect(() => {
    if (isControlled) return;
    setUncontrolledOpen(false);
    menu?.children?.forEach((item) => {
      if (item?.href === pathname) {
        setUncontrolledOpen(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children, isControlled]);

  // A module opening near the bottom of the sidebar's fixed-height scroll
  // area previously left its newly-revealed children below the fold with
  // nothing to indicate they existed — scroll them into view once the
  // expand transition has had time to run.
  useEffect(() => {
    if (!open || !collapseRef.current) return;
    const timer = setTimeout(() => {
      collapseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: '2px',
    padding: '6px 9px',
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    backgroundColor: open && level < 2 ? theme.palette.primary.main : '',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor:
        pathname.includes(menu.href) || open
          ? theme.palette.primary.main
          : theme.palette.primary.light,
      color: pathname.includes(menu.href) || open ? theme.palette.primary.contrastText : theme.palette.primary.main,
    },
    color:
      open && level < 2
        ? theme.palette.primary.contrastText
        : level > 1 && open
          ? theme.palette.primary.main
          : theme.palette.text.primary,
    borderRadius: `${isBorderRadius}px`,
  }));

  // If Menu has Children
  const submenus = menu.children?.map((item) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item?.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    }
  });

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={pathWithoutLastPart === menu.href}
        key={menu?.id}
        button="true"
        component="li"
      >
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color: 'inherit',
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit">{hideMenu ? '' : <>{t(`${menu.title}`)}</>}</ListItemText>
        {!open ? <IconChevronDown size="1rem" /> : <IconChevronUp size="1rem" />}
      </ListItemStyled>
      <Collapse ref={collapseRef} in={open} timeout="auto" unmountOnExit>
        {submenus}
      </Collapse>
    </>
  );
};

export default NavCollapse;
