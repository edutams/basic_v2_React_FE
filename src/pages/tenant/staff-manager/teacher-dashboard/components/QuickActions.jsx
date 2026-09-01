import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, useTheme } from "@mui/material";
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
    path: "/",
  },
  {
    id: "quiz",
    label: "Create Quiz",
    icon: HelpOutlineOutlinedIcon,
    color: "#ea580c",
    bg: "#ffedd5",
    path: "/",
  },
  {
    id: "upload",
    label: "Upload Resource",
    icon: CloudUploadOutlinedIcon,
    color: "#2563eb",
    bg: "#dbeafe",
    path: "/",
  },
  {
    id: "timetable",
    label: "View Timetable",
    icon: CalendarMonthOutlinedIcon,
    color: "#334155",
    bg: "#e2e8f0",
    path: "/",
  },
];

export default function QuickActions() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const handleActionClick = (path) => {
    if (path) {
      navigate(path);
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
              variant="contained"
              disableElevation
              onClick={() => handleActionClick(item.path)}
              startIcon={<Icon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: "8px",
                px: 1.6,
                py: 0.65,
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "none",
                bgcolor: isDark ? "rgba(255,255,255,0.08)" : item.bg,
                color: item.color,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "transparent",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.18s ease",
                "&:hover": {
                  bgcolor: item.color,
                  color: "#ffffff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
