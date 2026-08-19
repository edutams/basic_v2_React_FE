import { Box, Stack, Typography, ButtonBase } from "@mui/material";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// Mock data — wire each action's onClick up to real handlers/routes later.
const actions = [
  {
    id: "attendance",
    label: "Take Attendance",
    sub: "Mark class attendance",
    icon: GroupAddOutlinedIcon,
    color: "#0d9488",
    bg: "#ccfbf1",
  },
  {
    id: "assignment",
    label: "Create Assignment",
    sub: "Assign new task",
    icon: AssignmentOutlinedIcon,
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    id: "quiz",
    label: "Create Quiz",
    sub: "Build a new quiz",
    icon: HelpOutlineOutlinedIcon,
    color: "#ea580c",
    bg: "#ffedd5",
  },
  {
    id: "upload",
    label: "Upload Resource",
    sub: "Share learning materials",
    icon: CloudUploadOutlinedIcon,
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    id: "timetable",
    label: "View Timetable",
    sub: "See full timetable",
    icon: CalendarMonthOutlinedIcon,
    color: "#334155",
    bg: "#e2e8f0",
  },
];

export default function QuickActions() {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: "10px",
        p: 1,
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
        },
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 1.5, letterSpacing: -0.2 }}>Quick Actions</Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(4, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 1.25,
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Box key={action.id} sx={{ minWidth: 0, height: "100%" }}>
              <ButtonBase
                onClick={() => {
                  // TODO: hook up navigation / handler for `${action.id}`
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  minHeight: 92,
                  p: 1.25,
                  borderRadius: "12px",
                  bgcolor: `${action.color}0f`,
                  border: "1px solid",
                  borderColor: `${action.color}26`,
                  boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.1)",
                  textAlign: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  transition: "background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease",
                  "&:hover": {
                    bgcolor: `${action.color}1a`,
                    borderColor: `${action.color}40`,
                    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.12)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: action.bg,
                      color: action.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid",
                      borderColor: `${action.color}26`,
                      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.25, color: "#1e293b" }}>
                      {action.label}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: "#64748b", lineHeight: 1.25, mt: 0.25 }}>
                      {action.sub}
                    </Typography>
                  </Box>
                </Stack>
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
