
import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const PrimaryButton = ({ children, sx = {}, variant = 'primary', ...props }) => {
    const isPrimary = variant === 'primary';
    
    return (
        <Button
            variant={isPrimary ? "contained" : "outlined"}
            sx={{
                bgcolor: isPrimary ? '#FEC120' : 'white',
                color: '#1E293B',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                py: 1.2,
                borderRadius: '12px',
                border: isPrimary ? 'none' : '1px solid #E2E8F0',
                fontSize: '14px',
                boxShadow: isPrimary ? '0px 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
                '&:hover': {
                    bgcolor: isPrimary ? '#EAB308' : '#F8FAFC',
                    border: isPrimary ? 'none' : '1px solid #CBD5E1',
                    boxShadow: isPrimary ? '0px 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
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
