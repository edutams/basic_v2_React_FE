import React, { useState } from 'react';
import { useContext } from 'react'; 
// import { CustomizerContext } from '../context/CustomizerContext';

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
import AddAgentModal from '../../components/add-agent/AddAgentModal';

// import EditIcon from '@mui/icons-material/Edit';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import MoreVertIcon from '@mui/icons-material/MoreVert';




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

const Agent = () => {
  const [agentLevel, setAgentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [referer, setReferer] = useState('');
  const [search, setSearch] = useState('');
  // const { setHeaderColor, setSidebarColor, setBodyColor } = useContext(CustomizerContext); 
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState([]);

  


  const handleAddAgent = (newAgent) => {
    setData(prevData => [...prevData, newAgent]);
    console.log("New Agent Added:", newAgent); 

    setHeaderColor(newAgent.headerColor);
    setSidebarColor(newAgent.sidebarColor);
    setBodyColor(newAgent.bodyColor);
  };

 const handleRefresh = (newData) => {
    setData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.s_n === newData.s_n);

      if (existingIndex !== -1) {
        // If the item exists, update it
        const updatedData = [...prevData];
        updatedData[existingIndex] = newData;
        return updatedData;
      } else {
        // If the item doesn't exist, add it
        return [...prevData, newData];
      }
    });
    setRefreshKey((prevData) => prevData + 1);
  };

  const handleUpdateAgent = (agentData, actionType) => {
    console.log("Selected Agent Data:", agentData);
    setSelectedAgent(agentData);
    setActionType(actionType);
    setIsModalOpen(true);
  };

  const handleViewSchools = (agentData) => {
    console.log("Selected Agent Data:", agentData);
    setSelectedAgent(agentData);
    setActionType('viewSchools');
    setIsModalOpen(true);
  };

  const handleManagePermissions = (agentData) => {
    setSelectedAgent(agentData);
    setActionType('managePermissions');
    setIsModalOpen(true);
  };

  // const schoolsData = [
  //   {
  //     schoolName: 'ABC School',
  //     address: '123 Main St',
  //   },
  //   {
  //     schoolName: 'XYZ School',
  //     address: '456 Oak Ave',
  //   },
  // ];

  const handleAgentUpdate = (updatedAgent) => {
    setData(prevData =>
      prevData.map(agent =>
        agent.s_n === updatedAgent.s_n ? updatedAgent : agent
      )
    );
  };

  // const initialAgentData = [
  //   {
  //     s_n: 1,
  //     organizationName: 'Org A', 
  //     level: 'Level 1', 
  //     agentDetails: 'Agent A',
  //     contactDetails: 'agentA@example.com',
  //     phoneNumber: '123-456-7890', 
  //     performance: 'High',
  //     gateway: 'Gateway 1',
  //     colourScheme: 'Red',
  //     status: 'Active',
  //     action: 'View',
  //   },
  //   {
  //     s_n: 2,
  //     organizationName: 'Org B', 
  //     level: 'Level 2', 
  //     agentDetails: 'Agent B',
  //     contactDetails: 'agentB@example.com',
  //     phoneNumber: '987-654-3210', 
  //     performance: 'High',
  //     gateway: 'Gateway 2',
  //     colourScheme: 'Blue',
  //     status: 'Active',
  //     action: 'Edit',
  //   },
  //   {
  //     s_n: 3,
  //     organizationName: 'Org C', 
  //     level: 'Level 2', 
  //     agentDetails: 'Agent B',
  //     contactDetails: 'agentB@example.com',
  //     phoneNumber: '987-654-3210', 
  //     performance: 'High',
  //     gateway: 'Gateway 1',
  //     colourScheme: 'Blue',
  //     status: 'Inactive',
  //     action: 'Edit',
  //   },
  //   {
  //     s_n: 4,
  //     organizationName: 'Org D', 
  //     level: 'Level 1', 
  //     agentDetails: 'Agent D',
  //     contactDetails: 'agentB@example.com',
  //     phoneNumber: '987-654-3210', 
  //     performance: 'Medium',
  //     gateway: 'Gateway 1',
  //     colourScheme: 'Blue',
  //     status: 'Inactive',
  //     action: 'Edit',
  //   },
  //   {
  //     s_n: 5,
  //     organizationName: 'Org E', 
  //     level: 'Level 2', 
  //     agentDetails: 'Agent E',
  //     contactDetails: 'agentB@example.com',
  //     phoneNumber: '987-654-3210', 
  //     performance: 'Medium',
  //     gateway: 'Gateway 1',
  //     colourScheme: 'Blue',
  //     status: 'Inactive',
  //     action: 'Edit',
  //   },
  // ];

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
          // <Typography color="textSecondary" variant="h6" fontWeight="400">
          //   {/* {info.getValue()} */}
          //   {info.row.original.contactDetails}
          // </Typography>
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
    columnHelper.accessor('gateway', {
      header: () => 'Gateway',
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
    columnHelper.accessor('colourScheme', {
      header: () => 'Colour Scheme',
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
            
              <MenuItem onClick={() => { handleClose(); handleUpdateAgent(row.original, 'update'); }}>Update Agent Info</MenuItem>
              <MenuItem onClick={() => { handleClose(); handleViewSchools(row.original, 'view'); }}>View School</MenuItem>
              <MenuItem onClick={() => { handleClose(); handleManagePermissions(row.original); }}>Manage Permission</MenuItem>
              
              
              
              {/* <MenuItem onClick={() => { handleClose(); console.log('Option 2 clicked for agent', row.original.s_n); }}>View Schools</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 3 clicked for agent', row.original.s_n); }}>Manage Permission</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 4 clicked for agent', row.original.s_n); }}>Update Commision</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 5 clicked for agent', row.original.s_n); }}>Manage Refferal</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 6 clicked for agent', row.original.s_n); }}>Manage Payment Gateway</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 7 clicked for agent', row.original.s_n); }}>View Agent Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 8 clicked for agent', row.original.s_n); }}>Change Agent Colour Scheme</MenuItem>
              <MenuItem onClick={() => { handleClose(); console.log('Option 9 clicked for agent', row.original.s_n); }}>Delete Agent</MenuItem> */}
            </Menu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
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
      <Breadcrumb title="Agent" items={BCrumb} />
      <Box>
        

        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={200}>
                All Agent
              </Typography>
              <Button variant="contained" color="primary" startIcon={<HowToRegIcon />} onClick={() => setIsRegisterModalOpen(true)}>
                Register Agent
              </Button>

            </Box>
          }
        >

<Grid container spacing={3} mb={3}>
          <Grid item size={{ xs: 12, md: 3, sm: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Agent Level</InputLabel>
              <Select value={agentLevel} label="Agent Level" onChange={(e) => setAgentLevel(e.target.value)}>
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="option1">Level 1</MenuItem>
                <MenuItem value="option2">Level 2</MenuItem>
                <MenuItem value="option2">Level 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3, sm: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Country</InputLabel>
              <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}>
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="optionA">Nigeria</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3, sm: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>State</InputLabel>
              <Select value={state} label="State" onChange={(e) => setState(e.target.value)}>
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="valueX">Ogun State</MenuItem>
                <MenuItem value="valueY">Lagos State</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3, sm: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>LGA</InputLabel>
              <Select value={lga} label="Lga" onChange={(e) => setLga(e.target.value)}>
                <MenuItem value="">-- Choose --</MenuItem>
                {/* <MenuItem value="item1">Lga</MenuItem>
                <MenuItem value="item2">Lga</MenuItem> */}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3, sm: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Referer</InputLabel>
              <Select value={referer} label="Referer" onChange={(e) => setReferer(e.target.value)}>
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="data1">Odeda</MenuItem>
                <MenuItem value="data2">Yewa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3, sm: 4 }}>
            <TextField
              fullWidth
              label="Agent Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
            />
          </Grid>
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ParentCard>
        <AddAgentModal
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
      </Box>
    </PageContainer>
  );
};

export default Agent;

