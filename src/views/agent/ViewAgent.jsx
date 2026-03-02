
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Paper,
  Tab, 
  Avatar,
  Stack,
  Divider,
  Button,
  TextField
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconUser, IconGridDots, IconSchool, IconSettings, IconUsers, IconLock } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import eduTierApi from '../../api/eduTierApi';
import { Checkbox, FormControlLabel, FormGroup, Alert, CircularProgress } from '@mui/material';

import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import agentApi from '../../api/agent';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    createColumnHelper,
    getPaginationRowModel,
} from '@tanstack/react-table';

// Widgets
import AgentWelcomeCard from './AgentWelcomeCard';
import RevenueUpdates from '../../components/dashboards/modern/RevenueUpdates';
import Purchases from '../../components/dashboards/modern/Purchases';
import TotalEarnings from '../../components/dashboards/modern/TotalEarnings';
import DailyActivities from '../../components/dashboards/modern/DailyActivities';
import MonthlyEarnings from '../../components/dashboards/modern/MonthlyEarnings';
import Customers from '../../components/dashboards/modern/Customers';
import TotalSales from '../../components/dashboards/modern/TotalSales';
import SchoolsTable from './SchoolsTable';
import RecentTransactions from './RecentTransactions';


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/dashboards/agent',
    title: 'Agent',
  },
  {
    title: 'Agent Profile',
  },
];

const columnHelper = createColumnHelper();

