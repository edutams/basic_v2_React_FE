import React from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from '@mui/material';
import ThemeSelect from '../analytical/ThemeSelect';
import DashboardCard from '../../shared/DashboardCard';

import img1 from '../../../assets/images/users/1.jpg';
import img2 from '../../../assets/images/users/2.jpg';
import img3 from '../../../assets/images/users/3.jpg';
import img4 from '../../../assets/images/users/4.jpg';
import img5 from '../../../assets/images/users/5.jpg';

const products = [
  {
    imgsrc: img1,
    name: 'Sunil Joshi',
    pname: 'Elite Admin',
    priority: 'Low',
    budget: '3.9',
  },
  {
    imgsrc: img2,
    name: 'Andrew McDownland',
    pname: 'Real Homes WP Theme',
    priority: 'Medium',
    budget: '24.5',
  },
  {
    imgsrc: img3,
    name: 'Christopher Jamil',
    pname: 'MedicalPro WP Theme',
    priority: 'High',
    budget: '12.8',
  },
  {
    imgsrc: img4,
    name: 'Nirav Joshi',
    pname: 'Hosting Press HTML',
    priority: 'Critical',
    budget: '2.4',
  },
  {
    imgsrc: img5,
    name: 'Micheal Doe',
    pname: 'Helping Hands Theme',
    priority: 'Moderate',
    budget: '9.3',
  },
];

const ProductsPerformance = () => (
  <DashboardCard
    title="Product Performance"
    subtitle="Ample Admin Vs Pixel Admin"
    action={<ThemeSelect />}
  >
    <Box
      sx={{
        overflow: 'auto',
        mt: -3,
      }}
    >
      <Table
        aria-label="simple table"
        sx={{
          mt: 2,
          whiteSpace: 'nowrap',
          'td:first-of-type, th:first-of-type': {
            pl: 0,
          },
          'td:last-of-type, th:last-of-type': {
            pr: 0,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h5">
                Assigned
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h5">
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h5">
                Priority
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h5">
                Budget
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.name}>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={product.imgsrc}
                    alt={product.imgsrc}
                    width="35"
                  />
                  <Typography variant="h5" fontWeight="600">
                    {product.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="h6">
                  {product.pname}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  sx={{
                    backgroundColor:
                      product.priority === 'Low'
                        ? (theme) => theme.palette.primary.main
                        : product.priority === 'Medium'
                          ? (theme) => theme.palette.secondary.main
                          : product.priority === 'High'
                            ? (theme) => theme.palette.warning.main
                            : product.priority === 'Moderate'
                              ? (theme) => theme.palette.success.main
                              : product.priority === 'Critical'
                                ? (theme) => theme.palette.error.main
                                : (theme) => theme.palette.secondary.main,
                    color: '#fff',
                    borderRadius: '6px',
                  }}
                  size="small"
                  label={product.priority}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">${product.budget}k</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  </DashboardCard>
);

export default ProductsPerformance;
