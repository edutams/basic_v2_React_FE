import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

const ViewSchemeDetails = ({ api }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Determine if we're in agent or tenant context based on current path
  const isAgentContext = window.location.pathname.includes('/agent/');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.getDetails(id);
      setData(res);
    } catch (error) {
      console.error('Failed to fetch details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6">Scheme of Work entry not found</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const detailRows = [
    // { label: 'Week', value: data.week?.week_name },
    { label: 'Topic(s)', value: data.topics?.map(t => t.topic_name).join(', ') },
    {
      label: 'Sub Topic(s)',
      isList: true,
      value: data.topics?.flatMap(t => t.subtopics?.map(s => s.subtopic_name)).filter(Boolean)
    },
    {
      label: 'Learning Objectives',
      isList: true,
      value: data.topics?.flatMap(t =>
        t.subtopics?.flatMap(s =>
          s.learning_objectives?.map(lo => lo.learning_objective_details)
        )
      ).filter(Boolean)
    },
    { label: 'Lesson Content', value: data.learning_material },
    { label: 'Video Content', value: data.resource_links, isLink: true },
    { label: 'Practical Approach', value: data.practical_approach },
    { label: 'Starter', value: data.starter },
    { label: 'Teacher Activity', value: data.teacher_activity },
    { label: 'Learner Activity', value: data.learner_activity },
    { label: 'Previous Knowledge', value: data.previous_knowledge },
    { label: 'Evaluation', value: data.evaluation },
    { label: 'Instructional Resources', value: data.instructional_resources },
    { label: 'Teaching Note', value: data.teaching_note },
  ];

  return (
    <PageContainer title="Scheme Of Work Details" description="View full details of the scheme entry">
      <Breadcrumb
        title="Details"
        items={[
          { to: isAgentContext ? '/agent/scheme-of-work' : '/scheme-of-work', title: 'Scheme Of Work' },
          { title: 'Details' }
        ]}
      />

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <IconArrowLeft size={20} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Scheme of Work - {data.week?.week_name} ({data.subject?.subject_name})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleDownload}
            startIcon={<IconPrinter size={18} />}
            sx={{ textTransform: 'none' }}
          >
            Print
          </Button>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableBody>
              {detailRows.map((row, i) => (
                <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>
                    {row.label}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    {row.isList ? (
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {row.value?.length > 0 ? (
                          row.value.map((item, idx) => (
                            <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                              {item}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">Not available</Typography>
                        )}
                      </Box>
                    ) : row.isLink ? (
                      row.value ? (
                        <Typography
                          component="a"
                          href={row.value}
                          target="_blank"
                          variant="body2"
                          color="primary"
                          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {row.value}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">Not available</Typography>
                      )
                    ) : (
                      <Typography variant="body2">
                        {row.value || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ textTransform: 'none', bgcolor: '#d8b4fe', color: '#581c87', '&:hover': { bgcolor: '#c084fc' } }}>
            Close
          </Button>
        </Box>
      </Card>
    </PageContainer>
  );
};

export default ViewSchemeDetails;
