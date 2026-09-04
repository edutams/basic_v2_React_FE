import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { IconHistory, IconSearch, IconX } from "@tabler/icons-react";
import tenantApi from "@/api/tenant/tenant_api";
import { useTenantAuth } from "@/hooks/useTenantAuth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const getActivityIcon = (type) => {
  switch (type) {
    case "document":
      return <DescriptionOutlinedIcon />;
    case "task":
      return <AssignmentTurnedInOutlinedIcon />;
    case "staff":
      return <GroupsOutlinedIcon />;
    case "folder":
      return <FolderOutlinedIcon />;
    case "resolved":
      return <CheckCircleOutlineOutlinedIcon />;
    default:
      return <DescriptionOutlinedIcon />;
  }
};

const getActivityStyles = (type) => {
  switch (type) {
    case "document":
      return { color: "#159a72", background: "#e8f8f3" };
    case "task":
      return { color: "#7446c8", background: "#f2ebff" };
    case "staff":
      return { color: "#2670c0", background: "#eaf2ff" };
    case "folder":
      return { color: "#e59a20", background: "#fff5e7" };
    case "resolved":
      return { color: "#159a72", background: "#e8f8f3" };
    default:
      return { color: "#667085", background: "#f2f4f7" };
  }
};

const formatActivityDate = (createdAt, myUpdatedAt) => {
  if (myUpdatedAt) return myUpdatedAt;
  if (!createdAt) return "—";
  return dayjs(createdAt).format("DD MMM YYYY [at] hh:mm A");
};

const ActivityLogs = ({ onViewAll }) => {
  const theme = useTheme();
  const { user } = useTenantAuth();
  const [loading, setLoading] = useState(true);
  const [activitiesList, setActivitiesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchUserActivities = async (isMounted = true) => {
    const causerId = user?.id || user?.user_id;
    if (!causerId) {
      if (isMounted) setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await tenantApi.get(`/activity-logs/causer/${causerId}?limit=5`);
      const rawList = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);

      if (isMounted) {
        const formatted = rawList.map((item) => {
          const description = item.description || "Activity logged";
          const logName = (item.log_name || item.event || "system").toLowerCase();

          let type = "document";
          if (logName.includes("task") || logName.includes("assignment")) type = "task";
          else if (logName.includes("staff") || logName.includes("user") || logName.includes("group")) type = "staff";
          else if (logName.includes("folder") || logName.includes("inventory")) type = "folder";
          else if (logName.includes("resolve") || logName.includes("complete") || logName.includes("check")) type = "resolved";
          else if (logName.includes("doc") || logName.includes("file")) type = "document";

          const timeStr = item.my_updated_at || (item.created_at ? dayjs(item.created_at).fromNow() : "Recently");

          return {
            id: item.id,
            type,
            title: description,
            category: item.log_name ? String(item.log_name).toUpperCase() : "ACTIVITY LOG",
            time: timeStr,
          };
        });

        setActivitiesList(formatted);
      }
    } catch (err) {
      console.warn("Could not fetch user activity logs:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchUserActivities(isMounted);
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "380px",
          minHeight: "380px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.08)",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          },
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.25, pt: 2.25, pb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>
            Activity Logs
          </Typography>
          <Button
            onClick={() => setOpenModal(true)}
            endIcon={<ArrowForwardIcon sx={{ fontSize: "14px !important" }} />}
            sx={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", textTransform: "none" }}
          >
            View All
          </Button>
        </Stack>

        {/* Log Items */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 2.25,
            pb: 2,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#d1d5db", borderRadius: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          }}
        >
          {loading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : activitiesList.length > 0 ? (
            <Stack spacing={1.75}>
              {activitiesList.map((activity, index) => {
                const styles = getActivityStyles(activity.type);
                return (
                  <Stack
                    key={activity.id || `${activity.title}-${index}`}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                    sx={{ transition: "transform 150ms ease", "&:hover": { transform: "translateX(2px)" } }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: styles.background,
                          color: styles.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {activity.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#6B7280", lineHeight: 1.3 }}>
                          {activity.category}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, flexShrink: 0 }}>
                      {activity.time}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ fontSize: "12px", borderRadius: "10px" }}>
              No recent activity logged for your account.
            </Alert>
          )}
        </Box>
      </Card>

      {/* Activity Log Modal */}
      <ActivityLogModal open={openModal} onClose={() => setOpenModal(false)} user={user} />
    </>
  );
};

const ActivityLogModal = ({ open, onClose, user }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const causerId = user?.id || user?.user_id;
  const fullName = user?.full_name || (user?.fname && user?.lname ? `${user.fname} ${user.lname}` : user?.name || "User");

  useEffect(() => {
    if (!open || !causerId) return;

    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await tenantApi.get(`/activity-logs/causer/${causerId}`, {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: searchQuery.trim() || undefined,
          },
        });

        if (isMounted) {
          const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
          const total = res?.data?.total || res?.data?.meta?.total || list.length;
          setLogs(list);
          setTotalCount(total);
        }
      } catch (err) {
        console.error("Failed to load user activity logs:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [open, causerId, page, rowsPerPage, searchQuery]);

  const handleSearchExecute = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchExecute();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              p: 1,
              borderRadius: 2,
              display: "flex",
            }}
          >
            <IconHistory size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              User Activity Log
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Audit trail of system activities performed by{" "}
              <Typography component="span" variant="caption" color="primary.main" fontWeight={700}>
                {fullName}
              </Typography>
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <IconX size={20} />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        {/* Search bar */}
        <Box mb={2} display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            fullWidth
            placeholder="Search user activities..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearchExecute}
            startIcon={<IconSearch size={16} />}
            sx={{ height: 38, px: 2.5, fontWeight: 600, flexShrink: 0, borderRadius: "8px", textTransform: "none" }}
          >
            Search
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress size={32} />
          </Box>
        ) : logs.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <IconHistory size={40} color={theme.palette.text.disabled} />
            <Typography variant="subtitle1" fontWeight={600} mt={1} color="text.secondary">
              {searchQuery ? `No Activity Records Found for "${searchQuery}"` : "No Activity Records Found"}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {searchQuery ? "Try searching for a different keyword or module name." : "There are no recorded system actions for this user yet."}
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 380 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 60, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Activity</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Date Performed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((item, idx) => (
                    <TableRow key={item.id || idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={item.log_name ? item.log_name.toUpperCase() : "SYSTEM"}
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              borderRadius: "6px",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                            }}
                          />
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {item.description || "System Activity Executed"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.775rem", whiteSpace: "nowrap", fontWeight: 500 }}>
                        {formatActivityDate(item.created_at, item.my_updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained" size="small" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityLogs;
