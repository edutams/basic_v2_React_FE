import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Skeleton,
} from '@mui/material';

// Mirrors SubjectMatrixTable's real shape (sticky Learner's Name + Registered
// columns, one column per subject, a toggle icon per learner/subject cell)
// instead of a handful of generic bars, so the loading state reads as "this
// table is arriving" rather than an unrelated placeholder.
const SubjectMatrixTableSkeleton = ({ rows = 6, columns = 3 }) => (
  <TableContainer
    elevation={0}
    variant="outlined"
    sx={{ borderRadius: 2, overflowX: 'auto', border: '1.5px solid', borderColor: 'divider' }}
  >
    <Table sx={{ minWidth: 900 }} size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ minWidth: 240 }}>
            <Skeleton variant="text" width={120} />
          </TableCell>
          <TableCell align="center" sx={{ minWidth: 100 }}>
            <Skeleton variant="text" width={70} sx={{ mx: 'auto' }} />
          </TableCell>
          {Array.from({ length: columns }).map((_, i) => (
            <TableCell key={i} align="center" sx={{ minWidth: 140 }}>
              <Skeleton variant="text" width={90} sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width={60} sx={{ mx: 'auto' }} />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            <TableCell>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Skeleton variant="circular" width={32} height={32} />
                <Stack sx={{ minWidth: 0, flex: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </Stack>
              </Stack>
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="text" width={20} sx={{ mx: 'auto' }} />
            </TableCell>
            {Array.from({ length: columns }).map((_, c) => (
              <TableCell key={c} align="center">
                <Skeleton variant="circular" width={24} height={24} sx={{ mx: 'auto' }} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SubjectMatrixTableSkeleton;