const ViewAgent = () => {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [value, setValue] = React.useState('1');

    const { user } = useAuth();
    const isLevel1 = user?.access_level == 1;

    const [allModules, setAllModules] = useState([]);
    const [assignedModules, setAssignedModules] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const fetchModulesData = async () => {
        try {
            const [modulesRes, assignedRes] = await Promise.all([
                eduTierApi.getModules(),
                eduTierApi.getAgentModules(id)
            ]);
            setAllModules(modulesRes);
            setAssignedModules(assignedRes || []);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        }
    };

    useEffect(() => {
        if (value === '5') {
            fetchModulesData();
        }
    }, [value, id]);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const response = await agentApi.getDetails(id);
                if (response.success) {
                    setAgent(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch agent details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAgent();
        }
    }, [id]);

    const descendantsData = useMemo(() => {
        if (!agent || !agent.all_descendants) return [];
        return agent.all_descendants.map(descendant => ({
             s_n: descendant.id,
             name: descendant.name,
             email: descendant.email,
             phone: descendant.phone,
             org_name: descendant.org_name,
             status: descendant.status,
             created_at: descendant.created_at,
        }));
    }, [agent]);


    const columns = [
         columnHelper.display({
            id: 's_n',
            header: () => 'S/N',
            cell: (info) => (
                <Typography color="textSecondary" variant="h6" fontWeight="400">
                    {info.row.index + 1}
                </Typography>
            ),
        }),
        columnHelper.accessor('name', {
            header: () => 'Name',
            cell: info => (
                <Typography variant="subtitle1" fontWeight={600}>
                    {info.getValue()}
                </Typography>
            ),
        }),
        columnHelper.accessor('email', {
            header: () => 'Email',
             cell: info => (
                <Typography variant="subtitle2" color="textSecondary">
                    {info.getValue()}
                </Typography>
            ),
        }),
        columnHelper.accessor('phone', {
             header: 'Phone',
             cell: info => (
                 <Typography variant="subtitle2" color="textSecondary">
                    {info.getValue()}
                 </Typography>
             )
        }),
        columnHelper.accessor('org_name', {
            header: 'Organization',
             cell: info => (
                 <Typography variant="subtitle2" color="textSecondary">
                    {info.getValue()}
                 </Typography>
             )
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
               <Chip
                    sx={{
                        bgcolor:
                            info.getValue() === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                        color:
                            info.getValue() === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                        borderRadius: '8px',
                    }}
                    size="small"
                    label={info.getValue()}
                />
            ),
        }),
    ];

    const table = useReactTable({
        data: descendantsData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });


    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!agent) {
         return <Typography>Agent not found.</Typography>;
    }

  return (
    <PageContainer title="Agent Profile" description="Agent Profile Details">
      <Breadcrumb title="Agent Profile" items={BCrumb} />

      <Box>
        {/* Header Card is always visible */}
        <Grid container spacing={3} mb={3}>
            <Grid item xs={12}>
                <AgentWelcomeCard agent={agent} />
            </Grid>
        </Grid>

        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="Agent Profile Tabs" variant="scrollable" scrollButtons="auto">
                    <Tab icon={<IconGridDots size="20" />} label="Overview" value="1" iconPosition="start" />
                    <Tab icon={<IconUsers size="20" />} label="Team (Descendants)" value="2" iconPosition="start" />
                    <Tab icon={<IconSchool size="20" />} label="Schools (Tenants)" value="3" iconPosition="start" />
                    <Tab icon={<IconSettings size="20" />} label="Settings & Profile" value="4" iconPosition="start" />
                    {isLevel1 && (
                        <Tab icon={<IconLock size="20" />} label="Module Assignments" value="5" iconPosition="start" />
                    )}
                </TabList>
            </Box>
            
            {/* Overview Tab */}
            <TabPanel value="1" sx={{ p: 0, pt: 3 }}>
                <Grid container spacing={3}>
                    
                    <Grid item xs={12} sm={6} lg={3}>
                        <TotalEarnings />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} lg={3}>
                        <RevenueUpdates />
                    </Grid>

                    {/* Charts Row */}
                    {/* <Grid item xs={12} lg={4}>
                        <DailyActivities />
                    </Grid> */}
                    <Grid item xs={12} lg={8}>
                        <RecentTransactions />
                    </Grid>
                    {/* <Grid item xs={12} lg={12}>
                        <RevenueUpdates />
                    </Grid> */}
                </Grid>
            </TabPanel>

            {/* Team Tab */}
            <TabPanel value="2" sx={{ p: 0, pt: 3 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" mb={2} fontWeight={600}>Descendants Overview</Typography>
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table>
                                <TableHead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableCell key={header.id}>
                                                    <Typography variant="h6" fontWeight={600}>
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHead>
                                <TableBody>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} hover>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                    {descendantsData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary" variant="subtitle1">No descendants found for this agent.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </TabPanel>

             {/* Schools Tab */}
             <TabPanel value="3" sx={{ p: 0, pt: 3 }}>
                 <Card>
                    <CardContent>
                        <Typography variant="h5" mb={2} fontWeight={600}>Managed Schools</Typography>
                        <SchoolsTable />
                    </CardContent>
                 </Card>
            </TabPanel>

            {/* Settings/Profile Tab */}
            <TabPanel value="4" sx={{ p: 0, pt: 3 }}>
                 <Grid container spacing={3}>
                    {/* <Grid item xs={12} md={4}>
                         <Card>
                            <CardContent>
                                <Stack direction="column" alignItems="center" spacing={2} textAlign="center">
                                    <Avatar
                                        src={agent.image}
                                        alt={agent.name}
                                        sx={{ width: 120, height: 120 }}
                                    />
                                    <Box>
                                         <Typography variant="h5" fontWeight={600}>{agent.name}</Typography>
                                         <Typography variant="subtitle1" color="textSecondary">{agent.org_name}</Typography>
                                    </Box>
                                    <Chip label={agent.status} color={agent.status === 'active' ? 'success' : 'error'} />
                                </Stack>
                            </CardContent>
                         </Card>
                    </Grid> */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" mb={3} fontWeight={600}>Personal Details</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Email Address</Typography>
                                        <TextField fullWidth value={agent.email} disabled variant="outlined" size="small" />
                                    </Grid>
                                     <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Phone Number</Typography>
                                        <TextField fullWidth value={agent.phone} disabled variant="outlined" size="small" />
                                    </Grid>
                                     <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Address</Typography>
                                        <TextField fullWidth value={agent.address || 'Not Provided'} disabled variant="outlined" size="small" multiline rows={2} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>State</Typography>
                                        <TextField fullWidth value={agent.state_lga?.state?.name || ''} disabled variant="outlined" size="small" />
                                    </Grid>
                                     <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>LGA</Typography>
                                        <TextField fullWidth value={agent.state_lga?.name || ''} disabled variant="outlined" size="small" />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                 </Grid>
            </TabPanel>

            {/* Module Assignments Tab */}
            {isLevel1 && (
                <TabPanel value="5" sx={{ p: 0, pt: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" mb={1} fontWeight={600}>Module Access Control</Typography>
                            <Typography variant="body2" color="textSecondary" mb={3}>
                                Manually assign or revoke module access for this agent. These are "Direct Assignments" that override plan restrictions.
                            </Typography>

                            {message && (
                                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                                    {message.text}
                                </Alert>
                            )}

                            <FormGroup>
                                <Grid container spacing={2}>
                                    {allModules.map((module) => (
                                        <Grid item xs={12} sm={6} md={4} key={module.id}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={assignedModules.includes(module.id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAssignedModules(prev => 
                                                                checked 
                                                                    ? [...prev, module.id] 
                                                                    : prev.filter(id => id !== module.id)
                                                            );
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>{module.module_name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{module.module_links?.link}</Typography>
                                                    </Box>
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </FormGroup>

                            <Box mt={4} display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={async () => {
                                        setSaving(true);
                                        try {
                                            await eduTierApi.saveAgentModules(id, assignedModules);
                                            setMessage({ type: 'success', text: 'Modules assigned successfully!' });
                                        } catch (error) {
                                            setMessage({ type: 'error', text: 'Failed to save assignments.' });
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {saving ? 'Saving...' : 'Save Assignments'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </TabPanel>
            )}
        </TabContext>
      </Box>
    </PageContainer>
  );
};

export default ViewAgent;
