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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReusableModal from 'src/components/shared/ReusableModal';
import CreateClassForm from './CreateClassForm';

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

const ManageClassesModal = ({ open, onClose, programme, division, onUpdateProgramme }) => {
  const [classes, setClasses] = React.useState([]);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  // Reusable function to get division display data
  const getDivisionDisplayData = (division) => {
    return {
      name: division?.name || division?.division || 'Division',
      id: division?.id || Date.now(),
      code: division?.code || '-',
      order: division?.order || 1,
      description: division?.description || '-'
    };
  };

  React.useEffect(() => {
    const normalizedClasses = Array.isArray(division?.classes) ? division.classes : [];
    setClasses(normalizedClasses);
  }, [division]);

  const handleSave = () => {
    if (onUpdateProgramme) {
      onUpdateProgramme(classes);
    }
    onClose();
  };

  const handleOpenCreate = () => setCreateModalOpen(true);
  const handleCloseCreate = () => setCreateModalOpen(false);

  const handleCreateClass = (newClass) => {
    const newClassEntry = {
      id: Date.now(),
      name: newClass.name,
      code: newClass.code,
      description: newClass.description,
      status: newClass.status,
      order: newClass.order || classes.length + 1,
    };
    
    const updatedClasses = [...classes, newClassEntry];
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
        title="Create Class"
        size="medium"
        maxWidth="md"
        actions={null}
      >
        <Box>
          <CreateClassForm
            onSubmit={handleCreateClass}
            onCancel={handleCloseCreate}
            actionType="create"
          />
        </Box>
      </ReusableModal>
    ) : (
      <ReusableModal
        open={open}
        onClose={onClose}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Manage Class For
            <Chip
              label={division?.division || division?.name || 'No Division Selected'}
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
          <Button variant="contained" onClick={handleSave} disabled={!programme}>
            Save
          </Button>
        }
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 400, color: 'text.primary' }}>
                SCHOOL STRUCTURE CLASS
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
              Create Class
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <StyledAlert severity="info">
            Drag the rows to reorder class
          </StyledAlert>

          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Class Code</TableCell>
                  <TableCell>Class Order</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {classes.length === 0 ? (
                  <StyledTableRow>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        1
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getDivisionDisplayData(division).name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDivisionDisplayData(division).code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDivisionDisplayData(division).order}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDivisionDisplayData(division).description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ) : (
                  classes.map((classItem, index) => (
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
                          {classItem.order || index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {classItem.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>
      </ReusableModal>
    )
  );
};

export default ManageClassesModal;
