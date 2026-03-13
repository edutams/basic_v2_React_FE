import React, { useMemo } from 'react';
import {
    Avatar,
    Typography,
    Box,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useTheme
} from '@mui/material';
import { createColumnHelper } from '@tanstack/react-table';
import { IconDotsVertical, IconEdit, IconExchange, IconSchool, IconCalendar } from '@tabler/icons-react';
import StandardDataTable from 'src/components/shared/StandardDataTable';

const columnHelper = createColumnHelper();

const CommissionTable = ({ data, activeTab, onEditCommission, onChangeType }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedItem, setSelectedItem] = React.useState(null);

    const handleClick = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const getCommissionTypeColor = (type) => {
        return type === 'Subscription' 
            ? (isDarkMode ? 'rgba(250, 204, 21, 0.2)' : '#FEF3C7') 
            : (isDarkMode ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3');
    };

    const getCommissionTypeTextColor = (type) => {
        return type === 'Subscription' 
            ? (isDarkMode ? '#fde047' : '#B45309') 
            : (isDarkMode ? '#f472b6' : '#BE185D');
    };

    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor('agentName', {
                header: 'Agent',
                cell: (info) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: isDarkMode ? theme.palette.action.hover : '#F3F4F6', color: theme.palette.text.secondary, fontWeight: 600, width: 32, height: 32, fontSize: '0.8rem' }}>
                            {info.getValue().split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{info.row.original.email}</Typography>
                        </Box>
                    </Box>
                )
            }),
        ];

        if (activeTab !== '3' && activeTab !== '4') {
            baseColumns.push(
                columnHelper.accessor('commissionType', {
                    header: 'Commission Type',
                    cell: (info) => (
                        <Chip 
                            label={info.getValue()} 
                            size="small"
                            sx={{ 
                                bgcolor: getCommissionTypeColor(info.getValue()),
                                color: getCommissionTypeTextColor(info.getValue()),
                                fontWeight: 600,
                                borderRadius: '8px',
                                fontSize: '0.75rem'
                            }} 
                        />
                    )
                })
            );
        }

        if (activeTab === '1') {
            baseColumns.push(
                columnHelper.accessor('schools', {
                    header: 'Schools',
                    cell: (info) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconSchool size={16} color={theme.palette.text.secondary} />
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                        </Box>
                    )
                }),
                columnHelper.accessor('payoutDate', {
                    header: 'Payout Date',
                    cell: (info) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={16} color={theme.palette.text.secondary} />
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                        </Box>
                    )
                }),
                columnHelper.accessor('earnings', {
                    header: 'Earnings',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                })
            );
        }

        if (activeTab === '2') {
            baseColumns.push(
                columnHelper.accessor('commissionPercentage', {
                    header: 'Commission %',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                }),
                columnHelper.accessor('status', {
                    header: 'Status',
                    cell: (info) => (
                        <Chip 
                            label={info.getValue()} 
                            size="small"
                            sx={{ 
                                bgcolor: info.getValue() === 'active' ? (isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7') : (isDarkMode ? theme.palette.action.hover : '#F3F4F6'),
                                color: info.getValue() === 'active' ? (isDarkMode ? '#4ade80' : '#166534') : theme.palette.text.secondary,
                                fontWeight: 600,
                                borderRadius: '8px',
                                fontSize: '0.75rem'
                            }} 
                        />
                    )
                }),
                columnHelper.display({
                    id: 'actions',
                    header: 'Actions',
                    cell: (info) => (
                        <IconButton size="small" onClick={(e) => handleClick(e, info.row.original)}>
                            <IconDotsVertical size={18} color={theme.palette.text.secondary} />
                        </IconButton>
                    ),
                    meta: { align: 'right' }
                })
            );
        }

        if (activeTab === '3' || activeTab === '4') {
            baseColumns.push(
                columnHelper.accessor('commissionPercentage', {
                    header: 'Commission %',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                }),
                columnHelper.accessor('schools', {
                    header: 'Schools',
                    cell: (info) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconSchool size={16} color={theme.palette.text.secondary} />
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                        </Box>
                    )
                }),
                columnHelper.accessor('status', {
                    header: 'Status',
                    cell: (info) => (
                        <Chip 
                            label={info.getValue()} 
                            size="small"
                            sx={{ 
                                bgcolor: info.getValue() === 'active' ? (isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7') : (isDarkMode ? theme.palette.action.hover : '#F3F4F6'),
                                color: info.getValue() === 'active' ? (isDarkMode ? '#4ade80' : '#166534') : theme.palette.text.secondary,
                                fontWeight: 600,
                                borderRadius: '8px'
                            }} 
                        />
                    )
                }),
                columnHelper.accessor('earnings', {
                    header: 'Earnings',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{info.getValue()}</Typography>
                })
            );
        }

        return baseColumns;
    }, [activeTab, isDarkMode, theme]);

    return (
        <Box>
            <StandardDataTable 
                columns={columns} 
                data={data} 
                pageSize={5}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 220, bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[3], borderRadius: '12px' }
                }}
            >
                <MenuItem onClick={() => { onEditCommission(selectedItem); handleClose(); }}>
                    <ListItemIcon><IconEdit size={18} color={theme.palette.text.secondary} /></ListItemIcon>
                    <ListItemText primary="Edit Commission %" sx={{ color: theme.palette.text.secondary }} />
                </MenuItem>
                <MenuItem onClick={() => { onChangeType(selectedItem); handleClose(); }}>
                    <ListItemIcon><IconExchange size={18} color={theme.palette.text.secondary} /></ListItemIcon>
                    <ListItemText primary="Change Commission Type" sx={{ color: theme.palette.text.secondary }} />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default CommissionTable;
