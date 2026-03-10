import React from 'react';
import { Button, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const PrimaryButton = ({ children, sx = {}, variant = 'primary', ...props }) => {
    const theme = useTheme();
    const isPrimary = variant === 'primary';
    const isDarkMode = theme.palette.mode === 'dark';
    
    return (
        <Button
            variant={isPrimary ? "contained" : "outlined"}
            sx={{
                bgcolor: isPrimary 
                    ? '#FEC120' 
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'white'),
                color: isPrimary ? '#1E293B' : (isDarkMode ? 'white' : '#1E293B'),
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                py: 1.2,
                borderRadius: '12px',
                border: isPrimary ? 'none' : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0'}`,
                fontSize: '14px',
                boxShadow: isPrimary ? '0px 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    bgcolor: isPrimary 
                        ? '#EAB308' 
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC'),
                    border: isPrimary ? 'none' : `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#CBD5E1'}`,
                    boxShadow: isPrimary ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                },
                '&.Mui-disabled': {
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : '#94A3B8',
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
