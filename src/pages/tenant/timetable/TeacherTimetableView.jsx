import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { useNotification } from '@/hooks/useNotification';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import staffApi from '@/api/tenant/staffs/staffApi';
import { getSubjectColor } from '@/utils/subjectColor';
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Autocomplete,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const BCrumb = [{ to: '/school-dashboard', title: 'Home' }, { title: 'Teacher Timetable View' }];

const TeacherTimetableView = () => {
  const notify = useNotification();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await staffApi.getAll({ search: debouncedSearch, staff_type: 'teaching', per_page: 20 });
        setOptions(res.data?.data || []);
      } catch {
        notify.error('Failed to search teachers');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [debouncedSearch, notify]);

  const fetchSchedule = useCallback(
    async (userId) => {
      setScheduleLoading(true);
      try {
        const res = await timetableApi.getTeacherSchedule(userId);
        setSchedule(res.data.data || []);
      } catch {
        notify.error('Failed to load teacher schedule');
      } finally {
        setScheduleLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    if (selectedTeacher) {
      fetchSchedule(selectedTeacher.user_id);
    } else {
      setSchedule([]);
    }
  }, [selectedTeacher, fetchSchedule]);

  return (
    <PageContainer title="Teacher Timetable View" description="View any teacher's full weekly teaching schedule.">
      <Breadcrumb title="Teacher Timetable View" items={BCrumb} />

      <ParentCard title={<Typography variant="h5">Teacher View</Typography>}>
        <Autocomplete
          options={options}
          loading={optionsLoading}
          value={selectedTeacher}
          onChange={(_, value) => setSelectedTeacher(value)}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          getOptionLabel={(opt) => (opt.user ? `${opt.user.fname} ${opt.user.lname}` : '')}
          isOptionEqualToValue={(opt, value) => opt.user_id === value.user_id}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.user_id} sx={{ display: 'flex', gap: 1 }}>
              <Avatar src={option.user?.avatar} sx={{ width: 28, height: 28 }}>
                {option.user?.fname?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">{option.user ? `${option.user.fname} ${option.user.lname}` : '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.user_id}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for a teacher by name or staff ID..."
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
          sx={{ maxWidth: 420, mb: 2 }}
        />

        {!selectedTeacher ? (
          <Alert severity="info">Search for and select a teacher above to view their weekly schedule.</Alert>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Room</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scheduleLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton variant="text" height={28} />
                    </TableCell>
                  </TableRow>
                ))
              ) : schedule.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No periods assigned to this teacher yet.
                  </TableCell>
                </TableRow>
              ) : (
                schedule.map((row) => (
                  <TableRow key={row.slot_id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.period.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.period.start_time?.slice(0, 5)} - {row.period.end_time?.slice(0, 5)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.subject_name}
                        sx={{ bgcolor: getSubjectColor({ id: row.subject_name, color: row.subject_color }), color: '#fff', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{row.class_name}</TableCell>
                    <TableCell>{row.room_name || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </ParentCard>
    </PageContainer>
  );
};

export default TeacherTimetableView;
