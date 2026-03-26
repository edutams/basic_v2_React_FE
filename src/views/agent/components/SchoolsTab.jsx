import React, { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Typography, Box, TableContainer, Button,
    IconButton, Menu, ListItemIcon, ListItemText, useTheme,
    MenuItem
} from '@mui/material';
import { IconGridDots, IconPlus, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

const SchoolsTab = ({ schools, onAddSchool }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 24, height: 24, bgcolor: '#2ca87f', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <IconGridDots size={16} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>List Of School</Typography>
                </Box>
               
                <Button
                                    variant="contained"
                                    startIcon={<IconPlus size={16} />}
                                    onClick={onAddSchool}
                                    sx={{ bgcolor: '#3949ab', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#303f9f' } }}
                                >
                                    Add New School
                                </Button>
            </Box>

            {/* Table */}
            <TableContainer sx={{ bgcolor: 'transparent' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>School Name</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Contact Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Agent</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Plan (Population)</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.secondary }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schools.map((row, idx) => (
                            <TableRow key={idx} hover>
                                <TableCell sx={{ color: theme.palette.text.primary }}>{idx + 1}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Avatar sx={{ width: 40, height: 40 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.school}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.contact}</Typography>
                                    <Typography variant="caption" color="textSecondary">{row.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Avatar sx={{ width: 32, height: 32 }} />
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: '10px', color: theme.palette.text.primary }}>{row.agent}</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentEmail}</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentContact}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.plan}</Typography>
                                        <Chip label={row.population} size="small" sx={{ bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#EAFDF6', color: isDarkMode ? '#4ade80' : '#10B981', fontWeight: 700, borderRadius: '4px' }} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.status}
                                        size="small"
                                        sx={{
                                            bgcolor: row.status === 'Active' ? (isDarkMode ? 'rgba(34,197,94,0.2)' : '#DCFCE7') : (isDarkMode ? 'rgba(239,68,68,0.2)' : '#FFE4E6'),
                                            color: row.status === 'Active' ? (isDarkMode ? '#4ade80' : '#166534') : (isDarkMode ? '#f87171' : '#e11d48'),
                                            fontWeight: 700,
                                            borderRadius: '4px',
                                            minWidth: 70
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                        <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {schools.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    No schools found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[3],
                        minWidth: 150,
                        '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: isDarkMode ? theme.palette.action.hover : '#F8FAFC', color: theme.palette.primary.main }
                        }
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><IconEye size={18} /></ListItemIcon>
                    <ListItemText primary="View Detail" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                    <ListItemText primary="Edit Record" />
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: `${theme.palette.error.main} !important` }}>
                    <ListItemIcon sx={{ color: theme.palette.error.main }}><IconTrash size={18} /></ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default SchoolsTab;
