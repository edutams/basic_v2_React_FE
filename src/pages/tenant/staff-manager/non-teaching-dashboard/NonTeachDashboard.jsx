import React, { useState } from "react";
import {
    Box,
    Stack,
} from "@mui/material";

import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PageContainer from "@/components/container/PageContainer";

// Dashboard Components
import StatsCard from "./components/stats-card";
import StatCardBreakdownModal from "./components/StatCardBreakdownModal";
import MyProfile from "./components/my-profile";
import SchoolCalendar from "./components/School-calendar";
import ActivityLog from "./components/Activity-log";
import QuickAccess from "./components/Quick-access";

const NonTeachDashboard = () => {
    const [selectedStat, setSelectedStat] = useState(null);

    const statistics = [
        {
            value: "12",
            title: "Tasks Completed",
            subtitle: "This Week",
            progress: 85,
            progressLabel: "85% of assigned tasks",
            icon: <TaskAltOutlinedIcon />,
            iconColor: "#159a72",
            iconBackground: "#e8f8f3",
            progressColor: "#159a72",
        },
        {
            value: "8",
            title: "Requests Resolved",
            subtitle: "This Week",
            progress: 80,
            progressLabel: "80% resolution rate",
            icon: <AssignmentOutlinedIcon />,
            iconColor: "#7446c8",
            iconBackground: "#f2ebff",
            progressColor: "#8b5cf6",
        },
        {
            value: "15",
            title: "Documents Uploaded",
            subtitle: "This Week",
            progress: 60,
            progressLabel: "3 new uploads",
            icon: <FolderOutlinedIcon />,
            iconColor: "#2563eb",
            iconBackground: "#eaf2ff",
            progressColor: "#5797e6",
        },
        {
            value: "68",
            title: "Days in School",
            subtitle: "This Term",
            progress: 68,
            progressLabel: "68% of school days",
            icon: <CalendarMonthOutlinedIcon />,
            iconColor: "#e58b16",
            iconBackground: "#fff5e7",
            progressColor: "#e9a33b",
        },
        {
            value: "6",
            title: "Departments",
            subtitle: "In the school",
            progress: 100,
            progressLabel: "Across all levels",
            icon: <BusinessOutlinedIcon />,
            iconColor: "#159a9a",
            iconBackground: "#e7f8f8",
            progressColor: "#52b6b2",
        },
    ];

    return (
        <PageContainer title="Staff Dashboard" description="Non-teaching staff portal">
            <Stack spacing={3}>
                {/* STATISTICS CARDS */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(5, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {statistics.map((stat, index) => (
                        <Box key={index} sx={{ minWidth: 0, height: "100%" }}>
                            <StatsCard
                                value={stat.value}
                                title={stat.title}
                                subtitle={stat.subtitle}
                                progress={stat.progress}
                                progressLabel={stat.progressLabel}
                                icon={stat.icon}
                                iconColor={stat.iconColor}
                                iconBackground={stat.iconBackground}
                                progressColor={stat.progressColor}
                                onClick={() => setSelectedStat(stat)}
                            />
                        </Box>
                    ))}
                </Box>

                {/* MAIN CONTENT (Profile, Calendar, Activity Log) */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 2.5,
                        alignItems: "stretch",
                    }}
                >
                    <Box sx={{ minWidth: 0, height: "100%" }}>
                        <MyProfile />
                    </Box>

                    <Box sx={{ minWidth: 0, height: "100%" }}>
                        <SchoolCalendar />
                    </Box>

                    <Box sx={{ minWidth: 0, height: "100%" }}>
                        <ActivityLog />
                    </Box>
                </Box>

                {/* QUICK ACCESS */}
                <Box>
                    <QuickAccess />
                </Box>
            </Stack>

            <StatCardBreakdownModal
                open={Boolean(selectedStat)}
                stat={selectedStat}
                onClose={() => setSelectedStat(null)}
            />
        </PageContainer>
    );
};

export default NonTeachDashboard;