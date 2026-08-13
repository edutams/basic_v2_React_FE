import React, { useContext } from "react";
import { Box, Grid, Stack, Typography, Avatar } from "@mui/material";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PageContainer from "@/components/container/PageContainer";
import { TenantAuthContext } from "@/context/TenantContext/auth";

import ClassesOverview from "./components/ClassesOverview";
import QuickActions from "./components/QuickActions";
import Analytics from "./components/Analytics";
import RecentClassActivity from "./components/RecentClassActivity";
import StatCards from "./components/StatCards";

const quote = {
  text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
  author: "Brad Henry",
};

function DashboardHeader({ teacherName, classesToday = 4, assignmentsPending = 12 }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "stretch",
        gap: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 0.5,
        }}
      >
        <Typography sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>
          Good morning, {teacherName}! 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
          You have {classesToday} classes today and {assignmentsPending} assignments pending.
        </Typography>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "450px", lg: "500px" },
          flexShrink: 0,
          bgcolor: "#f8fafc",
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
          <FormatQuoteRoundedIcon sx={{ color: "#16a34a", fontSize: 24, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontStyle: "italic", lineHeight: 1.4, color: "text.primary" }}>
              {quote.text}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.3 }}>
              — {quote.author}
            </Typography>
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#e0f2fe",
              color: "#1d4ed8",
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 24 }} />
          </Avatar>
        </Stack>
      </Box>
    </Box>
  );
}

export default function TeacherDashboard() {
  const { user } = useContext(TenantAuthContext);
  const teacherName = user?.name || "Mr. John";

  return (
    <PageContainer title="Teacher Dashboard" description="Teaching staff portal">
      <Stack spacing={2.5}>
        <DashboardHeader teacherName={teacherName} />

        <ClassesOverview />

        <QuickActions />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 2.5,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ minWidth: 0, height: "100%" }}>
            <Analytics />
          </Box>
          <Box sx={{ minWidth: 0, height: "100%" }}>
            <RecentClassActivity />
          </Box>
        </Box>

        <StatCards />
      </Stack>
    </PageContainer>
  );
}
