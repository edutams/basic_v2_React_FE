import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    Stack,
    Divider,
    useTheme
} from '@mui/material';
import { IconX } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const StandardModal = ({
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    showCloseButton = true,
    icon: Icon,
    dividers = true,
    padding = 3,
    sx = {},
    headerBg = 'transparent',
    ...dialogProps
}) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            PaperProps={{
              sx: { 
                borderRadius: '12px', 
                bgcolor: theme.palette.background.paper,
                backgroundImage: 'none', // Remove MUI default overlay in dark mode
                ...sx 
              }
            }}
            {...dialogProps}
        >
            {(title || showCloseButton) && (
                <DialogTitle sx={{ 
                    m: 0, 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    bgcolor: headerBg === 'transparent' ? 'transparent' : (isDarkMode ? theme.palette.background.default : headerBg),
                    borderBottom: dividers && !title ? `1px solid ${theme.palette.divider}` : 'none'
                }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {Icon && <Icon size={24} color={theme.palette.text.secondary} />}
                        {title && (
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                {title}
                            </Typography>
                        )}
                    </Stack>
                    {showCloseButton && (
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    bgcolor: theme.palette.action.hover
                                }
                            }}
                        >
                            <IconX size={20} />
                        </IconButton>
                    )}
                </DialogTitle>
            )}
            
            <DialogContent 
                dividers={dividers} 
                sx={{ 
                    p: padding,
                    color: theme.palette.text.primary
                }}
            >
                {children}
            </DialogContent>

            {actions && (
                <DialogActions sx={{ p: 2, px: 3, borderTop: dividers ? `1px solid ${theme.palette.divider}` : 'none' }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

StandardModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    actions: PropTypes.node,
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
    fullWidth: PropTypes.bool,
    showCloseButton: PropTypes.bool,
    icon: PropTypes.elementType,
    dividers: PropTypes.bool,
    padding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sx: PropTypes.object,
    headerBg: PropTypes.string,
};

export default StandardModal;
