import { useState } from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import StatCardBreakdownModal from "./StatCardBreakdownModal";

// Mock data — replace with real aggregate stats once the API is wired up.
const stats = [
  {
    id: "students",
    value: "128",
    label: "Total Students",
    sub: "Across all classes",
    icon: PeopleAltOutlinedIcon,
    color: "#2563eb",
    iconBg: "#dbeafe",
    cardBg: "#f0f9ff",
    borderColor: "#2563eb",
  },
  {
    id: "assignments",
    value: "12",
    label: "Assignments",
    sub: "Pending grading",
    icon: AssignmentOutlinedIcon,
    color: "#7c3aed",
    iconBg: "#ede9fe",
    cardBg: "#f5f3ff",
    borderColor: "#7c3aed",
  },
  {
    id: "quizzes",
    value: "5",
    label: "Quizzes",
    sub: "Scheduled",
    icon: QuizOutlinedIcon,
    color: "#2563eb",
    iconBg: "#dbeafe",
    cardBg: "#f0f9ff",
    borderColor: "#2563eb",
  },
  {
    id: "attendance",
    value: "92%",
    label: "Overall Attendance",
    sub: "This Term",
    icon: CheckCircleOutlinedIcon,
    color: "#16a34a",
    iconBg: "#dcfce7",
    cardBg: "#f0fdf4",
    borderColor: "#16a34a",
    trend: { direction: "up", value: "5.2%" },
  },
  {
    id: "score",
    value: "74%",
    label: "Average Score",
    sub: "This Term",
    icon: TrendingUpOutlinedIcon,
    color: "#e11d48",
    iconBg: "#ffe4e6",
    cardBg: "#fef2f2",
    borderColor: "#e11d48",
    trend: { direction: "up", value: "6.4%" },
  },
  {
    id: "underperforming",
    value: "7",
    label: "Underperforming",
    sub: "Students",
    icon: EmojiEventsOutlinedIcon,
    color: "#0d9488",
    iconBg: "#ccfbf1",
    cardBg: "#f0fdfa",
    borderColor: "#0d9488",
    trend: { direction: "down", value: "1" },
  },
];

export default function StatCards() {
  const [selectedStat, setSelectedStat] = useState(null);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 1.75,
        }}
      >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend?.direction === "up" ? ArrowUpwardIcon : ArrowDownwardIcon;
        const trendColor = stat.trend?.direction === "up" ? "success.main" : "error.main";

        return (
          <Box key={stat.id} sx={{ minWidth: 0, height: "100%" }}>
            <Tooltip title="Click to view breakdown" placement="top" arrow>
              <Box
                onClick={() => setSelectedStat(stat)}
                sx={{
                  bgcolor: `${stat.color}0f`,
                  border: "1px solid",
                  borderColor: `${stat.color}26`,
                  borderRadius: "12px",
                  p: 1.5,
                  height: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)",
                  transition: "background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease",
                  "&:hover": {
                    bgcolor: `${stat.color}1a`,
                    borderColor: `${stat.color}40`,
                    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    bgcolor: stat.iconBg,
                    color: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid",
                    borderColor: `${stat.color}26`,
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.25,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 24,
                      lineHeight: 1.1,
                      color: "text.primary",
                      mt: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "text.secondary",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {stat.sub}
                    </Typography>
                    {stat.trend && (
                      <Stack direction="row" alignItems="center" sx={{ color: trendColor, fontSize: 10, flexShrink: 0 }}>
                        <TrendIcon sx={{ fontSize: 11 }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "inherit" }}>
                          {stat.trend.value}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
              </Box>
            </Tooltip>
          </Box>
        );
      })}
      </Box>

      <StatCardBreakdownModal
        open={Boolean(selectedStat)}
        stat={selectedStat}
        onClose={() => setSelectedStat(null)}
      />
    </>
  );
}
