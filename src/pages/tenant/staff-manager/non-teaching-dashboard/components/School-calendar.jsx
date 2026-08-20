import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import tenantApi from "@/api/tenant/tenant_api";
import { fetchSessionTerms } from "@/api/tenant/session-term/sessionTermApi";
import { fetchWeeks } from "@/api/tenant/term-weeks/weekApi";
import { fetchHolidays } from "@/api/tenant/holidays/holidayApi";
import ParentCard from "@/components/shared/ParentCard";

dayjs.extend(isBetween);

const SchoolCalendar = ({ onViewFullCalendar }) => {
  const navigate = useNavigate();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [loading, setLoading] = useState(true);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(dayjs());
  const [termStats, setTermStats] = useState({
    totalSchoolDays: 68,
    daysSpent: 47,
    daysRemaining: 21,
    totalHolidays: 5,
    pctCompleted: 69,
  });
  const [holidaysList, setHolidaysList] = useState([]);
  const [weeksList, setWeeksList] = useState([]);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const calculateStats = (weeks, holidays = []) => {
    if (!weeks || weeks.length === 0) return;

    const startDates = weeks.map((w) => w.start_date).filter(Boolean).sort();
    const endDates = weeks.map((w) => w.end_date).filter(Boolean).sort();

    if (startDates.length === 0 || endDates.length === 0) return;

    const startDate = dayjs(startDates[0]);
    const endDate = dayjs(endDates[endDates.length - 1]);
    const today = dayjs();

    // Collect all holiday dates
    const holidayDatesSet = new Set();
    holidays.forEach((h) => {
      if (h.start_date && h.end_date) {
        let cur = dayjs(h.start_date);
        const hEnd = dayjs(h.end_date);
        while (cur.isBefore(hEnd) || cur.isSame(hEnd, "day")) {
          holidayDatesSet.add(cur.format("YYYY-MM-DD"));
          cur = cur.add(1, "day");
        }
      } else if (h.date) {
        holidayDatesSet.add(dayjs(h.date).format("YYYY-MM-DD"));
      }
    });

    let totalSchoolDays = 0;
    let daysSpent = 0;
    let totalHolidays = 0;

    let cursor = startDate.clone();
    while (cursor.isBefore(endDate) || cursor.isSame(endDate, "day")) {
      const dayOfWeek = cursor.day(); // 0 = Sun, 6 = Sat
      const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const dateStr = cursor.format("YYYY-MM-DD");
      const isHoliday = holidayDatesSet.has(dateStr);

      if (isHoliday) {
        totalHolidays++;
      }

      if (isWeekday && !isHoliday) {
        totalSchoolDays++;
        if (cursor.isBefore(today, "day") || cursor.isSame(today, "day")) {
          daysSpent++;
        }
      }
      cursor = cursor.add(1, "day");
    }

    daysSpent = Math.min(daysSpent, totalSchoolDays);
    const daysRemaining = Math.max(0, totalSchoolDays - daysSpent);
    const pctCompleted =
      totalSchoolDays > 0
        ? Math.min(100, Math.round((daysSpent / totalSchoolDays) * 100))
        : 0;

    setTermStats({
      totalSchoolDays,
      daysSpent,
      daysRemaining,
      totalHolidays,
      pctCompleted,
    });
  };

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      // 1. Fetch academic info
      let acadData = null;
      try {
        const acadRes = await tenantApi.get("/school_setup/get_academic_info");
        acadData = acadRes?.data || {};
        setAcademicInfo(acadData);
      } catch (e) {
        console.warn("Could not fetch academic info:", e);
      }

      // 2. Fetch session terms to find active term ID
      const sessionTermsRes = await fetchSessionTerms();
      const termsList = Array.isArray(sessionTermsRes)
        ? sessionTermsRes
        : sessionTermsRes?.data || [];
      const activeTerm =
        termsList.find((t) => t.status === "active" || t.is_active || t.active) ||
        termsList[0];

      if (activeTerm?.id) {
        // 3. Fetch weeks for active term
        const weeksData = await fetchWeeks(activeTerm.id);
        const fetchedWeeks = Array.isArray(weeksData)
          ? weeksData
          : weeksData?.data || [];
        setWeeksList(fetchedWeeks);

        // 4. Fetch holidays for active term
        let fetchedHolidays = [];
        try {
          const holidaysData = await fetchHolidays(activeTerm.id);
          fetchedHolidays = Array.isArray(holidaysData)
            ? holidaysData
            : holidaysData?.data || [];
          setHolidaysList(fetchedHolidays);
        } catch (e) {
          console.warn("Holidays not loaded:", e);
        }

        // Calculate term days stats dynamically
        calculateStats(fetchedWeeks, fetchedHolidays);
      }
    } catch (err) {
      console.error("Failed to load school calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => prev.add(1, "month"));
  };

  const handleThisTerm = () => {
    setCurrentMonthDate(dayjs());
  };

  const handleViewFull = () => {
    if (onViewFullCalendar) {
      onViewFullCalendar();
    } else {
      navigate("/school-setup");
    }
  };

  const monthName = currentMonthDate.format("MMMM");
  const year = currentMonthDate.format("YYYY");

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonthDate.startOf("month");
    const startDayOfWeek = startOfMonth.day();
    const daysInMonth = currentMonthDate.daysInMonth();
    const todayStr = dayjs().format("YYYY-MM-DD");

    const days = [];

    // Muted days from previous month
    const prevMonth = currentMonthDate.subtract(1, "month");
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        muted: true,
        dateStr: prevMonth.date(prevMonthDays - i).format("YYYY-MM-DD"),
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = currentMonthDate.date(d);
      const dateStr = curDate.format("YYYY-MM-DD");
      const isToday = dateStr === todayStr;
      const dayOfWeek = curDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const isHoliday = holidaysList.some((h) => {
        if (h.start_date && h.end_date) {
          return curDate.isBetween(
            dayjs(h.start_date),
            dayjs(h.end_date),
            "day",
            "[]"
          );
        }
        return h.date === dateStr;
      });

      const hasEvent =
        isHoliday ||
        weeksList.some(
          (w) => w.start_date === dateStr || w.end_date === dateStr
        );

      days.push({
        day: d,
        muted: false,
        selected: isToday,
        isWeekend,
        isHoliday,
        event: hasEvent,
        dateStr,
      });
    }

    // Muted days for next month to round out grid
    const totalSoFar = days.length;
    const remainingCells = (7 - (totalSoFar % 7)) % 7;
    const nextMonth = currentMonthDate.add(1, "month");
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        muted: true,
        dateStr: nextMonth.date(i).format("YYYY-MM-DD"),
      });
    }

    return days;
  }, [currentMonthDate, holidaysList, weeksList]);

  const renderCalendarDay = (date, index) => {
    const isToday = date.selected;

    return (
      <Box
        key={`${date.dateStr}-${index}`}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: {
            xs: 31,
            sm: 33,
            md: 34,
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: 27,
              sm: 29,
              md: 31,
            },
            height: {
              xs: 27,
              sm: 29,
              md: 31,
            },
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",

            backgroundColor: isToday
              ? "#19a77a"
              : date.isHoliday
                ? "#fef3c7"
                : "transparent",

            color: isToday
              ? "#ffffff"
              : date.isHoliday
                ? "#d97706"
                : date.muted
                  ? "#b7bec8"
                  : date.isWeekend
                    ? "#94a3b8"
                    : "#344054",

            fontSize: {
              xs: "10px",
              sm: "11px",
            },

            fontWeight: isToday || date.isHoliday ? 700 : 500,

            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor: date.muted
                ? "transparent"
                : isToday
                  ? "#168e68"
                  : "#eef8f5",
            },
          }}
        >
          {date.day}

          {/* Small event indicator */}
          {date.event && !isToday && (
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: date.isHoliday ? "#e99a22" : "#26709d",
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <ParentCard>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: {
            xs: 2,
            md: 2.2,
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: {
              xs: "15px",
              sm: "16px",
            },
            fontWeight: 700,
            color: "#182230",
          }}
        >
          School Calendar
        </Typography>

        <Button
          onClick={handleViewFull}
          endIcon={
            <ArrowForwardIcon
              sx={{
                fontSize: "14px !important",
              }}
            />
          }
          sx={{
            fontSize: {
              xs: "10px",
              sm: "11px",
            },
          }}
        >
          View full calendar
        </Button>
      </Box>

      {/* MONTH NAVIGATION */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <IconButton
          size="small"
          onClick={handlePrevMonth}
          sx={{
            width: 28,
            height: 28,
            color: "#344054",
            "&:hover": {
              backgroundColor: "#f5f7f8",
            },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontSize: {
              xs: "13px",
              sm: "14px",
            },
            fontWeight: 700,
            color: "#344054",
          }}
        >
          {monthName} {year}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={handleNextMonth}
            sx={{
              width: 28,
              height: 28,
              color: "#344054",
              "&:hover": {
                backgroundColor: "#f5f7f8",
              },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* THIS TERM BUTTON */}
      {/* <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={handleThisTerm}
            startIcon={
              <CalendarTodayOutlinedIcon
                sx={{
                  fontSize: "13px !important",
                }}
              />
            }
            sx={{
              minHeight: 27,
              px: 1,
              borderRadius: "5px",
              borderColor: "#e5e7eb",
              color: "#475467",
              textTransform: "none",
              fontSize: "9px",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#d0d5dd",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            This Term
          </Button>
        </Box> */}

      {/* WEEK DAYS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 0.4,
        }}
      >
        {weekDays.map((day) => (
          <Box
            key={day}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 27,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "9px",
                  sm: "10px",
                },
                fontWeight: 600,
                color: "#667085",
              }}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* CALENDAR DAYS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          position: "relative",
        }}
      >
        {calendarDays.map(renderCalendarDay)}
      </Box>

      {/* DAYS IN TERM STATS & LEGEND */}
      <Box
        sx={{
          mt: {
            xs: 1.5,
            md: 2,
          },
          pt: {
            xs: 1.5,
            md: 2,
          },
          borderTop: "1px solid #f0f2f4",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "11px",
              sm: "12px",
            },
            fontWeight: 700,
            color: "#344054",
            mb: 1.5,
          }}
        >
          Total Term Days
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr) auto",
            alignItems: "start",
            gap: { xs: 1, sm: 1.5, md: 2 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "18px",
                  sm: "20px",
                },
                fontWeight: 700,
                lineHeight: 1,
                color: "primary.main",
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.totalSchoolDays}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
                lineHeight: 1.25,
              }}
            >
              Total Days
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "18px",
                  sm: "20px",
                },
                fontWeight: 700,
                lineHeight: 1,
                color: "success.dark",
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.daysSpent}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
                lineHeight: 1.25,
              }}
            >
              Days Spent
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "18px",
                  sm: "20px",
                },
                fontWeight: 700,
                lineHeight: 1,
                color: "secondary.dark",
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.daysRemaining}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
                lineHeight: 1.25,
              }}
            >
              Days Left
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "18px",
                  sm: "20px",
                },
                fontWeight: 700,
                lineHeight: 1,
                color: "warning.dark",
              }}
            >
              {loading ? <CircularProgress size={16} /> : termStats.totalHolidays}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
                lineHeight: 1.25,
              }}
            >
              Holidays
            </Typography>
          </Box>

          {/* <Box
            sx={{
              position: "relative",
              width: {
                xs: 46,
                sm: 52,
              },
              height: {
                xs: 46,
                sm: 52,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={48}
              thickness={3.5}
              sx={{
                position: "absolute",
                color: "#edf1f3",
              }}
            />

            <CircularProgress
              variant="determinate"
              value={loading ? 0 : termStats.pctCompleted}
              size={48}
              thickness={3.5}
              sx={{
                color: "#159a72",
                transform: "rotate(-90deg)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "10px",
                    sm: "11px",
                  },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "#182230",
                }}
              >
                {loading ? "..." : `${termStats.pctCompleted}%`}
              </Typography>

              <Typography
                sx={{
                  fontSize: "7px",
                  color: "#667085",
                  mt: 0.2,
                }}
              >
                Completed
              </Typography>
            </Box>
          </Box> */}
        </Box>
      </Box>
    </ParentCard >
  );
};

export default SchoolCalendar;
