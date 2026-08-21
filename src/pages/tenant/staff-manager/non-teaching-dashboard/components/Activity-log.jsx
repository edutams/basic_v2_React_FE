import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
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

import { IconHistory, IconSearch, IconX, IconEye } from "@tabler/icons-react";

import tenantApi from "@/api/tenant/tenant_api";
import { useTenantAuth } from "@/hooks/useTenantAuth";
import ParentCard from "@/components/shared/ParentCard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ActivityLog = ({ onViewAll }) => {
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
        const causerName = user?.full_name || (user?.fname && user?.lname ? `${user.fname} ${user.lname}` : "User");

        const formatted = rawList.map((item) => {
          let description = item.description || "Activity logged";
          if (description.startsWith(" performed action as")) {
            description = `${causerName}${description}`;
          }

          const logName = (item.log_name || item.event || "system").toLowerCase();

          let type = "document";
          if (logName.includes("task") || logName.includes("assignment")) type = "task";
          else if (logName.includes("staff") || logName.includes("user") || logName.includes("group") || logName.includes("tenant")) type = "staff";
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

  const handleViewAllClick = () => {
    setOpenModal(true);
    if (onViewAll) {
      onViewAll();
    }
  };

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

  return (
    <>
      <ParentCard>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: { xs: 2, md: 2.5 },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "15px", sm: "16px" },
              fontWeight: 700,
              color: "#182230",
            }}
          >
            Activity Log
          </Typography>

          <Button
            onClick={handleViewAllClick}
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: "14px !important" }} />}
            sx={{
              fontSize: { xs: "10px", sm: "11px" },
            }}
          >
            View all logs
          </Button>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : activitiesList.length > 0 ? (
            activitiesList.map((activity, index) => {
              const styles = getActivityStyles(activity.type);

              return (
                <Box
                  key={activity.id || `${activity.title}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1.2, sm: 1.5 },
                    py: { xs: 1.15, sm: 1.3 },
                    borderBottom:
                      index !== activitiesList.length - 1
                        ? "1px solid #f2f4f7"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 34, sm: 38 },
                      height: { xs: 34, sm: 38 },
                      minWidth: { xs: 34, sm: 38 },
                      borderRadius: "9px",
                      backgroundColor: styles.background,
                      color: styles.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& svg": {
                        fontSize: { xs: 17, sm: 19 },
                      },
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "9px", sm: "10px", md: "11px" },
                        fontWeight: 600,
                        color: "#344054",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {activity.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        fontSize: { xs: "8px", sm: "9px" },
                        color: "#98a2b3",
                        lineHeight: 1.3,
                      }}
                    >
                      {activity.category}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      alignSelf: "flex-start",
                      mt: 0.3,
                      minWidth: { xs: 55, sm: 70 },
                      textAlign: "right",
                      fontSize: { xs: "7px", sm: "8px", md: "9px" },
                      color: "#667085",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Box sx={{ py: 2 }}>
              <Alert severity="info" sx={{ fontSize: "12px", borderRadius: "10px" }}>
                No recent activity logged for your account.
              </Alert>
            </Box>
          )}
        </Box>
      </ParentCard>

      <ActivityLogModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        user={user}
      />
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
  const [selectedDetail, setSelectedDetail] = useState(null);

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
        console.error("Failed to load causer activity logs:", err);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatActivityDate = (createdAt, myUpdatedAt) => {
    if (myUpdatedAt) return myUpdatedAt;
    if (!createdAt) return "—";
    return dayjs(createdAt).format("DD MMM YYYY [at] hh:mm A");
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                      <TableCell sx={{ fontWeight: 700, width: 140, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Date Performed</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.100" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((item, idx) => (
                      <TableRow key={item.id || idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem" }}>
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.log_name ? item.log_name.toUpperCase() : "SYSTEM"}
                            color="primary"
                            sx={{
                              height: 22,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              borderRadius: "6px",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {item.description?.startsWith(" performed action as")
                              ? `${fullName}${item.description}`
                              : item.description || "System Activity Executed"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.775rem", whiteSpace: "nowrap", fontWeight: 500 }}>
                          {formatActivityDate(item.created_at, item.my_updated_at)}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<IconEye size={15} />}
                            onClick={() => setSelectedDetail(item)}
                            sx={{
                              borderRadius: "8px",
                              fontSize: "0.725rem",
                              fontWeight: 600,
                              textTransform: "none",
                              px: 1.25,
                              py: 0.25,
                              whiteSpace: "nowrap",
                            }}
                          >
                            View Details
                          </Button>
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
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
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

      {/* Activity Log Details Dialog matching UserProfileDrawer.jsx */}
      <Dialog
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Activity Details
          <IconButton onClick={() => setSelectedDetail(null)}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDetail && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                  Basic Information
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: "150px" }}>Description</TableCell>
                      <TableCell>{selectedDetail.description || "—"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action By</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            color: "primary.main",
                            fontWeight: 600,
                          }}
                        >
                          {selectedDetail.causer?.full_name ||
                            (selectedDetail.causer?.fname && selectedDetail.causer?.lname
                              ? `${selectedDetail.causer.fname} ${selectedDetail.causer.lname}`
                              : selectedDetail.causer?.name || fullName || "System")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Log Name</TableCell>
                      <TableCell>{selectedDetail.log_name || "default"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date Performed</TableCell>
                      <TableCell>{formatActivityDate(selectedDetail.created_at, selectedDetail.my_updated_at)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              {selectedDetail.properties && Object.keys(selectedDetail.properties).length > 0 ? (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                    Additional Information
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={700}>What changed</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={700}>Value Changed</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(selectedDetail.properties).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                              {key}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(value) ? (
                                value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ")
                              ) : typeof value === "boolean" ? (
                                value ? "True" : "False"
                              ) : typeof value === "object" && value !== null ? (
                                <pre
                                  style={{
                                    margin: 0,
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                String(value)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Typography color="text.secondary" fontStyle="italic" mt={2}>
                  No additional properties available for this activity.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDetail(null)} color="primary" variant="contained" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActivityLog;
