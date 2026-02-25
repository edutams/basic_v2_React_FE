import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from '../../context/AgentContext/auth';

import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button,
  Badge,
} from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';
import AgentModal from '../../components/add-agent/components/AgentModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import EmptyTableState from '../../components/shared/EmptyTableState';
import useTableEmptyState from '../../hooks/useTableEmptyState';
import agentApi from '../../api/agent';

import HowToRegIcon from '@mui/icons-material/HowToReg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Agent',
  },
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const columnHelper = createColumnHelper();

import locationApi from '../../api/location';

const Agent = () => {
  const { user, impersonateAgent } = useContext(AuthContext);
  const [agentLevel, setAgentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [status, setStatus] = useState('');
  // const [referer, setReferer] = useState(''); // Removed
  const [search, setSearch] = useState('');
  
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const navigate = useNavigate();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
             state: state || undefined,
             lga: lga || undefined,
             status: status || undefined,
             search: search || undefined,
             access_level: agentLevel || undefined
        };
        const response = await agentApi.getAll(params);
        if(response.success){
             const mappedData = response.data.map((agent, index) => {
                 let parsedColor = agent.color;
                 if (typeof agent.color === 'string') {
                     try {
                         parsedColor = JSON.parse(agent.color);
                     } catch (e) {
                         console.error("Error parsing color JSON", e);
                         parsedColor = {};
                     }
                 }

                 return {
                     s_n: agent.id,
                     agentDetails: agent.name,
                     organizationName: agent.org_name,
                     organizationTitle: agent.org_title,
                     contactDetails: agent.email,
                     phoneNumber: agent.phone,
                     imgsrc: agent.image,
                     performance: 'School: ' + (agent.tenants_count || 0),
                     headerColor: parsedColor?.headcolor,
                     sidebarColor: parsedColor?.sidecolor,
                     bodyColor: parsedColor?.bodycolor,
                     status: agent.status ? (agent.status.charAt(0).toUpperCase() + agent.status.slice(1)) : 'Inactive',
                     lga: agent.lga_id,
                     stateFilter: agent.state_lga?.state_id,
                 };
             });
             setData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch agents", error);
      }
    };
    fetchData();
  }, [refreshKey]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const [hasFiltered, setHasFiltered] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [filterClicked, setFilterClicked] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const applyFilters = () => {
    setRefreshKey(prev => prev + 1);
    setHasFiltered(true);
  };

  // Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await locationApi.getStates();
        setStates(response); 
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when State changes
  useEffect(() => {
    setLga('');
    const fetchLgas = async () => {
      if (state) {
        try {
            // Find state object to get ID if state is stored as name, or use state directly if ID
            // The API likely returns objects with id and name. 
            // The filters currently use state name (string). 
            // Verify what locationApi returns. Assume it returns list of objects {id, name...}.
            // Based on previous code, state filter uses names. 
            const selectedState = states.find(s => (s.stname || s.name) === state);
            if(selectedState){
                const response = await locationApi.getLgas(selectedState.id);
                setLgas(response);
            } else {
                setLgas([]);
            }
        } catch (error) {
            console.error("Failed to fetch LGAs", error);
            setLgas([]);
        }
      } else {
        setLgas([]);
        setLga('');
      }
    };
    fetchLgas();
  }, [state, states]);


  const hasActiveFilters = useMemo(() => {
    return agentLevel || country || state || lga || search;
  }, [agentLevel, country, state, lga, search]);

  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  const emptyState = useTableEmptyState(filteredData, hasActiveFilters, !!search, search, {
    defaultMessage: 'No agents found',
    defaultDescription:
      "No agents have been registered yet. Click 'Register Agent' to add your first agent.",
    filterMessage: 'No agents match your filters',
    filterDescription:
      'No agents match your current filters. Try adjusting your search criteria or clearing the filters.',
    searchMessage: `No agents found for "${search}"`,
    searchDescription: 'Try adjusting your search terms or clearing the search to see all agents.',
  });

  const handleAddAgent = (newAgent) => {
    setData((prevData) => [...prevData, newAgent]);
    console.log('New Agent Added:', newAgent);

    setHeaderColor(newAgent.headerColor);
    setSidebarColor(newAgent.sidebarColor);
    setBodyColor(newAgent.bodyColor);
  };

  const handleRefresh = (newData) => {
    setData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.s_n === newData.s_n);

      if (existingIndex !== -1) {
        const updatedData = [...prevData];
        updatedData[existingIndex] = newData;
        return updatedData;
      } else {
        return [...prevData, newData];
      }
    });
    setRefreshKey((prevData) => prevData + 1);
  };

  const handleUpdateAgent = (agentData, actionType) => {
    console.log('Selected Agent Data:', agentData);
    setSelectedAgent(agentData);
    setActionType(actionType);
    setIsModalOpen(true);
  };

  const handleViewSchools = (agentData) => {
    console.log('Selected Agent Data:', agentData);
    setSelectedAgent(agentData);
    setActionType('viewSchools');
    setIsModalOpen(true);
  };

  const handleManagePermissions = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('managePermissions');
    setIsModalOpen(true);
  };

  const handleSetCommission = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('setCommission');
    setIsModalOpen(true);
  };

  const handleManageReferral = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('manageReferral');
    setIsModalOpen(true);
  };

  const handleManageGateway = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('manageGateway');
    setIsModalOpen(true);
  };

  const handleChangeColorScheme = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('changeColorScheme');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = (agentData) => {
    setAgentToDelete(agentData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (agentToDelete) {
      const updatedData = data.filter((agent) => agent.s_n !== agentToDelete.s_n);
      setData(updatedData);

      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  const handleImpersonate = async (agent) => {
    try {
      const result = await impersonateAgent(agent.s_n);
      if (result.success) {
        window.location.href = '/'; // Refresh to dashboard as the new agent
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Impersonation failed", error);
    }
  };

  const handleAgentUpdate = (updatedAgent) => {
    setData((prevData) =>
      prevData.map((agent) => (agent.s_n === updatedAgent.s_n ? updatedAgent : agent)),
    );
  };

  const [editRowId, setEditRowId] = useState(null);
  const [editedData, setEditedData] = useState(null);

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
    columnHelper.accessor('agentDetails', {
      header: () => 'Agent Details',
      cell: (info) =>
        editRowId === info.row.original.s_n ? (
          <TextField
            variant="outlined"
            value={editedData?.[info.column.id] || ''}
            onChange={(e) => handleChange(e, info.column.id)}
            fullWidth
          />
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={info.row.original.imgsrc} alt={info.getValue()} width="35" />
            <Box>
              <Typography variant="h6" fontWeight="600">
                {info.row.original.organizationName}
              </Typography>
              <Typography color="textSecondary" variant="subtitle2">
                {/* {info.row.original.contactDetails} */}
                {info.getValue()}
              </Typography>
              <Typography color="textSecondary" variant="caption">
                {/* <Badge badgeContent={info.row.original.level} color="secondary">
              </Badge> */}
                {info.row.original.level}
              </Typography>
            </Box>
          </Stack>
        ),
    }),
    columnHelper.accessor('contactDetails', {
      header: () => 'Contact Details',
      cell: (info) =>
        editRowId === info.row.original.s_n ? (
          <TextField
            variant="outlined"
            value={editedData?.[info.column.id] || ''}
            onChange={(e) => handleChange(e, info.column.id)}
            fullWidth
          />
        ) : (
          <Stack direction="column" spacing={0.5} alignItems="flex-start">
            <Typography color="textSecondary" variant="subtitle2">
              {info.row.original.contactDetails}
            </Typography>
            <Typography color="textSecondary" variant="caption">
              {info.row.original.phoneNumber}
            </Typography>
          </Stack>
        ),
    }),
    columnHelper.accessor('performance', {
      header: () => 'Performance',
      cell: (info) =>
        editRowId === info.row.original.s_n ? (
          <TextField
            variant="outlined"
            value={editedData?.[info.column.id] || ''}
            onChange={(e) => handleChange(e, info.column.id)}
            fullWidth
          />
        ) : (
          <Typography color="textSecondary" variant="h6" fontWeight="400">
            {info.getValue()}
          </Typography>
        ),
    }),
    // Gateway column removed
    columnHelper.accessor('colourScheme', {
      header: () => 'Colour Scheme',
      cell: (info) => {
        const agent = info.row.original;
        const headerColor = agent.headerColor || '#1976d2';
        const sidebarColor = agent.sidebarColor || '#2196f3';
        const bodyColor = agent.bodyColor || '#f5f5f5';

        return editRowId === info.row.original.s_n ? (
          <TextField
            variant="outlined"
            value={editedData?.[info.column.id] || ''}
            onChange={(e) => handleChange(e, info.column.id)}
            fullWidth
          />
        ) : (
          <Box
            sx={{
              display: 'inline-block',
              width: 40,
              height: 30,
              borderRadius: '5px',
              overflow: 'hidden',
            }}
            title={`Header: ${headerColor} | Sidebar: ${sidebarColor} | Body: ${bodyColor}`}
          >
            <Box
              sx={{
                width: '100%',
                height: '30%',
                backgroundColor: headerColor,
                borderRadius: 0,
              }}
            />
            <Box sx={{ display: 'flex', height: '70%' }}>
              <Box
                sx={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: sidebarColor,
                  borderRadius: 0,
                }}
              />
              <Box
                sx={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: bodyColor,
                  borderRadius: 0,
                }}
              />
            </Box>
          </Box>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: () => 'Status',
      cell: (info) =>
        editRowId === info.row.original.s_n ? (
          <Select
            value={editedData?.status || ''}
            onChange={(e) => handleChange(e, 'status')}
            variant="outlined"
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Chip
            sx={{
              bgcolor:
                info.getValue() === 'Active'
                  ? (theme) => theme.palette.success.light
                  : info.getValue() === 'Inactive'
                  ? (theme) => theme.palette.error.light
                  : (theme) => theme.palette.secondary.light,
              color:
                info.getValue() === 'Active'
                  ? (theme) => theme.palette.success.main
                  : info.getValue() === 'Inactive'
                  ? (theme) => theme.palette.error.main
                  : (theme) => theme.palette.secondary.main,
              borderRadius: '8px',
            }}
            size="small"
            label={info.getValue()}
          />
        ),
    }),
    columnHelper.accessor('action', {
      header: () => 'Action',
      cell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        return (
          <div>
            <IconButton
              aria-label="more"
              id={`action-menu-button-${row.original.s_n}`}
              aria-controls={open ? `action-menu-${row.original.s_n}` : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={`action-menu-${row.original.s_n}`}
              MenuListProps={{
                'aria-labelledby': `action-menu-button-${row.original.s_n}`,
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: 48 * 4.5,
                  width: '20ch',
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate(`/dashboards/view-agent/${row.original.s_n}`);
                }}
              >
                View Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleUpdateAgent(row.original, 'update');
                }}
              >
                Update Agent Info
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleViewSchools(row.original, 'view');
                }}
              >
                View School
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManagePermissions(row.original);
                }}
              >
                Manage Permission
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleSetCommission(row.original);
                }}
              >
                Set Commission
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManageReferral(row.original);
                }}
              >
                Manage Referral
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleManageGateway(row.original);
                }}
              >
                Manage Gateway
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleImpersonate(row.original);
                }}
              >
                Login As
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleDeleteAgent(row.original);
                }}
              >
                Delete Agent
              </MenuItem>
            </Menu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowVirtualization: true,
  });

  const handleEdit = (row) => {
    setEditRowId(row.s_n);
    setEditedData({ ...row });
  };

  const handleSave = (rowId) => {
    if (editedData) {
      setData(data.map((item) => (item.s_n === editedData.s_n ? editedData : item)));
      setEditRowId(null);
      setEditedData(null);
    }
  };

  const handleChange = (e, field) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: e.target.value,
      });
    }
  };

  return (
    <PageContainer title="Agent Page" description="This is the Agent page">
      <Box sx={{ mt: 0 }}>
        <Breadcrumb title="Agent" items={BCrumb} />
      </Box>
      <Box sx={{ mt: 1 }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={200}>
                My Agent List
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<HowToRegIcon />}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Register Agent
              </Button>
            </Box>
          }
        >
          <Grid container spacing={3} mb={3}>
            {/* Basic Search - Always Visible */}
            <Grid size={{ xs: 12, md: 3, sm: 4 }}>
              <TextField
                fullWidth
                label="Agent Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="outlined"
              />
            </Grid>

             {/* Filter Icon Toggle */}
             {!showAdvancedFilters && (
              <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                 <IconButton onClick={() => setShowAdvancedFilters(true)} color="primary">
                    <FilterListIcon />
                 </IconButton>
              </Grid>
            )}


            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <>
                 <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                 <IconButton onClick={() => setShowAdvancedFilters(false)} color="secondary">
                    <FilterListIcon />
                 </IconButton>
              </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Agent Level</InputLabel>
                    <Select
                      value={agentLevel}
                      label="Agent Level"
                      onChange={(e) => setAgentLevel(e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      <MenuItem value="1">Level 1</MenuItem>
                      <MenuItem value="2">Level 2</MenuItem>
                      <MenuItem value="3">Level 3</MenuItem>
                      <MenuItem value="4">Level 4</MenuItem>
                      <MenuItem value="5">Level 5</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      label="Status"
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <MenuItem value="">-- Select --</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>State</InputLabel>
                    <Select value={state} label="State" onChange={(e) => setState(e.target.value)}>
                      <MenuItem value="">-- Select --</MenuItem>
                      {states.map((s) => (
                        <MenuItem key={s.id} value={s.stname || s.name}>
                          {s.stname || s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3, sm: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>LGA</InputLabel>
                    <Select
                      value={lga}
                      label="LGA"
                      onChange={(e) => setLga(e.target.value)}
                      disabled={!state}
                    >
                      <MenuItem value="">-- Choose LGA --</MenuItem>
                      {lgas.map((l) => (
                        <MenuItem key={l.id} value={l.lganame || l.name}>
                          {l.lganame || l.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid>
              <Button
                variant="contained"
                onClick={() => {
                  applyFilters();
                }}
                color="primary"
                sx={{ justifyContent: 'center' }}
              >
                Search
              </Button>
            </Grid>

            {showAdvancedFilters && (
              <Grid
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  // textDecoration: 'underline',
                }}
              >
                <Button variant="text" onClick={() => setShowAdvancedFilters(false)}>
                  Show Less Filters
                </Button>
              </Grid>
            )}

            {hasActiveFilters && (
              <Grid>
                <Button
                  variant="outlined"
                  color="secondary"
                  // fullWidth
                  onClick={() => {
                    setAgentLevel('');
                    setCountry('');
                    setState('');
                    setLga('');
                    setSearch('');
                  }}
                  // sx={{ height: '48px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id}>
                        <Typography variant="h6">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {!emptyState.isEmpty ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} hover>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableState
                    colSpan={table.getHeaderGroups()[0]?.headers.length || 7}
                    message={emptyState.message}
                    description={emptyState.description}
                    type={emptyState.type}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </ParentCard>
        <AgentModal
          open={isRegisterModalOpen || isModalOpen}
          onClose={() => {
            setIsRegisterModalOpen(false);
            setIsModalOpen(false);
            if (actionType === 'update') {
              setSelectedAgent(null);
            }
          }}
          handleRefresh={handleRefresh}
          selectedAgent={selectedAgent}
          actionType={isModalOpen ? actionType : 'create'}
        />

        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Agent"
          message="Are you sure you want to delete this agent? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          severity="error"
        />
      </Box>
    </PageContainer>
  );
};

export default Agent;
