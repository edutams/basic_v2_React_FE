import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, InputAdornment, Paper, ClickAwayListener } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

const ColorSchemeSelector = ({ formik }) => {
    const [open, setOpen] = useState(false);
    const value = formik.values.primaryColor || '';
    const displayValue = value.startsWith('#') ? value.slice(1) : value;

    const handleHexInput = (e) => {
        let raw = e.target.value.slice(0, 6);
        formik.setFieldValue('primaryColor', raw ? `#${raw}` : '');
    };

    const handlePickerChange = (color) => {
        formik.setFieldValue('primaryColor', color);
    };

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box sx={{ position: 'relative' }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Primary Color"
                        value={displayValue.toUpperCase()}
                        onChange={handleHexInput}
                        onFocus={() => setOpen(true)}
                        placeholder="e.g. 3949AB"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box
                                        onClick={() => setOpen(true)}
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: '4px',
                                            bgcolor: value.length >= 4 ? value : '#e0e0e0',
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>#</Typography>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '13px' } }}
                    />

                    {open && (
                        <Paper
                            elevation={8}
                            sx={{
                                position: 'absolute',
                                zIndex: 1400,
                                top: 'calc(100% + 8px)',
                                left: 0,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                p: 1.5,
                                bgcolor: '#1e1e1e',
                                '& .react-colorful': { width: '100%', height: '220px' },
                                '& .react-colorful__saturation': { borderRadius: '8px 8px 0 0' },
                                '& .react-colorful__hue': { height: '14px', borderRadius: '8px', mt: '10px' },
                                '& .react-colorful__pointer': { width: '20px', height: '20px', borderWidth: '3px' },
                            }}
                        >
                            <HexColorPicker
                                color={value.length >= 4 ? value : '#3949ab'}
                                onChange={handlePickerChange}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, px: 0.5 }}>
                                <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6 }}>
                                    <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
                                        Hex
                                    </Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#2d2d2d', borderRadius: '6px', px: 1.5, py: 0.6, flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}>
                                        {displayValue.toUpperCase() || '------'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Box>
            </ClickAwayListener>
    );
};

export default ColorSchemeSelector;
