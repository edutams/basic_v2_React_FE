import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  GridView as GridViewIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReusableModal from 'src/components/shared/ReusableModal';

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

const ManageClassesModal = ({ open, onClose, division, onUpdateDivision }) => {
  const [classes] = useState([
    { id: 1, name: 'KG', code: 'KG', order: 1, description: 'KG' },
    { id: 2, name: 'Nursery 1', code: 'NUR1', order: 2, description: 'Nursery 1' },
    { id: 3, name: 'Nursery 2', code: 'NUR2', order: 3, description: 'Nursery 2' },
    { id: 4, name: 'Primary 1', code: 'PRY1', order: 4, description: 'Primary 1' },
    { id: 5, name: 'Primary 2', code: 'PRY2', order: 5, description: 'Primary 2' },
    { id: 6, name: 'Primary 3', code: 'PRY3', order: 6, description: 'Primary 3' },
    { id: 7, name: 'Primary 4', code: 'PRY4', order: 7, description: 'Primary 4' },
    { id: 8, name: 'Primary 5', code: 'PRY5', order: 8, description: 'Primary 5' },
    { id: 9, name: 'Primary 6', code: 'PRY6', order: 9, description: 'Primary 6' },
  ]);

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Manage Class For
          <Chip
            label="PRIMARY"
            sx={{
              backgroundColor: '#00bcd4',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              height: '24px',
            }}
          />
          Division
        </Box>
      }
      size="large"
      maxWidth="lg"
    >
      <Box sx={{ p: 3 }}>
        {/* Section Header */}
        <SectionHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              SCHOOL STRUCTURE CLASS
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 1,
            }}
          >
            Create Class
          </Button>
        </SectionHeader>

        {/* Drag Info Alert */}
        <StyledAlert severity="info">
          Drag the rows to reorder class
        </StyledAlert>

        {/* Table */}
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
                      {classItem.order}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {classItem.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <GridViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Box>
    </ReusableModal>
  );
};

export default ManageClassesModal;