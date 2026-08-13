import React from "react";
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

const SchoolCalendar = () => {
  /*
    |--------------------------------------------------------------------------
    | Calendar Configuration
    |--------------------------------------------------------------------------
    */

  const monthName = "May";
  const year = 2026;

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /*
    |--------------------------------------------------------------------------
    | May 2026 Calendar
    |--------------------------------------------------------------------------
    |
    | May 1, 2026 falls on Friday.
    |
    */

  const calendarDays = [
    { day: 26, muted: true },
    { day: 27, muted: true },
    { day: 28, muted: true },
    { day: 29, muted: true },
    { day: 30, muted: true },
    { day: 1 },
    { day: 2 },

    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 8 },
    { day: 9 },

    { day: 10 },
    { day: 11 },
    { day: 12 },
    { day: 13 },
    { day: 14 },
    { day: 15 },
    { day: 16 },

    { day: 17 },
    { day: 18, event: true },
    { day: 19 },
    { day: 20, selected: true },
    { day: 21 },
    { day: 22 },
    { day: 23, highlighted: true },

    { day: 24 },
    { day: 25 },
    { day: 26 },
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },

    { day: 31 },
    { day: 1, muted: true },
    { day: 2, muted: true },
    { day: 3, muted: true },
    { day: 4, muted: true },
    { day: 5, muted: true },
    { day: 6, muted: true },
  ];

  /*
    |--------------------------------------------------------------------------
    | Calendar Day Renderer
    |--------------------------------------------------------------------------
    */

  const renderCalendarDay = (date, index) => {
    const isToday = date.selected;
    const isHighlighted = date.highlighted;

    return (
      <Box
        key={`${date.day}-${index}`}
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

            backgroundColor: isHighlighted
              ? "#19a77a"
              : isToday
                ? "#d9f4eb"
                : "transparent",

            color: isHighlighted
              ? "#ffffff"
              : date.muted
                ? "#b7bec8"
                : "#344054",

            fontSize: {
              xs: "10px",
              sm: "11px",
            },

            fontWeight: isHighlighted || isToday ? 700 : 500,

            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor: date.muted
                ? "transparent"
                : isHighlighted
                  ? "#168e68"
                  : "#eef8f5",
            },
          }}
        >
          {date.day}

          {/* Small event indicator */}
          {date.event && (
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                width: 3,
                height: 3,
                borderRadius: "50%",
                backgroundColor: "#26709d",
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #edf0f2",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
            md: 2.75,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              sm: 2.5,
              md: 2.75,
            },
          },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* =====================================================
                    HEADER
                ===================================================== */}

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
            endIcon={
              <ArrowForwardIcon
                sx={{
                  fontSize: "14px !important",
                }}
              />
            }
            sx={{
              minWidth: "auto",
              p: 0,
              textTransform: "none",
              fontSize: {
                xs: "10px",
                sm: "11px",
              },
              fontWeight: 600,
              color: "#26709d",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#155e85",
              },
            }}
          >
            View full calendar
          </Button>
        </Box>

        {/* =====================================================
                    MONTH NAVIGATION
                ===================================================== */}

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

        {/* =====================================================
                    THIS TERM BUTTON
                ===================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Button
            size="small"
            variant="outlined"
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
        </Box>

        {/* =====================================================
                    WEEK DAYS
                ===================================================== */}

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

        {/* =====================================================
                    CALENDAR DAYS
                ===================================================== */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {calendarDays.map(renderCalendarDay)}
        </Box>

        {/* =====================================================
                    DAYS IN TERM
                ===================================================== */}

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
              mb: 1.2,
            }}
          >
            Days in Term
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* Total School Days */}

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "20px",
                    sm: "22px",
                  },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "#159a72",
                }}
              >
                68
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: "9px", sm: "10px" },
                  color: "#667085",
                }}
              >
                Total School Days
              </Typography>
            </Box>

            {/* Days Spent */}

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "20px",
                    sm: "22px",
                  },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "#159a72",
                }}
              >
                47
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: "9px", sm: "10px" },
                  color: "#667085",
                }}
              >
                Days Spent
              </Typography>
            </Box>

            {/* Days Remaining */}

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "20px",
                    sm: "22px",
                  },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "#2670c0",
                }}
              >
                21
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: "9px", sm: "10px" },
                  color: "#667085",
                }}
              >
                Days Remaining
              </Typography>
            </Box>

            {/* Progress */}

            <Box
              sx={{
                position: "relative",
                width: {
                  xs: 52,
                  sm: 58,
                },
                height: {
                  xs: 52,
                  sm: 58,
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
                size={54}
                thickness={3.5}
                sx={{
                  position: "absolute",
                  color: "#edf1f3",
                }}
              />

              <CircularProgress
                variant="determinate"
                value={69}
                size={54}
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
                      xs: "11px",
                      sm: "12px",
                    },
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "#182230",
                  }}
                >
                  69%
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
            </Box>
          </Box>
        </Box>

        {/* =====================================================
                    CALENDAR LEGEND
                ===================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: {
              xs: 1.2,
              sm: 1.5,
            },
            mt: {
              xs: 1.5,
              md: 2,
            },
          }}
        >
          {/* Days Spent */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#159a72",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
              }}
            >
              Days Spent
            </Typography>
          </Box>

          {/* Upcoming Events */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#2670c0",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
              }}
            >
              Upcoming Events
            </Typography>
          </Box>

          {/* Holidays */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#e99a22",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
              }}
            >
              Holidays
            </Typography>
          </Box>

          {/* Weekends */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#a7a9b7",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "9px", sm: "10px" },
                color: "#667085",
              }}
            >
              Weekends
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SchoolCalendar;
