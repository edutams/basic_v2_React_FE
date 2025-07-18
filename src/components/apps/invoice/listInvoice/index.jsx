import React, { useContext, useState } from 'react';
import { InvoiceContext } from '../../../../context/InvoiceContext/index';
import {
  Table,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  Stack,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  IconEdit,
  IconEye,
  IconListDetails,
  IconSearch,
  IconShoppingBag,
  IconSortAscending,
  IconTrash,
  IconTruck,
} from '@tabler/icons';
import CustomCheckbox from 'src/components/forms/theme-elements/CustomCheckbox';
import { Link } from 'react-router';

const InvoiceList = () => {
  const { invoices, deleteInvoice } = useContext(InvoiceContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const tabItem = ['All', 'Shipped', 'Delivered', 'Pending'];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle status filter change
  const handleClick = (status) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tabItem.length);
    setActiveTab(status);
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (invoice.billFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.billTo.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === 'All' || invoice.status === activeTab)
    );
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate the counts for different statuses
  const Shipped = invoices.filter((t) => t.status === 'Shipped').length;
  const Delivered = invoices.filter((t) => t.status === 'Delivered').length;
  const Pending = invoices.filter((t) => t.status === 'Pending').length;

  // Toggle all checkboxes
  const toggleSelectAll = () => {
    const selectAllValue = !selectAll;
    setSelectAll(selectAllValue);
    if (selectAllValue) {
      setSelectedProducts(invoices.map((invoice) => invoice.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Toggle individual product selection
  const toggleSelectProduct = (productId) => {
    const index = selectedProducts.indexOf(productId);
    if (index === -1) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  // Handle opening delete confirmation dialog
  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  // Handle confirming deletion of selected products
  const handleConfirmDelete = async () => {
    for (const productId of selectedProducts) {
      await deleteInvoice(productId);
    }
    setSelectedProducts([]);
    setSelectAll(false);
    setOpenDeleteDialog(false);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            bgcolor="primary.light"
            p={3}
            onClick={() => handleClick('All')}
            sx={{ cursor: 'pointer' }}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="primary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconListDetails width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Total</Typography>
                <Typography variant='h5'>{invoices.length} Invoices</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            bgcolor="secondary.light"
            p={3}
            onClick={() => handleClick('Shipped')}
            sx={{ cursor: 'pointer' }}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="secondary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconShoppingBag width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Shipped</Typography>
                <Typography variant='h5'>{Shipped} Invoices</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            bgcolor="success.light"
            p={3}
            onClick={() => handleClick('Delivered')}
            sx={{ cursor: 'pointer' }}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="success.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconTruck width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Delivered</Typography>
                <Typography variant='h5'>{Delivered} Invoices</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Box
            bgcolor="warning.light"
            p={3}
            onClick={() => handleClick('Pending')}
            sx={{ cursor: 'pointer' }}
          >
            <Stack direction="row" gap={2} alignItems="center">
              <Box
                width={38}
                height={38}
                bgcolor="warning.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  color="primary.contrastText"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSortAscending width={22} />
                </Typography>
              </Box>
              <Box>
                <Typography>Pending</Typography>
                <Typography variant='h5'>{Pending} Invoices</Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Stack
        mt={3}
        justifyContent="space-between"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
      >
        <TextField
          id="search"
          type="text"
          size="small"
          variant="outlined"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={'16'} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box display="flex" gap={1}>
          {selectAll && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              startIcon={<IconTrash width={18} />}
            >
              Delete All
            </Button>
          )}
          <Button variant="contained" color="primary" component={Link} to="/apps/invoice/create">
            New Invoice
          </Button>
        </Box>
      </Stack>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ whiteSpace: { xs: 'nowrap', md: 'unset' } }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <CustomCheckbox checked={selectAll} onChange={toggleSelectAll} />
              </TableCell>
              <TableCell>
                <Typography variant="h5">
                  Id
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">
                  Bill From
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">
                  Bill To
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">
                  Total Cost
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">
                  Status
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="h5">
                  Action
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell padding="checkbox">
                  <CustomCheckbox
                    checked={selectedProducts.includes(invoice.id)}
                    onChange={() => toggleSelectProduct(invoice.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography>
                    {invoice.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {invoice.billFrom}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography >{invoice.billTo}</Typography>
                </TableCell>
                <TableCell>
                  <Typography >{invoice.totalCost}</Typography>
                </TableCell>
                <TableCell>
                  {invoice.status === 'Shipped' ? (
                    <Chip color="primary" label={invoice.status} size="small" />
                  ) : invoice.status === 'Delivered' ? (
                    <Chip color="success" label={invoice.status} size="small" />
                  ) : invoice.status === 'Pending' ? (
                    <Chip color="warning" label={invoice.status} size="small" />
                  ) : (
                    ''
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Invoice">
                    <IconButton
                      color="success"
                      component={Link}
                      to={`/apps/invoice/edit/${invoice.billFrom}`}
                    >
                      <IconEdit width={22} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Invoice">
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/apps/invoice/detail/${invoice.billFrom}`}
                    >
                      <IconEye width={22} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Invoice">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedProducts([invoice.id]);
                        handleDelete();
                      }}
                    >
                      <IconTrash width={22} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete selected invoices?</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button color="error" variant="outlined" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default InvoiceList;
