import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";

// Mock data — replace with API data once the classes endpoint is ready.
const classesData = [
  {
    id: "ss2a",
    code: "SS2A",
    subject: "Mathematics",
    lessonsToday: 2,
    score: 78,
    students: 32,
    attendance: "93%",
    nextLessonLabel: "Next Lesson",
    nextLesson: "Tomorrow, 8:00 AM",
    color: "#16a34a",
    cardBg: "#f0fdf4",
    trackColor: "#dcfce7",
    iconBg: "#22c55e",
    symbol: "\u221Ax",
  },
  {
    id: "ss2b",
    code: "SS2B",
    subject: "Mathematics",
    lessonsToday: 1,
    score: 72,
    students: 30,
    attendance: "90%",
    nextLessonLabel: "Next Lesson",
    nextLesson: "Today, 9:00 AM",
    color: "#2563eb",
    cardBg: "#f0f9ff",
    trackColor: "#dbeafe",
    iconBg: "#3b82f6",
    symbol: "x\u00B2",
  },
  {
    id: "ss1c",
    code: "SS1C",
    subject: "Mathematics",
    lessonsToday: 2,
    score: 68,
    students: 33,
    attendance: "91%",
    nextLessonLabel: "Next Lesson",
    nextLesson: "Tomorrow, 11:00 AM",
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
    lessonsToday: 1,
    score: 76,
    students: 33,
    attendance: "94%",
    nextLessonLabel: "Next Lesson",
    nextLesson: "Today, 1:00 PM",
    color: "#ea580c",
    cardBg: "#fff7ed",
    trackColor: "#ffedd5",
    iconBg: "#f97316",
    symbol: null,
  },
];

function ScoreRing({ score, color, trackColor }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={68}
        thickness={4}
        sx={{ color: trackColor }}
      />
      <CircularProgress
        variant="determinate"
        value={score}
        size={68}
        thickness={4}
        sx={{
          color,
          position: "absolute",
          left: 0,
          "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
          {score}%
        </Typography>
      </Box>
    </Box>
  );
}

function ClassCard({ cls }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: "100%",
        bgcolor: cls.cardBg,
        borderColor: cls.color,
        borderWidth: 1.5,
        transition: "box-shadow 120ms ease, border-color 120ms ease",
        "&:hover": { boxShadow: 2, borderColor: cls.color },
      }}
    >
      <CardContent sx={{ p: 2.1, "&:last-child": { pb: 2.1 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: cls.iconBg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: cls.symbol ? 15 : 0,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {cls.symbol ?? <BarChartRoundedIcon sx={{ fontSize: 20 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                {cls.code}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {cls.subject}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" sx={{ mt: -0.5, mr: -0.5 }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Chip
          size="small"
          label={`Today: ${cls.lessonsToday} Lesson${cls.lessonsToday > 1 ? "s" : ""}`}
          sx={{
            mt: 1.5,
            bgcolor: cls.trackColor,
            color: cls.color,
            fontWeight: 600,
            fontSize: 11.5,
            height: 22,
          }}
        />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.75 }}>
          <ScoreRing score={cls.score} color={cls.color} trackColor={cls.trackColor} />
          <Stack spacing={0.9}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography sx={{ fontSize: 12.5 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {cls.students}
                </Box>{" "}
                Students
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FavoriteBorderIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography sx={{ fontSize: 12.5 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {cls.attendance}
                </Box>{" "}
                Attendance
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography sx={{ fontSize: 12.5 }}>
                {cls.nextLessonLabel}
                <br />
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {cls.nextLesson}
                </Box>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ClassesOverview() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>My Classes Overview</Typography>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ cursor: "pointer", color: "primary.main" }}
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
