import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  TableContainer,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
} from '@mui/material';
import StandardModal from '@/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import { IconDownload } from '@tabler/icons';

const FeeChart = ({
  open,
  onClose,
  title = 'Chart',
  chartOptions,
  chartSeries,
  buttonLabel = 'Download CSV',
  chartType = 'bar',
  isPayable,
  isOptional,
  isCompulsory,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const tableConfig = (() => {
    if (isPayable) {
      return {
        headers: ['#', 'Outstanding', 'Balance'],
        rows: [
          { id: 1, outstanding: '₦7,000,234.00', balance: '₦4,000,234' },
          { id: 2, outstanding: '₦7,000,234.00', balance: '₦4,000,234' },
          { id: 'total', outstanding: 'Total', balance: '₦7,000,234' },
        ],
      };
    }

    if (isOptional || isCompulsory) {
      return {
        headers: ['#', 'Class', 'Total Expected', 'Total Paid', 'Balance'],
        rows: [
          {
            id: 1,
            class: 'JSS1 A',
            expected: '₦7,000,234.00',
            paid: '₦7,000,234',
            balance: '₦4,000,234',
          },
          {
            id: 2,
            class: 'JSS1 B',
            expected: '₦7,000,234.00',
            paid: '₦7,000,234',
            balance: '₦4,000,234',
          },
          {
            id: 'total',
            class: 'Total',
            expected: '₦7,000,234.00',
            paid: '₦7,000,234',
            balance: '₦4,000,234',
          },
        ],
      };
    }

    return null;
  })();

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      <Grid container spacing={2} mt={3} mb={3}>
        {/* Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#E2E8F0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? '#1e1e1e' : 'white',
              p: 1,
            }}
          >
            <Chart options={chartOptions} series={chartSeries} type={chartType} height={360} />
          </Box>
        </Grid>

        {/* Side Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              border: `1px solid ${isDark ? '#444' : '#f0f0f0'}`,
              borderRadius: '10px',
              bgcolor: isDark ? theme.palette.background.paper : '#fff',
              p: 2,
              height: '100%',
            }}
          >
            {/* Header row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: isDark ? '#fff' : '#1a1a1a' }}
              >
                {/* {title} */}
                Total Transaction
              </Typography>

              <Button
                // variant="contained"
                startIcon={<IconDownload size={18} />}
                size="small"
              >
                {buttonLabel}
              </Button>
            </Box>

            {tableConfig && (
              <TableContainer variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                      {tableConfig.headers.map((h, i) => (
                        <TableCell key={i}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {tableConfig.rows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          backgroundColor: row.id === 'total' ? '#E9F4FE' : 'inherit',
                          fontWeight: row.id === 'total' ? 700 : 400,
                        }}
                      >
                        <TableCell>{row.id === 'total' ? '' : index + 1}</TableCell>

                        {isPayable ? (
                          <>
                            <TableCell>{row.outstanding}</TableCell>
                            <TableCell>{row.balance}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{row.class}</TableCell>
                            <TableCell>{row.expected}</TableCell>
                            <TableCell>{row.paid}</TableCell>
                            <TableCell>{row.balance}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Grid>
      </Grid>
    </StandardModal>
  );
};

export default FeeChart;
