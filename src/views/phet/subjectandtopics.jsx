import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import SubjectTable from '../../components/phet/subjectandtopics/SubjectTable';
import TopicPanel from '../../components/phet/subjectandtopics/TopicPanel';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import AddSubjectModal from '../../components/phet/subjectandtopics/AddSubjectModal';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'PHET Stimulation' },
  { title: 'Subject & Topics' },
];

const SubjectTopicView = () => {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'English', code: 'ENG', status: 'active' },
    { id: 2, name: 'Mathematic', code: 'MTH', status: 'active' },
  ]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    // Load related topics
    // setTopics(fetchTopicsBySubject(subject.id))
  };

  const handleAddSubject = (newSubject) => {
    setSubjects((prev) => [
      ...prev,
      { ...newSubject, id: prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1 },
    ]);
    setAddModalOpen(false);
  };

  return (
    <PageContainer title="Manage Phet Subjects And Topics" description="View, edit and manage Phet subjects and their topics">
      <Breadcrumb title="Manage Phet Subjects And Topics" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SubjectTable
            subjects={subjects}
            onSelect={handleSubjectSelect}
            selectedId={selectedSubject?.id}
            onAddSubject={() => setAddModalOpen(true)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TopicPanel selectedSubject={selectedSubject} topics={topics} />
        </Grid>
      </Grid>
      <AddSubjectModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAddSubject} />
    </PageContainer>
  );
};

export default SubjectTopicView;
