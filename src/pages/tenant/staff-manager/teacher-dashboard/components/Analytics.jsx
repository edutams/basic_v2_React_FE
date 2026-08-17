import React from "react";
import { Box, Grid, Stack, Typography, Divider } from "@mui/material";
import ReusableGaugeChart from "@/components/shared/charts/ReusableGaugeChart";
import {
  EmojiEventsOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";

const daysData = {
  daysPassed: 68,
  schoolDays: 47,
  daysRemaining: 21,
  totalDays: 89,
  termEndDate: "July 30, 2026",
};

const teachingEngagementData = [
  {
    id: "ss2a",
    classLabel: "SS2A",
    subjectLabel: "(Mathematics)",
    assignments: 28,
    quizzes: 18,
    resources: 22,
    tests: 12,
  },
  {
    id: "ss2b",
    classLabel: "SS2B",
    subjectLabel: "(Mathematics)",
    assignments: 26,
    quizzes: 16,
    resources: 20,
    tests: 14,
  },
  {
    id: "ss1c",
    classLabel: "SS1C",
    subjectLabel: "(Mathematics)",
    assignments: 30,
    quizzes: 20,
    resources: 24,
    tests: 15,
  },
  {
    id: "ss1a",
    classLabel: "SS1A",
    subjectLabel: "(Mathematics)",
    assignments: 27,
    quizzes: 17,
    resources: 21,
    tests: 13,
  },
];

const metricLegend = [
  { label: "Assignments", color: "#16a34a" },
  { label: "Quizzes", color: "#7c3aed" },
  { label: "Resources", color: "#2563eb" },
  { label: "Tests", color: "#f97316" },
];

const panelSx = {
  bgcolor: "#fff",
  border: "1px solid",
  borderColor: "grey.200",
  borderRadius: "10px",
  p: 2.5,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  },
};

function TeachingEngagementChart() {
  const maxVal = 40;
  const yTicks = [40, 30, 20, 10, 0];

  return (
    <Box sx={panelSx}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3, color: "#1e293b", mb: 1.5 }}>
          Teaching Engagement <Typography component="span" sx={{ color: "#7c3aed", fontWeight: 700, fontSize: 17 }}>(This Term)</Typography>
        </Typography>

        {/* Legend */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start" sx={{ mb: 2, px: 0.5 }}>
          {metricLegend.map((item) => (
            <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: item.color }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#475569" }}>
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Grouped Bar Chart Area */}
        <Box sx={{ position: "relative", pt: 1, pb: 4.5, px: 0.5 }}>
          {/* Y Axis & Gridlines */}
          <Box sx={{ position: "relative", height: 160, ml: 3.5 }}>
            {yTicks.map((val, idx) => (
              <Box
                key={val}
                sx={{
                  position: "absolute",
                  top: `${(idx / (yTicks.length - 1)) * 100}%`,
                  left: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    left: -28,
                    fontSize: 10,
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {val}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    borderTop: "1px dashed #f1f5f9",
                  }}
                />
              </Box>
            ))}

            {/* Bars */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                px: 1,
              }}
            >
              {teachingEngagementData.map((cls) => (
                <Box
                  key={cls.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    position: "relative",
                  }}
                >
                  {/* 4 bars group */}
                  <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: "100%" }}>
                    {metricLegend.map((m) => {
                      const metricKey = m.label.toLowerCase();
                      const val = cls[metricKey];
                      const pct = (val / maxVal) * 100;
                      return (
                        <Box
                          key={m.label}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#334155",
                              mb: 0.25,
                              lineHeight: 1,
                            }}
                          >
                            {val}
                          </Typography>
                          <Box
                            sx={{
                              width: { xs: 8, sm: 10, md: 12 },
                              height: `${pct}%`,
                              bgcolor: m.color,
                              borderRadius: "3px 3px 0 0",
                              transition: "height 300ms ease",
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>

                  {/* X-axis Label below bars */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -38,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                      {cls.classLabel}
                    </Typography>
                    <Typography sx={{ fontSize: 9.5, color: "#64748b", fontWeight: 500, lineHeight: 1.2 }}>
                      {cls.subjectLabel}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Banner */}
      <Box
        sx={{
          mt: 2,
          bgcolor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 2,
          py: 1,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <EmojiEventsOutlined sx={{ fontSize: 18, color: "#16a34a" }} />
        <Typography sx={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>
          Great job! You've been very active this term.
        </Typography>
      </Box>
    </Box>
  );
}

function DaysInTermChart() {
  const percentageCompleted = Math.round((daysData.daysPassed / daysData.totalDays) * 100);

  return (
    <Box sx={panelSx}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3, color: "#1e293b", mb: 2 }}>
          Days in the Term
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
          <ReusableGaugeChart
            value={percentageCompleted}
            label="Completed"
            height={190}
            width={190}
            colorRanges={[
              { from: 0, to: 100, color: "#16a34a" },
            ]}
          />
        </Box>

        {/* 3 Stats Columns with Vertical Dividers */}
        <Stack direction="row" alignItems="center" justifyContent="space-around" sx={{ mt: 2, px: 1 }}>
          <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
              {daysData.daysPassed}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
              Days Passed
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

          <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#059669", lineHeight: 1 }}>
              {daysData.schoolDays}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
              School Days
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

          <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
              {daysData.daysRemaining}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
              Days Remaining
            </Typography>
          </Stack>
        </Stack>

        {/* Term Ends Banner */}
        <Box
          sx={{
            mt: 2.5,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            py: 1.25,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <CalendarTodayOutlined sx={{ fontSize: 18, color: "#16a34a" }} />
          <Typography sx={{ fontSize: 13, color: "#1e1b4b", fontWeight: 600 }}>
            Term Ends: {daysData.termEndDate}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export { TeachingEngagementChart as PerformanceChart, TeachingEngagementChart, DaysInTermChart };

export default function Analytics() {
  return (
    <Stack spacing={2.5}>
      {/* Teaching Engagement + Days in Term */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
          <TeachingEngagementChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
          <DaysInTermChart />
        </Grid>
      </Grid>
    </Stack>
  );
}