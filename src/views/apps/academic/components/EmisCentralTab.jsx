import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  GridView as GridViewIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ManageClassesModal from './ManageClassesModal';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateDivision from '../component/division/CreateDivision';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  width: '100%',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const DivisionRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f3f0ff',
  '& .MuiTableCell-root': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 600,
  },
}));

const ProgrammeRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#fafafa',
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(4),
  },
}));

const ClassRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(6),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ClassArmChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontSize: '0.75rem',
  height: '24px',
  minWidth: '24px',
  margin: '2px',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

// Mock data structure matching the image
const mockSchoolStructure = [
  {
    id: 1,
    division: 'Primary (PRY)',
    status: 'PRIVATE',
    type: 'PUBLIC',
    expanded: true,
    programmes: [
      {
        id: 11,
        name: 'Kindergarten (KG)',
        expanded: true,
        classes: [
          {
            id: 111,
            name: 'KG',
            code: 'KG',
            order: 1,
            description: 'KG',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
          }
        ]
      },
      {
        id: 12,
        name: 'Nursery (NUR)',
        expanded: true,
        classes: [
          {
            id: 121,
            name: 'Nursery 1',
            code: 'NUR1',
            order: 2,
            description: 'Nursery 1',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F']
          },
          {
            id: 122,
            name: 'Nursery 2',
            code: 'NUR2',
            order: 3,
            description: 'Nursery 2',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F']
          }
        ]
      },
      {
        id: 13,
        name: 'Primary (PRY)',
        expanded: true,
        classes: [
          {
            id: 131,
            name: 'Primary 1',
            code: 'PRY1',
            order: 4,
            description: 'Primary 1',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          },
          {
            id: 132,
            name: 'Primary 2',
            code: 'PRY2',
            order: 5,
            description: 'Primary 2',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          },
          {
            id: 133,
            name: 'Primary 3',
            code: 'PRY3',
            order: 6,
            description: 'Primary 3',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          },
          {
            id: 134,
            name: 'Primary 4',
            code: 'PRY4',
            order: 7,
            description: 'Primary 4',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          },
          {
            id: 135,
            name: 'Primary 5',
            code: 'PRY5',
            order: 8,
            description: 'Primary 5',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          },
          {
            id: 136,
            name: 'Primary 6',
            code: 'PRY6',
            order: 9,
            description: 'Primary 6',
            status: 'ACTIVE',
            arms: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
          }
        ]
      }
    ]
  }
];

