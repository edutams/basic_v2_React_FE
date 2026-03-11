import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Card,
    useTheme
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import StandardDataTable from 'src/components/shared/StandardDataTable';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconDownload } from '@tabler/icons-react';

const ViewUsersListModal = ({ open, onClose }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'email', label: 'Email Address', minWidth: 170 },
        { id: 'role', label: 'Role', minWidth: 100 },
        { id: 'lastLogin', label: 'Last Login', minWidth: 170 },
    ];

    const rows = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', lastLogin: '2024-03-20 10:30 AM' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher', lastLogin: '2024-03-20 09:15 AM' },
    ];

    return (
        <StandardModal
            open={open}
            onClose={onClose}
            title="User List"
            maxWidth="md"
            padding={0}
            headerBg={isDarkMode ? theme.palette.background.paper : '#fff'}
            sx={{ bgcolor: isDarkMode ? theme.palette.background.default : 'transparent' }}
            actions={
                <Stack direction="row" spacing={2} justifyContent="flex-end" width="100%">
                    <PrimaryButton variant="secondary" onClick={onClose}>Close</PrimaryButton>
                    <PrimaryButton startIcon={<IconDownload size={18} />}>Export List</PrimaryButton>
                </Stack>
            }
        >
            <Box sx={{ p: 3 }}>
                <Card sx={{ 
                    mb: 3, 
                    p: 2.5, 
                    border: `1px solid ${theme.palette.divider}`, 
                    boxShadow: theme.shadows[1],
                    bgcolor: theme.palette.background.paper,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box>
                        <Typography variant="h5" fontWeight="800" color="textPrimary">Total Users</Typography>
                        <Typography variant="body2" color="textSecondary" fontWeight="600">Overview of all registered users in the system</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="900" color="primary">452</Typography>
                </Card>

                <Box sx={{ 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper
                }}>
                    <StandardDataTable 
                        columns={columns} 
                        rows={rows} 
                        showSelection={false}
                    />
                </Box>
            </Box>
        </StandardModal>
    );
};

export default ViewUsersListModal;
