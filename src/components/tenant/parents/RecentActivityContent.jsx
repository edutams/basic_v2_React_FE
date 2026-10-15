import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Skeleton, Alert } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import aclApi from '@/api/tenant/acl/aclApi';

dayjs.extend(relativeTime);

/** This guardian's own activity feed — reuses the same
 * /activity-logs/causer/{id} endpoint already powering the staff/teacher/
 * parent dashboard "recent activity" widgets and the ACL user profile
 * drawer, scoped to this guardian's own user id. */
const RecentActivityContent = ({ guardian, limit = 15 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!guardian?.user_id) return;
    setLoading(true);
    setError(null);
    aclApi
      .getUserActivityLogs(guardian.user_id, { limit })
      .then((res) => setActivities(res?.data || []))
      .catch(() => setError('Failed to load recent activity'))
      .finally(() => setLoading(false));
  }, [guardian?.user_id, limit]);

  if (loading) {
    return (
      <Stack spacing={1}>
        {[...Array(Math.min(limit, 4))].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={44} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (activities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent activity for this guardian yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {activities.map((item) => (
        <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HistoryIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2">{item.description || 'Activity logged'}</Typography>
            <Typography variant="caption" color="text.disabled">
              {item.my_updated_at || (item.created_at ? dayjs(item.created_at).fromNow() : 'Recently')}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

RecentActivityContent.propTypes = {
  guardian: PropTypes.object,
  limit: PropTypes.number,
};

export default RecentActivityContent;
