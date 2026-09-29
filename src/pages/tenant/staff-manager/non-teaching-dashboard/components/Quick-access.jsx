import React from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    useTheme,
} from "@mui/material";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";

const QuickAccess = ({
    onNavigate,
    onCardClick,
    items = [
        {
            title: "Submit Work Report",
            icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/work-reports/create",
        },
        {
            title: "Staff Directory",
            icon: <GroupsOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/staff",
        },
        {
            title: "Document Center",
            icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/documents",
        },
        {
            title: "Class Directory",
            icon: <BusinessOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/classes",
        },
        {
            title: "Student Directory",
            icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/students",
        },
        {
            title: "Notice Board",
            icon: <CampaignOutlinedIcon sx={{ fontSize: 16 }} />,
            path: "/notices",
        },
    ],
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const handleClick = (item) => {
        if (onCardClick) onCardClick(item);
        else if (onNavigate) onNavigate(item);
    };

    return (
        <Box
            sx={{
                bgcolor: isDark ? theme.palette.background.paper : "#ffffff",
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                borderRadius: "14px",
                p: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
        >
            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: isDark ? "#fff" : "#0f172a" }}>
                Quick Links
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1}>
                {items.map((item, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        startIcon={item.icon}
                        onClick={() => handleClick(item)}
                        sx={{
                            borderRadius: "8px",
                            px: 1.6,
                            py: 0.65,
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "none",
                            borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                            color: isDark ? "#cbd5e1" : "#334155",
                            "&:hover": {
                                borderColor: "#94a3b8",
                                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                            },
                        }}
                    >
                        {item.title}
                    </Button>
                ))}
            </Stack>
        </Box>
    );
};

export default QuickAccess;