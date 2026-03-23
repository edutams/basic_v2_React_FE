import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Typography, Box, TableContainer, Select, MenuItem, Button,
    IconButton, Menu, ListItemIcon, ListItemText, useTheme
} from '@mui/material';
import { IconGridDots, IconUserPlus, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

const TeamTab = ({ team, onAddAgent }) => {
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
        <Box mt={3}>
            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.background.paper }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <IconGridDots size={20} color={theme.palette.primary.main} />
                        <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>List of Agents</Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Select value="Level" size="small" sx={{ borderRadius: '8px', minWidth: 150 }}>
                            <MenuItem value="Level">Level</MenuItem>
                        </Select>
                        <Button
                            variant="contained"
                            onClick={onAddAgent}
                            startIcon={<IconUserPlus size={18} />}
                            sx={{ bgcolor: '#3B82F6', textTransform: 'none', borderRadius: '8px' }}
                        >
                            Add New Agent
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#EAFDF6' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>S/N</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Agent Details</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Transaction</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Performance</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Level</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Descendent</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: theme.palette.text.primary }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {team.map((row, idx) => (
                                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: isDarkMode ? theme.palette.background.default : '#F8FAFC' } }}>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>{idx + 1}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 40, height: 40 }} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{row.name}</Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">{row.handle}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight={700} sx={{ color: theme.palette.text.primary }}># {row.transaction}</Typography></TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ margin: 'auto', width: 'fit-content' }}>
                                            <Typography variant="caption" color="textSecondary">School</Typography>
                                            <Chip label={row.performance} size="small" sx={{ bgcolor: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : '#EAFDF6', color: isDarkMode ? '#4ade80' : '#10B981', fontWeight: 700, borderRadius: '4px' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ bgcolor: isDarkMode ? 'rgba(250, 204, 21, 0.2)' : '#FEF9C3', color: isDarkMode ? '#fde047' : '#854D0E', borderRadius: '4px', textAlign: 'center', width: 40, py: 0.5, fontSize: '12px' }}>
                                            {row.level}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" color="error" fontWeight={700} align="center">{row.descendent}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            size="small"
                                            sx={{
                                                bgcolor: row.status === 'Active' ? (isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7') : (isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2'),
                                                color: row.status === 'Active' ? (isDarkMode ? '#4ade80' : '#166534') : (isDarkMode ? '#ef4444' : '#991B1B'),
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
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

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

export default TeamTab;
