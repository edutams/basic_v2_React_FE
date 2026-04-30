import React from 'react';
import { Button, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const DEFAULT_PRIMARY_BG = '#FEC120';
const DEFAULT_PRIMARY_HOVER = '#EAB308';

/**
 * Darken a hex color by a given amount (0-1).
 */
const darkenColor = (hex, amount = 0.15) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  const r = Math.max(0, Math.round(parseInt(result[1], 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(result[2], 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(result[3], 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const PrimaryButton = ({ children, sx = {}, variant = 'primary', ...props }) => {
    const theme = useTheme();
    const isPrimary = variant === 'primary';
    const isDarkMode = theme.palette.mode === 'dark';

    // Use theme primary color if customized (from organization), otherwise default gold
    const primaryBg = theme.palette.primary?.main || DEFAULT_PRIMARY_BG;
    const primaryHover = darkenColor(primaryBg, 0.12);

    // Determine text color based on the primary color's luminance
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(primaryBg);
    const isBgDark = rgb ? (parseInt(rgb[1], 16) * 299 + parseInt(rgb[2], 16) * 587 + parseInt(rgb[3], 16) * 114) / 1000 < 128 : false;
    const textColor = isPrimary
        ? (isBgDark ? '#ffffff' : '#1E293B')
        : (isDarkMode ? 'white' : '#1E293B');

    return (
        <Button
            variant={isPrimary ? "contained" : "outlined"}
            sx={{
                bgcolor: isPrimary
                    ? primaryBg
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'white'),

                color: textColor,

                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                py: 1.2,
                borderRadius: '12px',
                fontSize: '14px',

                border: isPrimary
                    ? 'none'
                    : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0'}`,

                boxShadow: isPrimary
                    ? '0px 2px 4px rgba(0, 0, 0, 0.05)'
                    : 'none',

                transition: 'all 0.2s ease-in-out',

                '&:hover': {
                    bgcolor: isPrimary
                        ? primaryHover
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC'),

                    border: isPrimary
                        ? 'none'
                        : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#CBD5E1'}`,

                    color: textColor,

                    boxShadow: isPrimary
                        ? '0px 4px 6px rgba(0, 0, 0, 0.1)'
                        : 'none',
                },

                '&:active': {
                    color: textColor,
                },

                '&:focus': {
                    color: textColor,
                },

                '&.Mui-disabled': {
                    bgcolor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.05)'
                        : '#F1F5F9',

                    color: isDarkMode
                        ? 'rgba(255, 255, 255, 0.3)'
                        : '#94A3B8',

                    border: 'none',
                },

                ...sx
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

PrimaryButton.propTypes = {
    children: PropTypes.node.isRequired,
    sx: PropTypes.object,
    variant: PropTypes.oneOf(['primary', 'secondary']),
};

export default PrimaryButton;