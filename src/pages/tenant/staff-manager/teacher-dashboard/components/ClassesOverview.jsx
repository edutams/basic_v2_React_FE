import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import tenantApi from "@/api/tenant/tenant_api";

const colorPresets = [
  { color: "#16a34a", bg: "#f0fdf4", trackColor: "#dcfce7", iconBg: "#22c55e" },
  { color: "#2563eb", bg: "#f0f9ff", trackColor: "#dbeafe", iconBg: "#3b82f6" },
  { color: "#7c3aed", bg: "#f5f3ff", trackColor: "#ede9fe", iconBg: "#8b5cf6" },
  { color: "#ea580c", bg: "#fff7ed", trackColor: "#ffedd5", iconBg: "#f97316" },
  { color: "#0d9488", bg: "#ccfbf1", trackColor: "#99f6e4", iconBg: "#14b8a6" },
];

function ClassCard({ cls, idx }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const preset = colorPresets[idx % colorPresets.length];
  const color = cls.color || preset.color;
  const trackColor = cls.trackColor || preset.trackColor;
  const iconBg = cls.iconBg || preset.iconBg;

  const isSubject = cls.isSubject;
  const statVal = isSubject ? cls.performance : cls.attendance;
  const statNum = parseInt(statVal, 10) || 0;
  const displayText = `${statNum}%`;
  const statLabel = isSubject ? "Class Avg" : "Attendance";

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    if (path) navigate(path);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: "14px",
          height: "100%",
          bgcolor: "#ffffff",
          border: "1px solid",
          borderColor: "#cbd5e1",
          boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)",
          transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
          "&:hover": {
            transform: "translateY(-3px)",
            borderColor: "#94a3b8",
            boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)",
          },
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          {/* Top Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "10px",
                  bgcolor: iconBg,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MenuBookOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#1e293b", lineHeight: 1.2 }}>
                  {cls.code || cls.class_name || "Class"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#64748b", mt: 0.25, fontWeight: 500 }}>
                  {cls.subject || cls.subject_name || "Subject"}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ mt: -0.5, mr: -0.5, color: "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Bottom Stat Row */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2.5, pt: 1.75, borderTop: "1px solid", borderTopColor: "#f1f5f9" }}
          >
            {/* Students Column */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <PeopleOutlineIcon sx={{ fontSize: 20, color: "#1e1b4b" }} />
                <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0f172a", lineHeight: 1 }}>
                  {cls.students ?? cls.student_count ?? 0}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 500, mt: 0.5, pl: 3.5 }}>
                Students
              </Typography>
            </Box>

            {/* Vertical Divider */}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "#e2e8f0" }} />

            {/* 2nd Stat Column: Performance for Subject Teacher vs Attendance for Class Teacher */}
            <Box sx={{ flex: 1, pl: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={20}
                    thickness={5}
                    sx={{ color: trackColor }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={statNum}
                    size={20}
                    thickness={5}
                    sx={{
                      color: color,
                      position: "absolute",
                      left: 0,
                      "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0f172a", lineHeight: 1 }}>
                  {displayText}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 500, mt: 0.5, pl: 3.5 }}>
                {statLabel}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Class Action Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 160, mt: 0.5 },
        }}
      >
        {!isSubject && (
          <MenuItem onClick={() => handleNavigate("/attendance-psychomotor")}>
            <ListItemIcon>
              <HowToRegOutlinedIcon fontSize="small" sx={{ color: "#0d9488" }} />
            </ListItemIcon>
            <ListItemText primary="Take Attendance" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
          </MenuItem>
        )}
        <MenuItem onClick={() => handleNavigate("/class-register")}>
          <ListItemIcon>
            <ClassOutlinedIcon fontSize="small" sx={{ color: "#2563eb" }} />
          </ListItemIcon>
          <ListItemText primary="Class Register" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/subject-registration")}>
          <ListItemIcon>
            <MenuBookOutlinedIcon fontSize="small" sx={{ color: "#7c3aed" }} />
          </ListItemIcon>
          <ListItemText primary="Subject Setup" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
        </MenuItem>
      </Menu>
    </>
  );
}

export default function ClassesOverview() {
  const navigate = useNavigate();
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMyAllocations = async () => {
      try {
        setLoading(true);

        const res = await tenantApi.get("/allocations/my-allocations");
        const payload = res?.data?.data || res?.data || {};

        const rawSubjects = Array.isArray(payload.subject_allocations) ? payload.subject_allocations : [];
        const rawClasses = Array.isArray(payload.class_allocations) ? payload.class_allocations : [];

        // Mark subjects as subject allocations, and classes as class allocations
        const subjects = rawSubjects.map((item) => ({ ...item, is_subject: true }));
        const classes = rawClasses.map((item) => ({ ...item, is_subject: false }));

        const combined = [...subjects, ...classes];

        if (isMounted) {
          if (combined.length > 0) {
            const mapped = combined.map((item, index) => {
              const classArm = item.class_arm || item.classArm;
              const className =
                classArm?.programme_class?.class?.class_name ||
                classArm?.programmeClass?.class?.class_name;
              const armName = classArm?.arm_names || classArm?.arm_name;

              const fullClassName =
                className && armName
                  ? `${className} - ${armName}`
                  : className || armName || item.code || `Class ${index + 1}`;

              const isSubject = Boolean(item.is_subject || item.subject_id || item.subject?.id);

              const subjectTitle =
                item.subject?.subject_name ||
                item.subject_name ||
                (isSubject ? "Subject" : "Class Teacher");

              const studentCount =
                item.student_count !== undefined && item.student_count !== null
                  ? Number(item.student_count)
                  : item.students_count !== undefined
                    ? Number(item.students_count)
                    : item.students !== undefined
                      ? Number(item.students)
                      : 0;

              return {
                id: item.id || index,
                code: fullClassName,
                subject: subjectTitle,
                isSubject: isSubject,
                students: studentCount,
                attendance: item.attendance || "92%",
                performance: item.performance || "88%",
              };
            });
            setClassesList(mapped);
          } else {
            setClassesList([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch logged-in teacher allocations:", err);
        if (isMounted) setClassesList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyAllocations();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: "#1e293b" }}>
          My Classes Overview
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/class-register")}
          sx={{
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View all classes
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress size={32} />
        </Box>
      ) : classesList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed #cbd5e1",
            borderRadius: 2,
            bgcolor: "#f8fafc",
          }}
        >
          <ClassOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
            No Classes Allocated Yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            You do not have any active subject or class allocations assigned for this session term.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {classesList.map((cls, idx) => (
            <Box key={cls.id || idx} sx={{ minWidth: 0, height: "100%" }}>
              <ClassCard cls={cls} idx={idx} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
