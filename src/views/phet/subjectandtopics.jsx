import React, { useState } from 'react';
import { Grid } from '@mui/material';
import SubjectTable from '../../components/phet/subjectandtopics/SubjectTable';
import TopicPanel from '../../components/phet/subjectandtopics/TopicPanel';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import AddSubjectModal from '../../components/phet/subjectandtopics/AddSubjectModal';
import SubjectModal from '../../components/phet/subjectandtopics/SubjectModal';
import TopicModal from '../../components/phet/subjectandtopics/TopicModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import useNotification from 'src/hooks/useNotification';

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
  const [topics, setTopics] = useState([
    { id: 1, subjectId: 1, name: 'Comprehension', code: 'ENG101', status: 'active' },
    { id: 2, subjectId: 1, name: 'Essay Writing', code: 'ENG102', status: 'active' },
    { id: 3, subjectId: 2, name: 'Algebra', code: 'MTH101', status: 'active' },
    { id: 4, subjectId: 2, name: 'Geometry', code: 'MTH102', status: 'active' },
  ]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('edit');
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicActionType, setTopicActionType] = useState('create');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  const notify = useNotification();

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleAddSubject = (newSubject) => {
    setSubjects((prev) => [
      ...prev,
      { ...newSubject, id: prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1 },
    ]);
    setAddModalOpen(false);
    notify.success('Subject added successfully', 'Success');
  };

  const handleSubjectAction = (type, subject) => {
    setModalType(type);
    setSelectedSubjectForModal(subject);
    setModalOpen(true);
  };

  const handleSubjectUpdate = (updated, type) => {
    if (type === 'edit') {
      setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      notify.success('Subject updated successfully', 'Success');
    } else if (type === 'delete') {
      setSubjects((prev) => prev.filter((s) => s.id !== updated.id));
      if (selectedSubject?.id === updated.id) {
        setSelectedSubject(null);
      }
      notify.success('Subject deleted successfully', 'Success');
    }
    setModalOpen(false);
  };

  const handleTopicAction = (action, topic) => {
    if (action === 'delete') {
      setTopicToDelete(topic);
      setConfirmDeleteOpen(true);
    } else {
      setTopicActionType(action);
      setSelectedTopic(topic || null);
      setTopicModalOpen(true);
    }
  };

  const handleTopicSubmit = (data, type) => {
    if (type === 'create') {
      const newTopic = {
        ...data,
        id: Date.now(),
        subjectId: selectedSubject.id,
      };
      setTopics((prev) => [...prev, newTopic]);
      notify.success('Topic added successfully', 'Success');
    } else if (type === 'update') {
      setTopics((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      notify.success('Topic updated successfully', 'Success');
    }
    setTopicModalOpen(false);
  };

  const handleDeleteTopicConfirmed = () => {
    if (topicToDelete) {
      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
      notify.success('Topic deleted successfully', 'Success');
      setTopicToDelete(null);
    }
    setConfirmDeleteOpen(false);
  };

  const filteredTopics = selectedSubject
    ? topics.filter((t) => t.subjectId === selectedSubject.id)
    : [];

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
            onSubjectAction={handleSubjectAction}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TopicPanel
            selectedSubject={selectedSubject}
            topics={filteredTopics}
            onAction={handleTopicAction}
          />
        </Grid>
      </Grid>

      <AddSubjectModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSubject}
      />

      <SubjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalType}
        selectedSubject={selectedSubjectForModal}
        onSubjectUpdate={handleSubjectUpdate}
      />

      <TopicModal
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        actionType={topicActionType}
        selectedTopic={selectedTopic}
        selectedSubject={selectedSubject}
        onTopicUpdate={handleTopicSubmit}
        isLoading={false}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteTopicConfirmed}
        title="Delete Topic"
        message={`Are you sure you want to delete the topic "${topicToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </PageContainer>
  );
};

export default SubjectTopicView;
