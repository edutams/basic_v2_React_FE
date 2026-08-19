import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [selectedStat, setSelectedStat] = useState(null);

    const statistics = [
        {
            value: "12",
            title: "Tasks Completed",
            subtitle: "This Week",
            trend: 12.5,
            extraLabel: "vs last week",
            icon: <TaskAltOutlinedIcon />,
            iconColor: "#059669",
            iconBackground: "#ECFDF5",
            progressColor: "#059669",
        },
        {
            value: "8",
            title: "Requests Resolved",
            subtitle: "This Week",
            trend: 8.3,
            extraLabel: "vs last week",
            icon: <AssignmentOutlinedIcon />,
            iconColor: "#7C3AED",
            iconBackground: "#F5F3FF",
            progressColor: "#7C3AED",
        },
        {
            value: "15",
            title: "Documents Uploaded",
            subtitle: "This Week",
            trend: -3.2,
            extraLabel: "vs last week",
            icon: <FolderOutlinedIcon />,
            iconColor: "#2563EB",
            iconBackground: "#EEF2FF",
            progressColor: "#2563EB",
        },
        {
            value: "68",
            title: "Days in School",
            subtitle: "This Term",
            trend: 5.0,
            extraLabel: "vs last term",
            icon: <CalendarMonthOutlinedIcon />,
            iconColor: "#EA580C",
            iconBackground: "#FFF7ED",
            progressColor: "#EA580C",
        },
        {
            value: "6",
            title: "Departments",
            subtitle: "In the school",
            trend: null,
            extraLabel: "Across all levels",
            icon: <BusinessOutlinedIcon />,
            iconColor: "#0891B2",
            iconBackground: "#ECFEFF",
            progressColor: "#0891B2",
        },
    ];

    const handleQuickAccessClick = (item) => {
        setSelectedStat({
            title: item.title,
            subtitle: item.description,
            icon: item.icon,
            iconColor: item.iconColor,
            iconBackground: item.iconBackground,
            overview: [
                { label: "Total entries", value: "—" },
                { label: "Awaiting action", value: "—" },
                { label: "Recent activity", value: "No records yet" },
            ],
            onOpen: item.path ? () => navigate(item.path) : undefined,
        });
    };

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
                                trend={stat.trend}
                                extraLabel={stat.extraLabel}
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
                    <QuickAccess onCardClick={handleQuickAccessClick} />
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
