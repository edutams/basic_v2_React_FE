import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Stack,
  Typography,
  Divider,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ReusableGaugeChart from "@/components/shared/charts/ReusableGaugeChart";
import {
  EmojiEventsOutlined,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import dayjs from "dayjs";

import tenantApi from "@/api/tenant/tenant_api";
import { fetchSessionTerms } from "@/api/tenant/session-term/sessionTermApi";
import { fetchWeeks } from "@/api/tenant/term-weeks/weekApi";
import { fetchHolidays } from "@/api/tenant/holidays/holidayApi";


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

// Helper to format session term labels
const termLabel = (t) =>
  [t?.session?.sesname, t?.display_term?.display_name].filter(Boolean).join(" · ") ||
  "This Term";

// Reusable Controlled Term Select Dropdown
const TermSelect = ({ value, onChange, sessionTerms = [], size = "small" }) => (
  <Select
    value={String(value || "") || "current"}
    size={size}
    onChange={(e) => onChange && onChange(e.target.value)}
    sx={{
      height: 26,
      fontSize: "0.7rem",
      fontWeight: 600,
      color: "#374151",
      bgcolor: "#F9FAFB",
      borderRadius: "6px",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    }}
  >
    {sessionTerms.length === 0 && (
      <MenuItem value="current" sx={{ fontSize: "0.7rem" }}>
        This Term
      </MenuItem>
    )}
    {sessionTerms.map((t) => (
      <MenuItem key={t.id || t.session_term_id} value={String(t.id || t.session_term_id)} sx={{ fontSize: "0.7rem" }}>
        {termLabel(t)}
      </MenuItem>
    ))}
  </Select>
);

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
  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [loading, setLoading] = useState(true);
  const [termStats, setTermStats] = useState({
    totalSchoolDays: 0,
    daysSpent: 0,
    daysRemaining: 0,
    schoolDays: 0,
    totalHolidays: 0,
    pctCompleted: 0,
    termEndDate: "—",
  });

  useEffect(() => {
    let isMounted = true;
    const initializeTerms = async () => {
      try {
        setLoading(true);
        const [termsResult, activeResult] = await Promise.allSettled([
          fetchSessionTerms(),
          tenantApi.get("/curriculum/active-session-term"),
        ]);

        const termsRes = termsResult.status === "fulfilled" ? termsResult.value : null;
        const termsList = Array.isArray(termsRes)
          ? termsRes
          : termsRes?.data || [];

        if (isMounted && termsList.length > 0) {
          setSessionTerms(termsList);
        }

        let activeTermId = null;
        if (
          activeResult.status === "fulfilled" &&
          activeResult.value?.data?.data?.session_term_id
        ) {
          activeTermId = String(activeResult.value.data.data.session_term_id);
        }

        if (!activeTermId && termsList.length > 0) {
          const activeTerm =
            termsList.find((t) => t.status === "active" || t.is_active || t.active) ||
            termsList[0];
          activeTermId = String(activeTerm?.session_term_id || activeTerm?.id || "");
        }

        if (isMounted && activeTermId) {
          setSelectedTermId(activeTermId);
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.warn("Failed to initialize session terms:", err);
        if (isMounted) setLoading(false);
      }
    };

    initializeTerms();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTermId) return;

    let isMounted = true;
    const loadTermDetails = async () => {
      try {
        setLoading(true);

        const [weeksRes, holidaysRes] = await Promise.allSettled([
          fetchWeeks(selectedTermId),
          fetchHolidays(selectedTermId),
        ]);

        const rawWeeks = weeksRes.status === "fulfilled" ? weeksRes.value : null;
        let fetchedWeeks = [];
        if (Array.isArray(rawWeeks)) {
          fetchedWeeks = rawWeeks;
        } else if (Array.isArray(rawWeeks?.data)) {
          fetchedWeeks = rawWeeks.data;
        } else if (Array.isArray(rawWeeks?.data?.data)) {
          fetchedWeeks = rawWeeks.data.data;
        }

        const rawHolidays = holidaysRes.status === "fulfilled" ? holidaysRes.value : null;
        let fetchedHolidays = [];
        if (Array.isArray(rawHolidays)) {
          fetchedHolidays = rawHolidays;
        } else if (Array.isArray(rawHolidays?.data)) {
          fetchedHolidays = rawHolidays.data;
        } else if (Array.isArray(rawHolidays?.data?.data)) {
          fetchedHolidays = rawHolidays.data.data;
        }

        if (isMounted) {
          const s = rawWeeks?.stats;
          const endDates = fetchedWeeks.map((w) => w.end_date).filter(Boolean).sort();
          const termEndDate =
            endDates.length > 0
              ? dayjs(endDates[endDates.length - 1]).format("MMMM D, YYYY")
              : "—";

          if (s) {
            setTermStats({
              totalSchoolDays: s.total_school_days ?? 0,
              daysSpent: s.days_spent ?? 0,
              daysRemaining: s.remaining_school_days ?? 0,
              schoolDays: s.total_school_days ?? 0,
              totalHolidays: s.holiday_days_allocated ?? fetchedHolidays.length,
              pctCompleted: s.pct_completed ?? 0,
              termEndDate,
            });
          } else {
            setTermStats({
              totalSchoolDays: 0,
              daysSpent: 0,
              daysRemaining: 0,
              schoolDays: 0,
              totalHolidays: 0,
              pctCompleted: 0,
              termEndDate: "—",
            });
          }
        }
      } catch (e) {
        console.warn("Failed to load term weeks/holidays for DaysInTermChart:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTermDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedTermId]);

  return (
    <Box sx={panelSx}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3, color: "#1e293b" }}>
            Days in the Term
          </Typography>

          <TermSelect
            value={selectedTermId}
            onChange={(val) => setSelectedTermId(val)}
            sessionTerms={sessionTerms}
          />
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={220}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
              <ReusableGaugeChart
                value={termStats.pctCompleted}
                label="Completed"
                height={250}
                width={300}
                colorRanges={[{ from: 0, to: 100, color: "#16a34a" }]}
              />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-around" sx={{ mt: 2, px: 0.5 }}>
              <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
                  {termStats.daysSpent}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
                  Days Passed
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#059669", lineHeight: 1 }}>
                  {termStats.schoolDays}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
                  School Days
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#d97706", lineHeight: 1 }}>
                  {termStats.totalHolidays || 0}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
                  Holidays
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Stack alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
                  {termStats.daysRemaining}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "#475569", textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
                  Days Left
                </Typography>
              </Stack>
            </Stack>

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
                Term Ends: {termStats.termEndDate}
              </Typography>
            </Box>
          </>
        )}
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