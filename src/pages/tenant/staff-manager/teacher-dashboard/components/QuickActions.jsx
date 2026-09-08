import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Snackbar, Alert, useTheme } from "@mui/material";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

const actions = [
  {
    id: "attendance",
    label: "Take Attendance",
    icon: GroupAddOutlinedIcon,
    color: "#0d9488",
    bg: "#ccfbf1",
    path: "/attendance-psychomotor",
  },
  {
    id: "assignment",
    label: "Create Assignment",
    icon: AssignmentOutlinedIcon,
    color: "#7c3aed",
    bg: "#ede9fe",
    // No assignment-creation page exists yet — this used to point at "/",
    // which just reloaded the teacher's own dashboard.
    path: null,
  },
  {
    id: "quiz",
    label: "Create Quiz",
    icon: HelpOutlineOutlinedIcon,
    color: "#ea580c",
    bg: "#ffedd5",
    path: null,
  },
  {
    id: "upload",
    label: "Upload Resource",
    icon: CloudUploadOutlinedIcon,
    color: "#2563eb",
    bg: "#dbeafe",
    path: null,
  },
  {
    id: "timetable",
    label: "View Timetable",
    icon: CalendarMonthOutlinedIcon,
    color: "#334155",
    bg: "#e2e8f0",
    path: null,
  },
];

export default function QuickActions() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleActionClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setSnackbar({ open: true, message: `${item.label} — Page under development` });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: isDark ? theme.palette.background.paper : "#ffffff",
        border: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
        borderRadius: "14px",
        p: 1.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 14,
          mb: 1.25,
          letterSpacing: "-0.2px",
          color: isDark ? "#fff" : "#0f172a",
        }}
      >
        Quick Actions
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="outlined"
              disableElevation
              onClick={() => handleActionClick(item)}
              startIcon={<Icon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: "8px",
                px: 1.6,
                py: 0.65,
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "none",
                bgcolor: "transparent",
                color: item.color,
                borderColor: item.color,
                transition: "all 0.18s ease",
                "&:hover": {
                  bgcolor: isDark ? "rgba(255,255,255,0.06)" : `${item.color}0D`,
                  borderColor: item.color,
                  color: item.color,
                  transform: "translateY(-1px)",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "" })}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
