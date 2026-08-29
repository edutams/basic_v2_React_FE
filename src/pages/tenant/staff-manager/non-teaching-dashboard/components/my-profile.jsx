import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useTenantAuth } from "@/hooks/useTenantAuth";
import UserProfileDrawer from "@/components/shared/UserProfileDrawer";
import ParentCard from "@/components/shared/ParentCard";

const getInitials = (nameStr) => {
  if (!nameStr) return "ST";
  const parts = nameStr.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatRoleName = (roleVal) => {
  if (!roleVal) return "";
  const rawStr = typeof roleVal === "object" ? roleVal.name : String(roleVal);
  return String(rawStr)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const getRoleChipsList = (authUser, explicitRole) => {
  if (explicitRole) {
    if (Array.isArray(explicitRole)) return explicitRole.map(formatRoleName);
    return [formatRoleName(explicitRole)];
  }
  if (authUser?.roles && Array.isArray(authUser.roles) && authUser.roles.length > 0) {
    const list = authUser.roles
      .map((r) => formatRoleName(r))
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return ["Non-Teaching Staff"];
};

const getRoleSx = (roleName) => {
  if (!roleName) return {};
  const normalized = String(roleName).toLowerCase().trim().replace(/[\s-]+/g, "_");

  if (normalized.includes("admin")) {
    return {
      backgroundColor: "#FEF2F2",
      color: "#DC2626",
      border: "1px solid #FCA5A5",
    };
  }
  if (normalized.includes("teacher") || normalized.includes("instructor")) {
    return {
      backgroundColor: "#FEF3C7",
      color: "#D97706",
      border: "1px solid #FCD34D",
    };
  }
  if (normalized.includes("bursar") || normalized.includes("account") || normalized.includes("finance")) {
    return {
      backgroundColor: "#ECFDF5",
      color: "#059669",
      border: "1px solid #6EE7B7",
    };
  }
  if (normalized.includes("staff") || normalized.includes("officer") || normalized.includes("admin_officer")) {
    return {
      backgroundColor: "#EFF6FF",
      color: "#2563EB",
      border: "1px solid #93C5FD",
    };
  }
  if (normalized.includes("parent") || normalized.includes("guardian")) {
    return {
      backgroundColor: "#FDF2F8",
      color: "#DB2777",
      border: "1px solid #F9A8D4",
    };
  }

  // Consistent palette generator for any other custom role names
  const colors = [
    { bg: "#EFF6FF", color: "#2563EB", border: "#93C5FD" }, // Blue
    { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" }, // Green
    { bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" }, // Purple
    { bg: "#FFF7ED", color: "#EA580C", border: "#FDBA74" }, // Orange
    { bg: "#ECFEFF", color: "#0891B2", border: "#67E8F9" }, // Cyan
  ];

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  const c = colors[index];
  return {
    backgroundColor: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
  };
};

const getImageUrl = (rawPath) => {
  if (!rawPath) return "";
  if (typeof rawPath !== "string") return "";
  if (
    rawPath.startsWith("http://") ||
    rawPath.startsWith("https://") ||
    rawPath.startsWith("data:") ||
    rawPath.startsWith("blob:")
  ) {
    return rawPath;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const cleanBase = baseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;
};

const formatJoinedDate = (dateVal) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return String(dateVal);
  }
};

const MyProfile = ({
  profileImage,
  name,
  role,
  employeeId,
  email,
  phone,
  office,
  joined,
  onViewProfile,
  onEditProfile,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const authContext = useTenantAuth();
  const rawUser = authContext?.user;
  const authUser = rawUser?.user || rawUser;
  const tenantInfo = authContext?.tenantInfo;

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Resolve dynamic fields
  const displayName =
    name ||
    (authUser
      ? [authUser.fname, authUser.mname, authUser.lname].filter(Boolean).join(" ") || authUser.full_name
      : "Staff Member");

  const roleChips = getRoleChipsList(authUser, role);

  const displayEmployeeId = employeeId || authUser?.user_id || "N/A";

  const displayEmail = email || authUser?.email || "N/A";

  const displayPhone = phone || authUser?.phone || "N/A";

  const displaySex = authUser?.sex || "N/A";

  const formattedSex =
    displaySex !== "N/A"
      ? String(displaySex).charAt(0).toUpperCase() + String(displaySex).slice(1).toLowerCase()
      : "N/A";

  const displayOffice = office || tenantInfo?.address || "N/A";

  const displayJoined =
    joined || (authUser?.created_at ? formatJoinedDate(authUser.created_at) : "N/A");

  const rawAvatar = profileImage || authUser?.avatar || "";

  const displayAvatar = getImageUrl(rawAvatar);

  const initials = getInitials(displayName);

  const handleView = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      setDrawerOpen(true);
    }
  };

  const handleEdit = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      navigate("/pages/account-settings");
    }
  };

  const profileDetails = [
    {
      icon: <BadgeOutlinedIcon />,
      label: "Staff ID",
      value: displayEmployeeId,
      bg: "#ECFDF5",
      color: "#059669",
    },
    {
      icon: <EmailOutlinedIcon />,
      label: "Email",
      value: displayEmail,
      bg: "#EFF6FF",
      color: "#2563EB",
    },
    {
      icon: <PhoneOutlinedIcon />,
      label: "Phone",
      value: displayPhone,
      bg: "#F5F3FF",
      color: "#7C3AED",
    },
    {
      icon: <PersonOutlineOutlinedIcon />,
      label: "Gender",
      value: formattedSex,
      bg: "#FDF2F8",
      color: "#DB2777",
    },
    {
      icon: <LocationOnOutlinedIcon />,
      label: "School Address",
      value: displayOffice,
      bg: "#FFF7ED",
      color: "#EA580C",
    },
    {
      icon: <CalendarMonthOutlinedIcon />,
      label: "Joined",
      value: displayJoined,
      bg: "#ECFEFF",
      color: "#0891B2",
    },
  ];

  const primaryColor = theme.palette.primary.main;
  const primaryLightBg = theme.palette.primary.light || alpha(primaryColor, 0.1);

  return (
    <>
      <ParentCard
      >
        {/* HEADER */}
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
              color: "#0F172A",
            }}
          >
            My Profile
          </Typography>

          <Button
            onClick={handleView}
            size="small"
            variant="contained"
            endIcon={
              <ArrowForwardIcon
                sx={{
                  fontSize: "14px !important",
                }}
              />
            }
            sx={{
              fontSize: {
                xs: "11px",
                sm: "12px",
              },

            }}
          >
            View full profile
          </Button>
        </Box>

        {/* PROFILE INFORMATION HEADER (Unboxed) */}
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
            src={displayAvatar || undefined}
            alt={displayName}
            sx={{
              width: {
                xs: 56,
                sm: 62,
              },
              height: {
                xs: 56,
                sm: 62,
              },
              backgroundColor: primaryLightBg,
              color: primaryColor,
              fontSize: {
                xs: "18px",
                sm: "20px",
              },
              fontWeight: 700,
              border: "2px solid #ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {!displayAvatar && initials}
          </Avatar>

          {/* Name and Role Chips */}
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
                color: "#0F172A",
                lineHeight: 1.3,
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </Typography>

            {/* Roles rendered as Chips with dynamic colors */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.6,
              }}
            >
              {roleChips.map((rName, idx) => {
                const roleSx = getRoleSx(rName);
                return (
                  <Chip
                    key={idx}
                    label={rName}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      ...roleSx,
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* PROFILE DETAILS (Unboxed vertical list with distinct icon colors and high-contrast text) */}
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
                alignItems: "flex-start",
                gap: {
                  xs: 1.2,
                  sm: 1.5,
                },
              }}
            >
              {/* Distinctly colored Icon Box */}
              <Box
                sx={{
                  width: 28,
                  minWidth: 28,
                  height: 28,
                  borderRadius: "7px",
                  backgroundColor: detail.bg,
                  color: detail.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 0.2,
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

              {/* High Contrast Label */}
              <Typography
                sx={{
                  width: {
                    xs: 90,
                    sm: 105,
                  },
                  minWidth: {
                    xs: 90,
                    sm: 105,
                  },
                  fontSize: {
                    xs: "11px",
                    sm: "12px",
                  },
                  fontWeight: 600,
                  color: "#475569",
                  pt: 0.3,
                }}
              >
                {detail.label}
              </Typography>

              {/* High Contrast Value */}
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: {
                    xs: "11px",
                    sm: "12px",
                  },
                  fontWeight: 600,
                  color: "#0F172A",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                  pt: 0.3,
                }}
              >
                {detail.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* EDIT PROFILE BUTTON */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleEdit}
          startIcon={
            <EditOutlinedIcon
              sx={{
                fontSize: "15px !important",
              }}
            />
          }
          sx={{
            mt: 3,
            fontSize: {
              xs: "11px",
              sm: "12px",
            },
          }}
        >
          Edit Profile
        </Button>
      </ParentCard>

      <UserProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={authUser}
      />
    </>
  );
};

export default MyProfile;
