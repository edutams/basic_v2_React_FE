import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

const classesData = [
  {
    id: "ss2a",
    code: "SS2A",
    subject: "Mathematics",
    students: 32,
    attendance: "93%",
    color: "#16a34a",
    cardBg: "#f0fdf4",
    trackColor: "#dcfce7",
    iconBg: "#22c55e",
    symbol: "√x",
  },
  {
    id: "ss2b",
    code: "SS2B",
    subject: "Mathematics",
    students: 30,
    attendance: "90%",
    color: "#2563eb",
    cardBg: "#f0f9ff",
    trackColor: "#dbeafe",
    iconBg: "#3b82f6",
    symbol: "x²",
  },
  {
    id: "ss1c",
    code: "SS1C",
    subject: "Mathematics",
    students: 33,
    attendance: "91%",
    color: "#7c3aed",
    cardBg: "#f5f3ff",
    trackColor: "#ede9fe",
    iconBg: "#8b5cf6",
    symbol: "f(x)",
  },
  {
    id: "ss1a",
    code: "SS1A",
    subject: "Mathematics",
    students: 33,
    attendance: "94%",
    color: "#ea580c",
    cardBg: "#fff7ed",
    trackColor: "#ffedd5",
    iconBg: "#f97316",
    symbol: null,
  },
];

function ClassCard({ cls }) {
  const attendanceNum = parseInt(cls.attendance, 10) || cls.attendance;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "12px",
        height: "100%",
        bgcolor: cls.cardBg,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.12)",
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
                bgcolor: cls.iconBg || cls.color,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: cls.symbol ? 16 : 0,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {cls.symbol ?? <BarChartRoundedIcon sx={{ fontSize: 24 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#1e293b", lineHeight: 1.2 }}>
                {cls.code}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#64748b", mt: 0.25, fontWeight: 500 }}>
                {cls.subject}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" sx={{ mt: -0.5, mr: -0.5, color: "#64748b" }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Bottom Stat Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2.5 }}
        >
          {/* Students Column */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <PeopleOutlineIcon sx={{ fontSize: 20, color: "#1e1b4b" }} />
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0f172a", lineHeight: 1 }}>
                {cls.students}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 500, mt: 0.5, pl: 3.5 }}>
              Students
            </Typography>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "#cbd5e1" }} />

          {/* Attendance Column */}
          <Box sx={{ flex: 1, pl: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={20}
                  thickness={5}
                  sx={{ color: cls.trackColor || "#e2e8f0" }}
                />
                <CircularProgress
                  variant="determinate"
                  value={attendanceNum}
                  size={20}
                  thickness={5}
                  sx={{
                    color: cls.color,
                    position: "absolute",
                    left: 0,
                    "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0f172a", lineHeight: 1 }}>
                {attendanceNum}%
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 500, mt: 0.5, pl: 3.5 }}>
              Attendance
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ClassesOverview() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: "#1e293b" }}>
          My Classes Overview
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ cursor: "pointer", color: "#06b6d4", "&:hover": { textDecoration: "underline" } }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>View all classes</Typography>
          <ArrowForwardIcon sx={{ fontSize: 15 }} />
        </Stack>
      </Stack>

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
        {classesData.map((cls) => (
          <Box key={cls.id} sx={{ minWidth: 0, height: "100%" }}>
            <ClassCard cls={cls} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
