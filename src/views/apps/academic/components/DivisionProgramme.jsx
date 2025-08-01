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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ManageClassesModal from './ManageClassesModal';
import ManageProgram from './ManageProgram';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateDivision from './CreateDivision';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import ManageClassArm from './ManageClassArm';
import CreateClassForm from './CreateClassForm';

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
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const DivisionRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#f3f0ff',
  '& .MuiTableCell-root': {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 600,
  },
}));

const ProgrammeRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#fafafa',
  '& .MuiTableCell-root': {
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(4),
  },
}));

const ClassRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(0.5, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(6),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ClassArmChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontSize: '0.55rem',
  height: '10px',
  minWidth: '10px',
  margin: '2px',
  borderRadius: 0,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

const LOCAL_STORAGE_KEY = 'schoolStructure';

const categoryConfig = {
  Private: { label: 'PRIVATE', color: '#7C3AED' },
  Public: { label: 'PUBLIC', color: '#06D6A0' },
  Community: { label: 'COMMUNITY', color: '#FF9800' },
  Unapproved: { label: 'UNAPPROVED', color: '#2196F3' }
};

const renderCategoryChips = (categories) => {
  if (!categories) return null;
  
  return Object.entries(categories)
    .filter(([key, isActive]) => isActive && categoryConfig[key])
    .map(([key]) => (
      <Chip
        key={key}
        label={categoryConfig[key].label}
        size="small"
        sx={{
          backgroundColor: categoryConfig[key].color,
          color: 'white',
          fontWeight: 700,
          borderRadius: 0,
          fontSize: '0.5rem',
          height: 15,
        }}
      />
    ));
};

// Add this function to force normalize all divisions
const normalizeSchoolStructure = (structure) => {
  return structure.map(division => ({
    ...division,
    classes: Array.isArray(division.classes) ? division.classes : [],
    programmes: Array.isArray(division.programmes) ? division.programmes : []
  }));
};

const EmisCentralTab = () => {
  const [schoolStructure, setSchoolStructure] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const normalized = normalizeSchoolStructure(parsed);
      // Immediately save the normalized structure back to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
    return [];
  });

  // Update localStorage whenever schoolStructure changes to maintain consistency
  useEffect(() => {
    const normalizedStructure = schoolStructure.map(division => ({
      ...division,
      classes: division.classes || [],
      programmes: division.programmes || []
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedStructure));
  }, [schoolStructure]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [manageClassesOpen, setManageClassesOpen] = useState(false);
  const [programmeAnchorEl, setProgrammeAnchorEl] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [openCreateDivision, setOpenCreateDivision] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageProgrammeClassesOpen, setManageProgrammeClassesOpen] = useState(false);
  const [selectedProgrammeDivision, setSelectedProgrammeDivision] = useState(null);
  const [manageProgramOpen, setManageProgramOpen] = useState(false);
  const [modalDivision, setModalDivision] = useState(null);
  const [manageClassArmOpen, setManageClassArmOpen] = useState(false);
  const [selectedProgrammeForClassArm, setSelectedProgrammeForClassArm] = useState(null);
  const [selectedDivisionForClassArm, setSelectedDivisionForClassArm] = useState(null);
  const [editDivisionOpen, setEditDivisionOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editProgrammeOpen, setEditProgrammeOpen] = useState(false);
  const [selectedProgrammeForEdit, setSelectedProgrammeForEdit] = useState(null);
  const [deleteProgrammeDialogOpen, setDeleteProgrammeDialogOpen] = useState(false);

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
    if (!selectedDivision) {
      return;
    }
    
    // Ensure the division has classes property before opening modal
    const normalizedDivision = {
      ...selectedDivision,
      classes: Array.isArray(selectedDivision.classes) ? selectedDivision.classes : []
    };
        
    setModalDivision(normalizedDivision);
    setManageClassesOpen(true);
    setTimeout(() => {
      handleMenuClose();
    }, 100);
  };

  const handleManageProgram = () => {
    if (!selectedDivision) {
      return;
    }
    setModalDivision(selectedDivision);
    setManageProgramOpen(true);
    setTimeout(() => {
      handleMenuClose();
    }, 100);
  };

  const handleProgrammeMenuClick = (event, programme, division) => {
    setProgrammeAnchorEl(event.currentTarget);
    setSelectedProgramme(programme);
    setSelectedProgrammeDivision(division);
  };

  const handleProgrammeMenuClose = () => {
    setProgrammeAnchorEl(null);
    setSelectedProgramme(null);
    setSelectedProgrammeDivision(null);
  };

  const handleManageProgrammeClasses = () => {
    if (!selectedProgrammeDivision || !selectedProgramme) {
      return;
    }
    setSelectedProgrammeForClassArm(selectedProgramme);
    setSelectedDivisionForClassArm(selectedProgrammeDivision);
    setManageClassArmOpen(true);
    handleProgrammeMenuClose();
  };

  const handleUpdateClassArms = (programmeId, divisionId, classArms) => {
    setSchoolStructure(prev => prev.map(division =>
      division.id === divisionId
        ? {
            ...division,
            programmes: division.programmes.map(programme =>
              programme.id === programmeId
                ? { ...programme, classArms: classArms }
                : programme
            )
          }
        : division
    ));
  };

  const handleUpdateDivision = (updatedDivision) => {
    setSchoolStructure(prev => prev.map(division =>
      division.id === updatedDivision.id ? updatedDivision : division
    ));
    setSnackbarMessage('Division updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCreateDivision = (newDivision) => {
    const newDivisionEntry = {
      ...newDivision,
      division: newDivision.name,
      id: Date.now(),
      programmes: [],
      classes: [], // Every new division gets these properties
    };
    setSchoolStructure(prev => [...prev, newDivisionEntry]);
    setOpenCreateDivision(false);
    setSnackbarMessage('Division created successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteDivision = () => {
    if (selectedDivision) {
      setSchoolStructure(prev => prev.filter(div => div.id !== selectedDivision.id));
      setSnackbarMessage('Division deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleUpdateProgramme = (updatedProgramme) => {
    setSchoolStructure(prev => prev.map(division => {
      if (division.id !== selectedProgrammeDivision.id) return division;
      return {
        ...division,
        programmes: division.programmes.map(prog =>
          prog.id === updatedProgramme.id ? updatedProgramme : prog
        )
      };
    }));
    setManageProgrammeClassesOpen(false);
  };

  const handleAddProgramme = (division) => {
    const newProgramme = {
      id: Date.now(),
      name: 'New Programme',
      expanded: false,
      classes: [],
    };
    setSchoolStructure(prev => prev.map(d =>
      d.id === division.id ? { ...d, programmes: [...d.programmes, newProgramme] } : d
    ));
  };

  const handleEditDivision = () => {
    if (!selectedDivision) {
      return;
    }
    setModalDivision(selectedDivision);
    setEditDivisionOpen(true);
    handleMenuClose();
  };

  const handleEditProgramme = () => {
    if (!selectedProgramme || !selectedProgrammeDivision) {
      return;
    }
    setSelectedProgrammeForEdit(selectedProgramme);
    setModalDivision(selectedProgrammeDivision);
    setEditProgrammeOpen(true);
    handleProgrammeMenuClose();
  };

  const handleDeleteProgramme = () => {
    if (!selectedProgramme || !selectedProgrammeDivision) {
      return;
    }
    setDeleteProgrammeDialogOpen(true);
    setProgrammeAnchorEl(null);
  };

  const handleConfirmDeleteProgramme = () => {
    if (selectedProgramme && selectedProgrammeDivision) {
      setSchoolStructure(prev => {
        const updated = prev.map(division => {
          if (division.id === selectedProgrammeDivision.id) {
            const filteredProgrammes = division.programmes.filter(prog => prog.id !== selectedProgramme.id);
            return {
              ...division,
              programmes: filteredProgrammes
            };
          }
          return division;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      setSnackbarMessage('Programme deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    setDeleteProgrammeDialogOpen(false);
    setSelectedProgramme(null);
    setSelectedProgrammeDivision(null);
  };

  const renderDivisionInfo = (division) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {division.division} {division.code && `(${division.code})`}
        </Typography>
        {renderCategoryChips(division.categories)}
      </Box>
      
      <IconButton
        size="small"
        onClick={(e) => handleMenuClick(e, division)}
        sx={{ p: 0.5, m: 0, lineHeight: 1, alignSelf: 'flex-start' }}
      >
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 2 }}>
        <span>Division/Programme</span>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDivision(true)}
          sx={{ ml: 2 }}
          aria-label="Create new division"
        >
          Create Division
        </Button>
      </Box>

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
            {schoolStructure.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No divisions found.
                </TableCell>
              </TableRow>
            ) : (
              schoolStructure.map((division, divIndex) =>
                division.programmes && division.programmes.length > 0 ? (
                  division.programmes.map((programme, progIdx) => (
                    <TableRow key={division.id + '-' + programme.id}>
                      {progIdx === 0 && (
                        <>
                          <TableCell rowSpan={division.programmes.length}
                            sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}
                          >{divIndex + 1}</TableCell>
                          <TableCell rowSpan={division.programmes.length}
                            sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}
                          >
                            {renderDivisionInfo(division)}
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top', paddingTop: '10px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1 }}>
                            {programme.name} {programme.code && `(${programme.code})`}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleProgrammeMenuClick(e, programme, division)}
                            sx={{ p: 0.5, m: 0, lineHeight: 1 }}
                          >
                            <MoreVertIcon sx={{ fontSize: 20, verticalAlign: 'middle' }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {programme.classArms && programme.classArms.length > 0 ? (
                          <Box sx={{ 
                            border: '1px solid #e0e0e0',
                            borderRadius: 0,
                            overflow: 'hidden'
                          }}>
                            {/* Mini table headers */}
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 2fr', 
                              backgroundColor: '#f5f5f5',
                              borderBottom: '1px solid #e0e0e0',
                              borderRadius: 0
                            }}>
                              <Box sx={{ 
                                padding: '8px 12px', 
                                borderRight: '1px solid #e0e0e0',
                                borderRadius: 0
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  Class Name
                                </Typography>
                              </Box>
                              <Box sx={{ padding: '8px 12px', borderRadius: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  Class Arms
                                </Typography>
                              </Box>
                            </Box>
                            
                            {/* Class data rows */}
                            {programme.classArms.map((classArm, index) => (
                              <Box key={classArm.id} sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 2fr',
                                borderBottom: index < programme.classArms.length - 1 ? '1px solid #e0e0e0' : 'none',
                                borderRadius: 0,
                                '&:nth-of-type(even)': {
                                  backgroundColor: '#fafafa'
                                }
                              }}>
                                <Box sx={{ 
                                  padding: '4px 12px', 
                                  borderRight: '1px solid #e0e0e0',
                                  alignItems: 'center',
                                  display: 'flex',
                                  borderRadius: 0
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {classArm.name}
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  padding: '8px 12px',
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  gap: 0.5,
                                  alignItems: 'center',
                                  borderRadius: 0
                                }}>
                                  {classArm.arms.map((arm) => (
                                    <ClassArmChip key={arm} label={arm} size="small" />
                                  ))}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No class arms
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={division.id}>
                    <TableCell
                      sx={{
                        borderRight: '1px solid #e0e0e0',
                        verticalAlign: 'top',
                      }}
                    >
                      {divIndex + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderRight: '1px solid #e0e0e0',
                        verticalAlign: 'top',
                      }}
                    >
                      {renderDivisionInfo(division)}
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleManageClasses}>
          Manage Classes
        </MenuItem>
        <MenuItem onClick={handleManageProgram}>
          Manage Program
        </MenuItem>
        <MenuItem onClick={handleEditDivision}>
          Edit Division
        </MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)}>
          Delete
        </MenuItem>
      </Menu>

      <ManageClassesModal
        open={manageClassesOpen}
        onClose={() => {
          setManageClassesOpen(false);
          setModalDivision(null);
        }}
        division={modalDivision || selectedDivision}
        programme={null}
        onUpdateProgramme={(updatedClasses) => {
          const divisionToUpdate = modalDivision || selectedDivision;
          setSchoolStructure(prev => {
            const updated = prev.map(division =>
              division.id === divisionToUpdate?.id
                ? { ...division, classes: updatedClasses }
                : division
            );
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }}
      />
      <ManageProgram
        open={manageProgramOpen}
        onClose={() => {
          setManageProgramOpen(false);
          setModalDivision(null);
        }}
        division={modalDivision || selectedDivision}
        programme={null}
        onUpdateProgramme={(programs) => {
          const divisionToUpdate = modalDivision || selectedDivision;
          setSchoolStructure(prev => {
            const updated = prev.map(division =>
              division.id === divisionToUpdate?.id
                ? { ...division, programmes: programs }
                : division
            );
            return updated;
          });
        }}
      />

      <Menu
        anchorEl={programmeAnchorEl}
        open={Boolean(programmeAnchorEl)}
        onClose={handleProgrammeMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleManageProgrammeClasses}>Manage Class Arm</MenuItem>
        <MenuItem onClick={handleEditProgramme}>Edit Programme</MenuItem>
        <MenuItem onClick={handleDeleteProgramme}>Delete Programme</MenuItem>
      </Menu>

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

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDivision}
        title="Delete Division"
        message={`Are you sure you want to delete the division "${selectedDivision?.division}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
      <ManageClassArm
        open={manageClassArmOpen}
        onClose={() => {
          setManageClassArmOpen(false);
          setSelectedProgrammeForClassArm(null);
          setSelectedDivisionForClassArm(null);
        }}
        programme={selectedProgrammeForClassArm}
        division={selectedDivisionForClassArm}
        onUpdateClassArms={handleUpdateClassArms}
      />
      <ReusableModal
        open={editDivisionOpen}
        onClose={() => {
          setEditDivisionOpen(false);
          setModalDivision(null);
        }}
        title="Edit Division"
      >
        <CreateDivision
          actionType="edit"
          selectedDivision={modalDivision}
          onCancel={() => {
            setEditDivisionOpen(false);
            setModalDivision(null);
          }}
          onSubmit={(updatedData) => {
            handleUpdateDivision({ ...modalDivision, ...updatedData });
            setEditDivisionOpen(false);
            setModalDivision(null);
          }}
        />
      </ReusableModal>
      <ReusableModal
        open={editProgrammeOpen}
        onClose={() => {
          setEditProgrammeOpen(false);
          setSelectedProgrammeForEdit(null);
          setModalDivision(null);
        }}
        title="Edit Programme"
      >
        <CreateClassForm
          actionType="edit"
          initialValues={selectedProgrammeForEdit}
          entityName="Program"
          onCancel={() => {
            setEditProgrammeOpen(false);
            setSelectedProgrammeForEdit(null);
            setModalDivision(null);
          }}
          onSubmit={(updatedData) => {
            setSchoolStructure(prev => prev.map(division =>
              division.id === modalDivision?.id
                ? {
                    ...division,
                    programmes: division.programmes.map(prog =>
                      prog.id === selectedProgrammeForEdit?.id
                        ? { ...prog, ...updatedData }
                        : prog
                    )
                  }
                : division
            ));
            setEditProgrammeOpen(false);
            setSelectedProgrammeForEdit(null);
            setModalDivision(null);
          }}
        />
      </ReusableModal>
      <ConfirmationDialog
        open={deleteProgrammeDialogOpen}
        onClose={() => setDeleteProgrammeDialogOpen(false)}
        onConfirm={handleConfirmDeleteProgramme}
        title="Delete Programme"
        message={`Are you sure you want to delete the programme "${selectedProgramme?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmisCentralTab;
