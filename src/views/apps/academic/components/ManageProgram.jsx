import React from 'react';
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
  Alert,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateClassForm from './CreateClassForm';
import ManageClassArm from './ManageClassArm';

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: '#e0f7fa',
  color: '#00695c',
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  '& .MuiAlert-icon': {
    display: 'none',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  boxShadow: 'none',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.grey[50],
  },
  '& .MuiTableCell-root': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    fontSize: '0.875rem',
    '&:last-child': {
      borderRight: 'none',
    },
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const ManageProgram = ({ open, onClose, programme, division, onUpdateProgramme }) => {
  
  const divisionObj = Array.isArray(division) ? division[0] : division;
  const [classes, setClasses] = React.useState(division?.programmes || []);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedProgram, setSelectedProgram] = React.useState(null);
  const [manageClassArmOpen, setManageClassArmOpen] = React.useState(false);

  const handleMenuOpen = (event, program) => {
    setAnchorEl(event.currentTarget);
    setSelectedProgram(program);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProgram(null);
  };

  const handleManageClassArm = () => {
    setManageClassArmOpen(true);
    handleMenuClose();
  };

  const handleEditProgramme = () => {
    // TODO: Open edit programme modal
    handleMenuClose();
  };

  const handleDeleteProgramme = () => {
    // TODO: Handle delete programme
    handleMenuClose();
  };

  React.useEffect(() => {
    setClasses(division?.programmes || []);
  }, [division]);

  const handleSave = () => {
    if (onUpdateProgramme) {
      onUpdateProgramme(classes);
    } else {
      console.error('onUpdateProgramme is not defined!');
    }
    onClose();
  };

  const handleOpenCreate = () => setCreateModalOpen(true);
  const handleCloseCreate = () => setCreateModalOpen(false);

  const handleCreateClass = (newClass) => {
    const newProgram = {
      id: Date.now(),
      name: newClass.name,
      code: newClass.code,
      description: newClass.description,
      status: newClass.status,
      expanded: false,
      classes: [],
    };
    
    const updatedClasses = [...classes, newProgram];
    setClasses(updatedClasses);
    
    // Auto-save to parent immediately
    if (onUpdateProgramme) {
      onUpdateProgramme(updatedClasses);
    }
    
    setCreateModalOpen(false);
  };

  return (
    createModalOpen ? (
      <ReusableModal
        open={createModalOpen}
        onClose={handleCloseCreate}
        title="Create Program"
        size="medium"
        maxWidth="md"
        actions={null}
      >
        <Box>
          <CreateClassForm
            onSubmit={handleCreateClass}
            onCancel={handleCloseCreate}
            actionType="create"
            entityName="Program"
          />
        </Box>
      </ReusableModal>
    ) : (
      <ReusableModal
        open={open}
        onClose={onClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Manage Program For
            <Chip
              label={divisionObj?.division || divisionObj?.name || ''}
              sx={{
                backgroundColor: '#00bcd4',
                color: 'white',
                fontSize: '0.5rem',
                fontWeight: 600,
                height: '15px', 
                borderRadius: 0,
                padding: '0 1px', 
              }}
            />
            Division
          </Box>
        }
        size="large"
        maxWidth="lg"
        actions={
          <Button variant="contained" onClick={handleSave}>
            Save Programs
          </Button>
        }
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 400, color: 'text.primary' }}>
                SCHOOL STRUCTURE PROGRAMME
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 1,
              }}
              onClick={handleOpenCreate}
            >
              Create Program
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* <StyledAlert severity="info">
            Drag the rows to reorder class
          </StyledAlert> */}

          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Programme Name</TableCell>
                  <TableCell>Prog Code</TableCell>
                  <TableCell>Division</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {classes.map((classItem, index) => (
                  <StyledTableRow key={classItem.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {classItem.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classItem.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {division?.name || 'Primary'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classItem.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {classItem.status && (
                        <Chip
                          label={classItem.status}
                          size="small"
                          sx={{
                            backgroundColor: classItem.status === 'Active' ? '#22c55e' : '#9e9e9e',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            fontSize: '0.85em',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                        <MoreVertIcon onClick={(e) => handleMenuOpen(e, classItem)}/>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleManageClassArm}>
            Manage Class Arms
          </MenuItem>
          <MenuItem onClick={handleEditProgramme}>
            Edit Programme
          </MenuItem>
          <MenuItem onClick={handleDeleteProgramme}>
            Delete
          </MenuItem>
        </Menu>
        <ManageClassArm
          open={manageClassArmOpen}
          onClose={() => setManageClassArmOpen(false)}
          programme={selectedProgram}
          division={divisionObj}
        />
      </ReusableModal>
    )
  );
};

export default ManageProgram;
