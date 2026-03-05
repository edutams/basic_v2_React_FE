import React, { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Typography, Box, Paper, TableContainer, Select, MenuItem, Button,
    IconButton, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { IconGridDots, IconUserPlus, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

import { useNavigate } from 'react-router';

const TeamTab = ({ team }) => {
    const navigate = useNavigate();
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
            <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                         <IconGridDots size={20} color="#00ACFF" />
                         <Typography variant="h6" fontWeight={700}>List of Agents</Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Select value="Level" size="small" sx={{ borderRadius: '8px', minWidth: 150 }}>
                            <MenuItem value="Level">Level</MenuItem>
                        </Select>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/agent')}
                            startIcon={<IconUserPlus size={18} />} 
                            sx={{ bgcolor: '#3B82F6', textTransform: 'none', borderRadius: '8px' }}
                        >
                            Add New Agent
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#EAFDF6' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>S/N</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Agent Details</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Transaction</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Performance</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Level</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Descendent</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {team.map((row, idx) => (
                                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 40, height: 40 }} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{row.name}</Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">{row.handle}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight={700}># {row.transaction}</Typography></TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="caption" color="textSecondary">School</Typography>
                                            <Chip label={row.performance} size="small" sx={{ bgcolor: '#EAFDF6', color: '#10B981', fontWeight: 700, borderRadius: '4px' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ bgcolor: '#FEF9C3', color: '#854D0E', borderRadius: '4px', textAlign: 'center', width: 40, py: 0.5, fontSize: '12px' }}>
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
                                                bgcolor: row.status === 'Active' ? '#DCFCE7' : '#FEE2E2', 
                                                color: row.status === 'Active' ? '#166534' : '#991B1B',
                                                fontWeight: 700,
                                                borderRadius: '4px',
                                                minWidth: 70
                                            }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={(e) => handleMenuClick(e, row)}>
                                            <IconDotsVertical size={18} color="#64748B" />
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
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        minWidth: 150,
                        '& .MuiMenuItem-root': {
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#475569',
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: '#F8FAFC', color: '#00B4FF' }
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
                <MenuItem onClick={handleMenuClose} sx={{ color: '#EF4444 !important' }}>
                    <ListItemIcon sx={{ color: '#EF4444' }}><IconTrash size={18} /></ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default TeamTab;
