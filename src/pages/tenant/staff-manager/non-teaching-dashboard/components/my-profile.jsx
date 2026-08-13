import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const MyProfile = ({
  profileImage = "",
  name = "Mr. Tunde Adeyemi",
  role = "Administrative Officer",
  employeeId = "MCMA/ADM/0245",
  department = "Administration",
  email = "tunde.adeyemi@mcma.edu.ng",
  phone = "+234 803 123 4567",
  office = "Admin Block, Ground Floor",
  joined = "March 12, 2021",
  onViewProfile,
  onEditProfile,
}) => {
  const profileDetails = [
    {
      icon: <BadgeOutlinedIcon />,
      label: "Employee ID",
      value: employeeId,
    },
    {
      icon: <BusinessOutlinedIcon />,
      label: "Department",
      value: department,
    },
    {
      icon: <EmailOutlinedIcon />,
      label: "Email",
      value: email,
    },
    {
      icon: <PhoneOutlinedIcon />,
      label: "Phone",
      value: phone,
    },
    {
      icon: <LocationOnOutlinedIcon />,
      label: "Office",
      value: office,
    },
    {
      icon: <CalendarMonthOutlinedIcon />,
      label: "Joined",
      value: joined,
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1.5px solid #159a72",
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
              xs: 2.5,
              md: 3,
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
            My Profile
          </Typography>

          <Button
            onClick={onViewProfile}
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

              borderRadius: 0,

              "&:hover": {
                backgroundColor: "transparent",
                color: "#155e85",
              },
            }}
          >
            View full profile
          </Button>
        </Box>

        {/* =====================================================
                    PROFILE INFORMATION
        ===================================================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",

            gap: {
              xs: 1.5,
              sm: 2,
            },

            mb: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          {/* Avatar */}

          <Avatar
            src={profileImage || undefined}
            alt={name}
            sx={{
              width: {
                xs: 56,
                sm: 62,
              },

              height: {
                xs: 56,
                sm: 62,
              },

              backgroundColor: "#dceee8",

              color: "#147a5d",

              fontSize: {
                xs: "18px",
                sm: "20px",
              },

              fontWeight: 700,

              border: "2px solid #ffffff",

              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {!profileImage && "TA"}
          </Avatar>

          {/* Name and Role */}

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: "14px",
                  sm: "15px",
                },

                fontWeight: 700,

                color: "#172033",

                lineHeight: 1.3,

                mb: 0.4,

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "10px",
                  sm: "11px",
                },

                color: "#667085",

                lineHeight: 1.4,
              }}
            >
              {role}
            </Typography>
          </Box>
        </Box>

        {/* =====================================================
                    PROFILE DETAILS
        ===================================================== */}

        <Box
          sx={{
            display: "flex",

            flexDirection: "column",

            gap: {
              xs: 1.5,
              sm: 1.7,
            },
          }}
        >
          {profileDetails.map((detail, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",

                alignItems: "center",

                gap: {
                  xs: 1.2,
                  sm: 1.5,
                },
              }}
            >
              {/* Icon */}

              <Box
                sx={{
                  width: 18,

                  minWidth: 18,

                  height: 18,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "#667085",

                  "& svg": {
                    fontSize: {
                      xs: 15,
                      sm: 16,
                    },
                  },
                }}
              >
                {detail.icon}
              </Box>

              {/* Label */}

              <Typography
                sx={{
                  width: {
                    xs: 85,
                    sm: 100,
                  },

                  minWidth: {
                    xs: 85,
                    sm: 100,
                  },

                  fontSize: {
                    xs: "10px",
                    sm: "11px",
                  },

                  fontWeight: 500,

                  color: "#667085",
                }}
              >
                {detail.label}
              </Typography>

              {/* Value */}

              <Typography
                sx={{
                  flex: 1,

                  minWidth: 0,

                  fontSize: {
                    xs: "10px",
                    sm: "11px",
                  },

                  fontWeight: 500,

                  color: "#344054",

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: {
                    xs: "normal",
                    sm: "nowrap",
                  },

                  wordBreak: "break-word",
                }}
              >
                {detail.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* =====================================================
                    DIVIDER
        ===================================================== */}

        <Divider
          sx={{
            mt: {
              xs: 2.5,
              md: 3,
            },

            mb: {
              xs: 2,
              md: 2.5,
            },

            borderColor: "#edf0f2",
          }}
        />

        {/* =====================================================
                    EDIT PROFILE BUTTON
        ===================================================== */}

        <Button
          fullWidth
          variant="outlined"
          onClick={onEditProfile}
          startIcon={
            <EditOutlinedIcon
              sx={{
                fontSize: "15px !important",
              }}
            />
          }
          sx={{
            height: {
              xs: 38,
              sm: 40,
            },

            borderRadius: "6px",

            borderColor: "#91cbb9",

            color: "#257a64",

            textTransform: "none",

            fontSize: {
              xs: "11px",
              sm: "12px",
            },

            fontWeight: 600,

            "&:hover": {
              borderColor: "#5da990",

              backgroundColor: "#f1faf7",
            },
          }}
        >
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default MyProfile;