const EmisCentralTab = () => {
  const [schoolStructure, setSchoolStructure] = useState(mockSchoolStructure);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [manageClassesOpen, setManageClassesOpen] = useState(false);
  // Add state for programme menu
  const [programmeAnchorEl, setProgrammeAnchorEl] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [openCreateDivision, setOpenCreateDivision] = useState(false);

  const toggleProgramme = (divisionId, programmeId) => {
    setSchoolStructure(prev => prev.map(division => 
      division.id === divisionId 
        ? {
            ...division,
            programmes: division.programmes.map(programme =>
              programme.id === programmeId
                ? { ...programme, expanded: !programme.expanded }
                : programme
            )
          }
        : division
    ));
  };

  const handleMenuClick = (event, division) => {
    setAnchorEl(event.currentTarget);
    setSelectedDivision(division);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDivision(null);
  };

  const handleManageClasses = () => {
    setManageClassesOpen(true);
    handleMenuClose();
  };

  const handleProgrammeMenuClick = (event, programme) => {
    setProgrammeAnchorEl(event.currentTarget);
    setSelectedProgramme(programme);
  };
  const handleProgrammeMenuClose = () => {
    setProgrammeAnchorEl(null);
    setSelectedProgramme(null);
  };

  const handleUpdateDivision = (updatedDivision) => {
    setSchoolStructure(prev => prev.map(division => 
      division.id === updatedDivision.id ? updatedDivision : division
    ));
  };

  const handleCreateDivision = (newDivision) => {
    setSchoolStructure(prev => [
      ...prev,
      {
        ...newDivision,
        id: Date.now(), // unique id
        programmes: [],
      }
    ]);
    setOpenCreateDivision(false);
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                            <span>Emis Central</span>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setOpenCreateDivision(true)}
                              sx={{ ml: 2, }}
                              aria-label="Create new division"
                            >
                              Create Division
                            </Button>
                          </Box>

      {/* Table */}
      <StyledTableContainer component={Paper}>
        <Table sx={{ width: '100%' }}>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '5%', borderRight: '1px solid #e0e0e0' }}>#</TableCell>
              <TableCell sx={{ width: '25%', borderRight: '1px solid #e0e0e0' }}>Division</TableCell>
              <TableCell sx={{ width: '20%', borderRight: '1px solid #e0e0e0' }}>Programme</TableCell>
              <TableCell sx={{ width: '50%' }}>Class / Arms</TableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {schoolStructure.map((division, divIndex) => (
              division.programmes.map((programme, progIdx) => (
                <TableRow key={division.id + '-' + programme.id}>
                  {progIdx === 0 && (
                    <>
                      <TableCell rowSpan={division.programmes.length}
                      sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}
                      >{divIndex + 1}</TableCell>
                      <TableCell rowSpan={division.programmes.length}
                        sx={{borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {division.division}
                          </Typography>
                          <Chip 
                            label={division.status}
                            size="small"
                            sx={{
                              backgroundColor: 'primary.main',
                              color: 'white',
                              fontSize: '0.5rem',
                              height: '10px',
                              borderRadius: 0,
                            }}
                          />
                          <Chip 
                            label={division.type}
                            size="small"
                            sx={{
                              backgroundColor: 'success.main',
                              color: 'white',
                              fontSize: '0.5rem',
                              height: '10px',
                              borderRadius: 0,
                            }}
                          />
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuClick(e, division)}
                          >
                            <MoreVertIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </>
                  )}
                  <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1 }}>
                        {programme.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleProgrammeMenuClick(e, programme)}
                        sx={{ p: 0.5, m: 0, lineHeight: 1 }}
                      >
                        <MoreVertIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Table size="small" sx={{ borderRadius: 1, width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '30%', py: 0.5, fontSize: '0.95em', border: '1px solid #e0e0e0' }}>Class Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, py: 0.5, fontSize: '0.95em', border: '1px solid #e0e0e0', }}>Class Arms</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {programme.classes.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell sx={{ fontWeight: 500, py: 0.5, fontSize: '0.95em', border: '1px solid #e0e0e0' }}>{classItem.name}</TableCell>
                            <TableCell sx={{ py: 0.5, border: '1px solid #e0e0e0' }}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
                                {classItem.arms.map((arm) => (
                                  <ClassArmChip 
                                    key={arm}
                                    label={arm}
                                    size="small"
                                    sx={{ fontSize: '0.75em', height: '10px', py: 0., px: 0.5, borderRadius: 0, }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleManageClasses}>
          <ClassIcon sx={{ mr: 1, fontSize: 18 }} />
          Manage Classes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SchoolIcon sx={{ mr: 1, fontSize: 18 }} />
          Manage Programs
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit Division
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Manage Classes Modal */}
      <ManageClassesModal
        open={manageClassesOpen}
        onClose={() => setManageClassesOpen(false)}
        division={selectedDivision}
        onUpdateDivision={handleUpdateDivision}
      />

      {/* Programme Action Menu */}
      <Menu
        anchorEl={programmeAnchorEl}
        open={Boolean(programmeAnchorEl)}
        onClose={handleProgrammeMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProgrammeMenuClose}>Edit Programme</MenuItem>
        <MenuItem onClick={handleProgrammeMenuClose} sx={{ color: 'error.main' }}>Delete Programme</MenuItem>
      </Menu>

      {/* Create Division Modal */}
      <ReusableModal
        open={openCreateDivision}
        onClose={() => setOpenCreateDivision(false)}
        title="Create Division"
      >
        <CreateDivision
          actionType="create"
          onCancel={() => setOpenCreateDivision(false)}
          onSubmit={handleCreateDivision}
        />
      </ReusableModal>
    </Box>
  );
};

export default EmisCentralTab;
