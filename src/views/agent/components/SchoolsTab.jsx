import React, { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, Typography, Box, Paper, TableContainer, Select, MenuItem, Button,
    IconButton, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import { IconGridDots, IconPlus, IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';

import { useNavigate } from 'react-router';

const SchoolsTab = ({ schools, onAddSchool }) => {
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
                         <Typography variant="h6" fontWeight={700}>List Of School</Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <Button 
                            variant="contained" 
                            onClick={onAddSchool}
                            startIcon={<IconPlus size={18} />} 
                            sx={{ bgcolor: '#3B82F6', textTransform: 'none', borderRadius: '8px' }}
                        >
                            Add New School
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#EAFDF6' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>S/N</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>School Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Contact Details</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Agent</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Plan (Population )</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {schools.map((row, idx) => (
                                <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 40, height: 40 }} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{row.school}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={700}>{row.contact}</Typography>
                                        <Typography variant="caption" color="textSecondary">{row.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 32, height: 32 }} />
                                            <Box>
                                                <Typography variant="caption" fontWeight={700} display="block" sx={{ fontSize: '10px' }}>{row.agent}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentEmail}</Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '9px' }}>{row.agentContact}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="caption" fontWeight={700}>{row.plan}</Typography>
                                            <Chip label={row.population} size="small" sx={{ bgcolor: '#EAFDF6', color: '#10B981', fontWeight: 700, borderRadius: '4px' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: '#DCFCE7', 
                                                color: '#166534',
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

export default SchoolsTab;
