
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
    ListItemText
} from '@mui/material';
import { createColumnHelper } from '@tanstack/react-table';
import { IconDotsVertical, IconEdit, IconExchange, IconSchool, IconCalendar } from '@tabler/icons-react';
import StandardDataTable from 'src/components/shared/StandardDataTable';

const columnHelper = createColumnHelper();

const CommissionTable = ({ data, activeTab, onEditCommission, onChangeType }) => {
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
        return type === 'Subscription' ? '#FEF3C7' : '#FCE7F3';
    };

    const getCommissionTypeTextColor = (type) => {
        return type === 'Subscription' ? '#B45309' : '#BE185D';
    };

    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor('agentName', {
                header: 'Agent',
                cell: (info) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#F3F4F6', color: '#4B5563', fontWeight: 600, width: 32, height: 32, fontSize: '0.8rem' }}>
                            {info.getValue().split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{info.getValue()}</Typography>
                            <Typography variant="caption" color="textSecondary">{info.row.original.email}</Typography>
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
                            <IconSchool size={16} color="#4B5563" />
                            <Typography variant="body2">{info.getValue()}</Typography>
                        </Box>
                    )
                }),
                columnHelper.accessor('payoutDate', {
                    header: 'Payout Date',
                    cell: (info) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={16} color="#4B5563" />
                            <Typography variant="body2">{info.getValue()}</Typography>
                        </Box>
                    )
                }),
                columnHelper.accessor('earnings', {
                    header: 'Earnings',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{info.getValue()}</Typography>
                })
            );
        }

        if (activeTab === '2') {
            baseColumns.push(
                columnHelper.accessor('commissionPercentage', {
                    header: 'Commission %',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{info.getValue()}</Typography>
                }),
                columnHelper.accessor('status', {
                    header: 'Status',
                    cell: (info) => (
                        <Chip 
                            label={info.getValue()} 
                            size="small"
                            sx={{ 
                                bgcolor: info.getValue() === 'active' ? '#DCFCE7' : '#F3F4F6',
                                color: info.getValue() === 'active' ? '#166534' : '#4B5563',
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
                            <IconDotsVertical size={18} />
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
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{info.getValue()}</Typography>
                }),
                columnHelper.accessor('schools', {
                    header: 'Schools',
                    cell: (info) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconSchool size={16} color="#4B5563" />
                            <Typography variant="body2">{info.getValue()}</Typography>
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
                                bgcolor: info.getValue() === 'active' ? '#DCFCE7' : '#F3F4F6',
                                color: info.getValue() === 'active' ? '#166534' : '#4B5563',
                                fontWeight: 600,
                                borderRadius: '8px'
                            }} 
                        />
                    )
                }),
                columnHelper.accessor('earnings', {
                    header: 'Earnings',
                    cell: (info) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{info.getValue()}</Typography>
                })
            );
        }

        return baseColumns;
    }, [activeTab]);

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
                    sx: { width: 220, boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '12px' }
                }}
            >
                <MenuItem onClick={() => { onEditCommission(selectedItem); handleClose(); }}>
                    <ListItemIcon><IconEdit size={18} /></ListItemIcon>
                    <ListItemText primary="Edit Commission %" />
                </MenuItem>
                <MenuItem onClick={() => { onChangeType(selectedItem); handleClose(); }}>
                    <ListItemIcon><IconExchange size={18} /></ListItemIcon>
                    <ListItemText primary="Change Commission Type" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default CommissionTable;
