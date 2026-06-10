import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const InvoiceView = ({
  setViewMode,
  selectedClass,
  selectedSessionLabel,
  selectedTermLabel,
  studentsData,
  schoolLogo,
  schoolName,
  schoolAddress,
  schoolEmail,
  schoolPhone,
}) => {
  return (
    <Stack spacing={3} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Class Invoice ·{' '}
          <Box component="span" color="primary.main">
            {selectedClass}
          </Box>
        </Typography>
        <Button variant="outlined" size="small" onClick={() => setViewMode('students')}>
          Back
        </Button>
      </Box>

      {studentsData.slice(0, 2).map((student, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          {/* Learner Info Card */}
          <Box
            sx={{
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.light',
                p: 3,
                m: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Box
                component="img"
                src={schoolLogo}
                alt="School Logo"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  bgcolor: 'white',
                  objectFit: 'contain',
                  p: 1,
                  flexShrink: 0,
                }}
              />

              <Box flex={1} textAlign="center">
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {schoolName}
                </Typography>

                {schoolAddress && (
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    {schoolAddress}
                  </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={3} mt={1} justifyContent="center">
                  {schoolEmail && (
                    <Typography variant="h6" color="text.secondary" fontWeight={700}>
                      {schoolEmail}
                    </Typography>
                  )}

                  {schoolPhone && (
                    <Typography variant="h6" color="text.secondary" fontWeight={700}>
                      {schoolPhone}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* White Learner Area */}
            <Box sx={{ p: 4 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                textAlign="center"
                mb={4}
                color="text.primary"
              >
                {selectedSessionLabel} - {selectedTermLabel} Invoice
              </Typography>

              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                width="100%"
                gap={4}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                    Learner Details
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={0.5}>
                    {student.name}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} mb={2}>
                    Class:{' '}
                    <Box component="span" fontWeight={400} color="text.secondary">
                      {selectedClass}
                    </Box>
                  </Typography>
                  <Button size="small">PROCEED TO PAY</Button>
                </Box>
                <Box textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1}>
                    Invoice Number:{' '}
                    <Box component="span" fontWeight={400} color="text.secondary">
                      36056531
                    </Box>
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={2}>
                    Balance Due:{' '}
                    <Typography
                      component="span"
                      variant="h5"
                      fontWeight={800}
                      color="text.primary"
                    >
                      ₦{student.totalAmount?.toLocaleString() || '230,010'}
                    </Typography>
                  </Typography>
                  <Button size="small">UPDATE INVOICE</Button>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                p: { xs: 2, sm: 4 },
                m: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                mb={3}
                gap={1}
              >
                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">
                    INVOICE FOR
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {student.name}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    {student.admissionId} - {selectedClass}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  textAlign={{ xs: 'left', sm: 'right' }}
                >
                  {selectedSessionLabel} - {selectedTermLabel}
                </Typography>
              </Box>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  borderColor: 'grey.200',
                  boxShadow: 'none',
                }}
              >
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        School fee
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦6,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Text book
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦15,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Inter house sport
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦25,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Portal Fee
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦2,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        CARDIGAN
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦7,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Tie
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦3,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 500,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Transport
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦20,000
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell
                        sx={{
                          py: 2,
                          fontWeight: 800,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 800,
                          borderColor: 'grey.200',
                          color: 'text.primary',
                        }}
                      >
                        ₦78,000
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default InvoiceView;
