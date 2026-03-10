
import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const PrimaryButton = ({ children, sx = {}, ...props }) => {
    return (
        <Button
            variant="contained"
            sx={{
                bgcolor: '#F59E0B', // Standard hex for the premium yellow
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                    bgcolor: '#D97706',
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
};

export default PrimaryButton;
