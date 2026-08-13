import { Box, Stack, Typography, Divider } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// Mock data — replace with the activity feed endpoint later.
const activity = [
  {
    id: 1,
    icon: AssignmentOutlinedIcon,
    color: "#7c3aed",
    bg: "#ede9fe",
    title: "You posted an assignment to SS2A Mathematics",
    subtitle: "Quadratic Equations Worksheet",
    time: "30 mins ago",
  },
  {
    id: 2,
    icon: HowToRegOutlinedIcon,
    color: "#e11d48",
    bg: "#ffe4e6",
    title: "You recorded attendance for SS2B Mathematics",
    subtitle: "35 of 38 students present",
    time: "1 hour ago",
  },
  {
    id: 3,
    icon: CheckCircleOutlineOutlinedIcon,
    color: "#16a34a",
    bg: "#dcfce7",
    title: "You graded 18 submissions in SS1C Mathematics",
    subtitle: "Indices Assignment",
    time: "2 hours ago",
  },
  {
    id: 4,
    icon: CloudUploadOutlinedIcon,
    color: "#2563eb",
    bg: "#dbeafe",
    title: "You uploaded resources to SS1A Mathematics",
    subtitle: "Linear Equations Notes",
    time: "3 hours ago",
  },
  {
    id: 5,
    icon: DescriptionOutlinedIcon,
    color: "#64748b",
    bg: "#e2e8f0",
    title: "SS2B Quiz results published",
    subtitle: "Quadratic Equations Quiz",
    time: "4 hours ago",
  },
];

export default function RecentClassActivity() {
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Recent Class Activity</Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "primary.main", cursor: "pointer" }}
          >
            View all
          </Typography>
        </Stack>

        <Stack divider={<Divider flexItem />} spacing={1}>
          {activity.map((item) => {
            const Icon = item.icon;
            return (
              <Stack key={item.id} direction="row" spacing={1.25} alignItems="flex-start" sx={{ pt: 0.2, transition: "transform 150ms ease", "&:hover": { transform: "translateX(2px)" } }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: item.bg,
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.3 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 10.5, color: "text.disabled", whiteSpace: "nowrap" }}>
                  {item.time}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
