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
  TextField,
  Stack,
  InputAdornment,
} from '@mui/material';

import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import { IconPlus, IconDotsVertical } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';

const PaymentNameTab = () => {
  return (
    <Stack spacing={3}>
      <ParentCard
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Payment Name
              </Typography>
              <Typography variant="caption" color="textSecondary">
                View fee items a parent can pay for
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconPlus size={18} />}
              sx={{ fontWeight: 600 }}
            >
              Add New Payment Name
            </Button>
          </Box>
        }
      >
        <Box display="flex" gap={2} mb={3}>
          <TextField
            placeholder="Search Payment Items"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" size="small" sx={{ fontWeight: 600, minWidth: 100 }}>
            Search
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pay Option</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Settlement Account</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fee Bearer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modules</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(15)].map((_, index) => (
                <TableRow key={index + 1} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acceptance Fee</TableCell>
                  <TableCell>
                    <Chip
                      label={index % 3 === 0 ? 'OPTIONAL' : 'COMPULSORY'}
                      size="small"
                      sx={{
                        bgcolor: index % 3 === 0 ? 'warning.light' : 'primary.light',
                        color: index % 3 === 0 ? 'warning.dark' : 'primary.dark',
                        fontWeight: 600,
                        fontSize: 10,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        GTB
                      </Typography>
                      <Chip
                        label="0693040604"
                        size="small"
                        sx={{
                          bgcolor: 'error.light', 
                        }}
                      />
                      <Typography variant="caption" display="block" color="textSecondary">
                        Ikeyi$30ceTrube$75
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="CLIENT"
                      size="small"
                      sx={{
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        fontWeight: 600,
                        fontSize: 10,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="NONE"
                      size="small"
                      sx={{
                        bgcolor: 'secondary.light',
                        color: 'secondary.dark',
                        fontWeight: 600,
                        fontSize: 10,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small">
                      <IconDotsVertical size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ParentCard>
    </Stack>
  );
};

export default PaymentNameTab;
