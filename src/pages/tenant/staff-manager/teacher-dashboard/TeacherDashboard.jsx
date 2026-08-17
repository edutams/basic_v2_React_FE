import React from "react";
import { Box, Stack } from "@mui/material";
import PageContainer from "@/components/container/PageContainer";

import ClassesOverview from "./components/ClassesOverview";
import QuickActions from "./components/QuickActions";
import Analytics from "./components/Analytics";
import ActivityLog from "./components/ActivityLog";
import StatCards from "./components/StatCards";

export default function TeacherDashboard() {
  return (
    <PageContainer title="Teacher Dashboard" description="Teaching staff portal">
      <Stack spacing={2.5}>
        <ClassesOverview />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "8fr 4fr",
            },
            gap: 2.5,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ minWidth: 0, height: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>
            <QuickActions />
            <Analytics />
          </Box>
          <Box sx={{ minWidth: 0, height: "100%" }}>
            <ActivityLog />
          </Box>
        </Box>

        <StatCards />
      </Stack>
    </PageContainer>
  );
}