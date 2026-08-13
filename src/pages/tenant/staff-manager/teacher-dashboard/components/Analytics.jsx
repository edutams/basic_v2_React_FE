import { Box, Grid, Stack, Typography, MenuItem, Select, FormControl } from "@mui/material";
import { useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

// Mock data — swap for the real analytics endpoint when it's available.
const weeks = ["Week 7", "Week 8", "Week 9", "Week 10", "Week 11"];

const performanceSeries = [
  { id: "SS2A", label: "SS2A", color: "#16a34a", data: [62, 70, 58, 75, 87] },
  { id: "SS2B", label: "SS2B", color: "#2563eb", data: [50, 58, 63, 70, 78] },
  { id: "SS1C", label: "SS1C", color: "#7c3aed", data: [30, 45, 42, 55, 52] },
  { id: "SS1A", label: "SS1A", color: "#e11d48", data: [45, 38, 52, 30, 28] },
];

const engagementData = [
  { key: "Assignments Created", short: "Assignments", value: 87, count: 24, color: "#16a34a", icon: AssignmentTurnedInOutlinedIcon },
  { key: "Quizzes Created", short: "Quizzes", value: 71, count: 18, color: "#ea580c", icon: HelpOutlineOutlinedIcon },
  { key: "Lesson Notes Created", short: "Lesson Notes", value: 78, count: 36, color: "#7c3aed", icon: DescriptionOutlinedIcon },
  { key: "Videos Created", short: "Videos", value: 78, count: 12, color: "#e11d48", icon: PlayCircleOutlineOutlinedIcon },
];

function ChartPanel({ title, right, children, accentColor }) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: "10px",
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
        },
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.15 }}>{title}</Typography>
          {right}
        </Stack>
        {children}
      </Box>
      <Box sx={{ pt: 1.5, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "primary.main",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          View detailed analytics →
        </Typography>
      </Box>
    </Box>
  );
}

function PerformanceChart() {
  const [term, setTerm] = useState("This Term");

  return (
    <ChartPanel
      title="Class Performance Overview"
      accentColor="#16a34a"
      right={
        <FormControl size="small">
          <Select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            sx={{ fontSize: 12.5, height: 30, "& .MuiSelect-select": { py: 0.5 } }}
          >
            <MenuItem value="This Term">This Term</MenuItem>
            <MenuItem value="Last Term">Last Term</MenuItem>
          </Select>
        </FormControl>
      }
    >
      <LineChart
        height={190}
        series={performanceSeries.map((s) => ({
          id: s.id,
          label: s.label,
          data: s.data,
          color: s.color,
          curve: "linear",
          showMark: true,
          markSize: 4,
          lineWidth: 2.2,
        }))}
        xAxis={[
          {
            scaleType: "point",
            data: weeks,
            tickLabelStyle: { fontSize: 10.5, fill: "#64748b" },
            tickSize: 0,
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            tickValues: [0, 25, 50, 75, 100],
            tickLabelStyle: { fontSize: 10.5, fill: "#64748b" },
            tickSize: 0,
          },
        ]}
        margin={{ left: 22, right: 8, top: 10, bottom: 18 }}
        grid={{ vertical: false, horizontal: true }}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "top", horizontal: "start" },
            padding: 0,
            itemMarkWidth: 7,
            itemMarkHeight: 7,
            labelStyle: { fontSize: 10.5, fill: "#475569" },
          },
        }}
      />
    </ChartPanel>
  );
}

function EngagementChart() {
  return (
    <ChartPanel title="Teaching Engagement (This Term)" accentColor="#7c3aed" right={<Typography sx={{ fontSize: 12, color: "text.secondary" }}>This Term</Typography>}>
      <BarChart
        height={138}
        series={engagementData.map((d) => ({
          id: d.key,
          label: d.short,
          data: [d.value],
          color: d.color,
          valueFormatter: (value) => `${value}%`,
        }))}
        xAxis={[
          {
            scaleType: "band",
            data: ["This Term"],
            tickLabelStyle: { fontSize: 10.5, fill: "#64748b" },
            tickSize: 0,
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            tickValues: [0, 25, 50, 75, 100],
            tickLabelStyle: { fontSize: 10.5, fill: "#64748b" },
            tickSize: 0,
          },
        ]}
        margin={{ left: 20, right: 8, top: 8, bottom: 18 }}
        grid={{ vertical: false, horizontal: true }}
        borderRadius={6}
        slotProps={{ legend: { hidden: true } }}
      />
      <Grid container spacing={0.75} sx={{ mt: 0.25 }}>
        {engagementData.map((d) => {
          const Icon = d.icon;
          return (
            <Grid key={d.key} item xs={3}>
              <Stack alignItems="center" spacing={0.25}>
                <Icon sx={{ fontSize: 15, color: d.color }} />
                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{d.count}</Typography>
                <Typography sx={{ fontSize: 9.5, color: "text.secondary", textAlign: "center", lineHeight: 1.2 }}>
                  {d.short}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </ChartPanel>
  );
}

export { PerformanceChart, EngagementChart };

export default function Analytics() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
        },
        gap: 2.5,
        height: "100%",
      }}
    >
      <Box sx={{ minWidth: 0, height: "100%" }}>
        <PerformanceChart />
      </Box>
      <Box sx={{ minWidth: 0, height: "100%" }}>
        <EngagementChart />
      </Box>
    </Box>
  );
}
