import React, { useState, useEffect } from 'react';
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
import phetApi from 'src/api/phet/phetApi';
import ParentCard from 'src/components/shared/ParentCard';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'PHET Stimulation' },
  { title: 'Subject & Topics' },
];

const SubjectTopicView = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
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

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch topics when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchTopicsBySubject(selectedSubject.id);
    } else {
      setTopics([]);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await phetApi.getSubjects();
      setSubjects(response || []);
    } catch (error) {
      // console.error('Error fetching subjects:', error);
      notify.error('Failed to load subjects', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsBySubject = async (subjectId) => {
    try {
      setTopicsLoading(true);
      const response = await phetApi.getTopicsBySubject(subjectId);
      // console.log('Topics response:', response);
      setTopics(response || []);
    } catch (error) {
      // console.error('Error fetching topics:', error);
      notify.error('Failed to load topics', 'Error');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleAddSubject = async (newSubject) => {
    try {
      // Map frontend field names to backend field names
      const apiData = {
        subject_name: newSubject.name,
        subject_code: newSubject.code,
        status: newSubject.status,
      };
      const createdSubject = await phetApi.createSubject(apiData);
      setSubjects((prev) => [...prev, createdSubject]);
      setAddModalOpen(false);
      notify.success('Subject added successfully', 'Success');
    } catch (error) {
      // console.error('Error adding subject:', error);
      notify.error('Failed to add subject', 'Error');
    }
  };

  const handleSubjectAction = (type, subject) => {
    setModalType(type);
    setSelectedSubjectForModal(subject);
    setModalOpen(true);
  };

  const handleSubjectUpdate = async (updated, type) => {
    try {
      if (type === 'edit') {
        // Map frontend field names to backend field names
        const apiData = {
          subject_name: updated.name,
          subject_code: updated.code,
          status: updated.status,
        };
        const result = await phetApi.updateSubject(updated.id, apiData);
        setSubjects((prev) => prev.map((s) => (s.id === updated.id ? result : s)));
        notify.success('Subject updated successfully', 'Success');
      } else if (type === 'delete') {
        await phetApi.deleteSubject(updated.id);
        setSubjects((prev) => prev.filter((s) => s.id !== updated.id));
        if (selectedSubject?.id === updated.id) {
          setSelectedSubject(null);
        }
        notify.success('Subject deleted successfully', 'Success');
      }
      setModalOpen(false);
    } catch (error) {
      // console.error('Error updating subject:', error);
      notify.error('Failed to update subject', 'Error');
    }
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

  const handleTopicSubmit = async (data, type) => {
    try {
      if (type === 'create') {
        // Map frontend field names to backend field names
        const apiData = {
          topic: data.topic,
          subject_id: selectedSubject.id,
          status: data.status,
        };
        const newTopic = await phetApi.createTopic(apiData);
        setTopics((prev) => [...prev, newTopic]);
        notify.success('Topic added successfully', 'Success');
      } else if (type === 'update') {
        const apiData = {
          topic: data.topic,
          status: data.status,
        };
        const result = await phetApi.updateTopic(data.id, apiData);
        setTopics((prev) => prev.map((t) => (t.id === data.id ? result : t)));
        notify.success('Topic updated successfully', 'Success');
      }
      setTopicModalOpen(false);
    } catch (error) {
      // console.error('Error submitting topic:', error);
      notify.error('Failed to submit topic', 'Error');
    }
  };

  const handleDeleteTopicConfirmed = async () => {
    if (topicToDelete) {
      try {
        await phetApi.deleteTopic(topicToDelete.id);
        setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
        notify.success('Topic deleted successfully', 'Success');
        setTopicToDelete(null);
      } catch (error) {
        // console.error('Error deleting topic:', error);
        notify.error('Failed to delete topic', 'Error');
      }
    }
    setConfirmDeleteOpen(false);
  };

  const filteredTopics = selectedSubject
    ? topics.filter(
        (t) =>
          t.phet_subject_id === selectedSubject.id ||
          t.subject_id === selectedSubject.id ||
          t.subjectId === selectedSubject.id,
      )
    : [];

  return (
    <PageContainer
      title="Manage Phet Subjects And Topics"
      description="View, edit and manage Phet subjects and their topics"
    >
      <Breadcrumb title="Manage Phet Subjects And Topics" items={BCrumb} />
      <ParentCard>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SubjectTable
              subjects={subjects}
              onSelect={handleSubjectSelect}
              selectedId={selectedSubject?.id}
              onAddSubject={() => setAddModalOpen(true)}
              onSubjectAction={handleSubjectAction}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TopicPanel
              selectedSubject={selectedSubject}
              topics={filteredTopics}
              onAction={handleTopicAction}
              isLoading={topicsLoading}
            />
          </Grid>
        </Grid>
      </ParentCard>

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
        isLoading={loading}
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
