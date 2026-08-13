import React from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ActivityLog = ({
  activities = [
    {
      type: "document",
      title: 'Uploaded document "Staff Meeting Minutes"',
      category: "Documents & Files",
      time: "10:45 AM",
    },
    {
      type: "task",
      title: 'Completed task "Update Staff Directory"',
      category: "My Tasks",
      time: "9:30 AM",
    },
    {
      type: "staff",
      title: "Added new staff record for Mrs. K. Johnson",
      category: "Staff Directory",
      time: "Yesterday, 3:15 PM",
    },
    {
      type: "folder",
      title: 'Uploaded document "Inventory Report"',
      category: "Documents & Files",
      time: "Yesterday, 11:20 AM",
    },
    {
      type: "resolved",
      title: 'Resolved request "AC Not Working in Office"',
      category: "Work Requests",
      time: "May 19, 4:05 PM",
    },
  ],
  onViewAll,
}) => {
  /*
    |--------------------------------------------------------------------------
    | Activity Icon
    |--------------------------------------------------------------------------
    */

  const getActivityIcon = (type) => {
    switch (type) {
      case "document":
        return <DescriptionOutlinedIcon />;

      case "task":
        return <AssignmentTurnedInOutlinedIcon />;

      case "staff":
        return <GroupsOutlinedIcon />;

      case "folder":
        return <FolderOutlinedIcon />;

      case "resolved":
        return <CheckCircleOutlineOutlinedIcon />;

      default:
        return <DescriptionOutlinedIcon />;
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Activity Color
    |--------------------------------------------------------------------------
    */

  const getActivityStyles = (type) => {
    switch (type) {
      case "document":
        return {
          color: "#159a72",
          background: "#e8f8f3",
        };

      case "task":
        return {
          color: "#7446c8",
          background: "#f2ebff",
        };

      case "staff":
        return {
          color: "#2670c0",
          background: "#eaf2ff",
        };

      case "folder":
        return {
          color: "#e59a20",
          background: "#fff5e7",
        };

      case "resolved":
        return {
          color: "#159a72",
          background: "#e8f8f3",
        };

      default:
        return {
          color: "#667085",
          background: "#f2f4f7",
        };
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1.5px solid #7446c8",
        borderRadius: "8px",
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
            gap: 2,
            mb: {
              xs: 2,
              md: 2.5,
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
            Activity Log
          </Typography>

          <Button
            onClick={onViewAll}
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
            View all logs
          </Button>
        </Box>

        {/* =====================================================
                    ACTIVITY LIST
                ===================================================== */}

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activities.map((activity, index) => {
            const styles = getActivityStyles(activity.type);

            return (
              <Box
                key={`${activity.title}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: {
                    xs: 1.2,
                    sm: 1.5,
                  },
                  py: {
                    xs: 1.15,
                    sm: 1.3,
                  },

                  borderBottom:
                    index !== activities.length - 1
                      ? "1px solid #f2f4f7"
                      : "none",
                }}
              >
                {/* =================================================
                                    ACTIVITY ICON
                                ================================================= */}

                <Box
                  sx={{
                    width: {
                      xs: 34,
                      sm: 38,
                    },
                    height: {
                      xs: 34,
                      sm: 38,
                    },
                    minWidth: {
                      xs: 34,
                      sm: 38,
                    },
                    borderRadius: "9px",
                    backgroundColor: styles.background,
                    color: styles.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    "& svg": {
                      fontSize: {
                        xs: 17,
                        sm: 19,
                      },
                    },
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Box>

                {/* =================================================
                                    ACTIVITY CONTENT
                                ================================================= */}

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "9px",
                        sm: "10px",
                        md: "11px",
                      },
                      fontWeight: 600,
                      color: "#344054",
                      lineHeight: 1.4,

                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {activity.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: {
                        xs: "8px",
                        sm: "9px",
                      },
                      color: "#98a2b3",
                      lineHeight: 1.3,
                    }}
                  >
                    {activity.category}
                  </Typography>
                </Box>

                {/* =================================================
                                    TIME
                                ================================================= */}

                <Typography
                  sx={{
                    alignSelf: "flex-start",
                    mt: 0.3,
                    minWidth: {
                      xs: 55,
                      sm: 70,
                    },
                    textAlign: "right",
                    fontSize: {
                      xs: "7px",
                      sm: "8px",
                      md: "9px",
                    },
                    color: "#667085",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activity.time}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* =====================================================
                    VIEW FULL ACTIVITY LOG
                ===================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: {
              xs: 1.5,
              sm: 2,
            },
          }}
        >
          <Button
            onClick={onViewAll}
            endIcon={
              <ArrowForwardIcon
                sx={{
                  fontSize: "14px !important",
                }}
              />
            }
            sx={{
              minWidth: "auto",
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
            View full activity log
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
