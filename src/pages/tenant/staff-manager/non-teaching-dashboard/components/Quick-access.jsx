import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    ButtonBase,
    Tooltip,
} from "@mui/material";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ParentCard from "@/components/shared/ParentCard";

const QuickAccess = ({
    onNavigate,
    onCardClick,
    items = [
        {
            title: "Submit Work Report",
            description: "Log your daily activities",
            icon: <AssignmentTurnedInOutlinedIcon />,
            iconColor: "#159a72",
            iconBackground: "#e8f8f3",
            path: "/work-reports/create",
        },
        {
            title: "Staff Directory",
            description: "Find staff contacts",
            icon: <GroupsOutlinedIcon />,
            iconColor: "#7446c8",
            iconBackground: "#f2ebff",
            path: "/staff",
        },
        {
            title: "Document Center",
            description: "Access shared files",
            icon: <DescriptionOutlinedIcon />,
            iconColor: "#2563eb",
            iconBackground: "#eaf2ff",
            path: "/documents",
        },
        {
            title: "Class Directory",
            description: "View class information",
            icon: <BusinessOutlinedIcon />,
            iconColor: "#e59a20",
            iconBackground: "#fff5e7",
            path: "/classes",
        },
        {
            title: "Student Directory",
            description: "View student information",
            icon: <SchoolOutlinedIcon />,
            iconColor: "#159a9a",
            iconBackground: "#e7f8f8",
            path: "/students",
        },
        {
            title: "Notice Board",
            description: "Read latest notices",
            icon: <CampaignOutlinedIcon />,
            iconColor: "#d05c7a",
            iconBackground: "#fff0f3",
            path: "/notices",
        },
    ],
}) => {

    const handleNavigate = (item) => {
        if (onNavigate) {
            onNavigate(item);
        }
    };

    const handleCardClick = (item) => {
        if (onCardClick) {
            onCardClick(item);
        } else if (onNavigate) {
            onNavigate(item);
        }
    };

    return (
        <ParentCard
            elevation={0}
            sx={{
                width: "100%",

                /*
                |--------------------------------------------------------------------------
                | Outer Section
                |--------------------------------------------------------------------------
                */

                border: "1px solid #E5E7EB",

                borderRadius: "14px",

                backgroundColor: "#ffffff",

                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",

                overflow: "hidden",
            }}
        >
            <CardContent
                sx={{
                    p: {
                        xs: 1,
                        sm: 1.25,
                        md: 1.5,
                    },

                    "&:last-child": {
                        pb: {
                            xs: 1,
                            sm: 1.25,
                            md: 1.5,
                        },
                    },
                }}
            >

                {/* =========================================================
                    SECTION TITLE
                ========================================================= */}

                <Typography
                    component="h2"
                    sx={{
                        fontSize: {
                            xs: "13px",
                            sm: "14px",
                            md: "15px",
                        },

                        fontWeight: 700,

                        color: "#182230",

                        lineHeight: 1.3,

                        mb: {
                            xs: 1.2,
                            sm: 1.4,
                            md: 1.5,
                        },
                    }}
                >
                    Quick Access
                </Typography>


                {/* =========================================================
                    QUICK ACCESS GRID
                ========================================================= */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(6, 1fr)",
                        },

                        gap: {
                            xs: 1,
                            sm: 1.2,
                            md: 1.25,
                        },
                    }}
                >

                    {items.map((item, index) => (

                        <Tooltip
                            key={`${item.title}-${index}`}
                            title={`View ${item.title} overview`}
                            placement="top"
                            arrow
                        >
                            <ButtonBase
                                onClick={() => handleCardClick(item)}
                                sx={{
                                    display: "block",

                                    width: "100%",

                                    textAlign: "left",

                                    borderRadius: "7px",

                                    overflow: "hidden",
                                }}
                            >

                                {/* =================================================
                                INDIVIDUAL QUICK ACCESS CARD
                            ================================================= */}

                                <Box
                                    sx={{
                                        width: "100%",

                                        minHeight: {
                                            xs: 64,
                                            sm: 68,
                                            md: 70,
                                        },

                                        display: "flex",

                                        alignItems: "center",

                                        gap: {
                                            xs: 0.9,
                                            sm: 1,
                                        },

                                        px: {
                                            xs: 1,
                                            sm: 1.15,
                                            md: 1.2,
                                        },

                                        py: {
                                            xs: 0.8,
                                            sm: 0.85,
                                            md: 0.9,
                                        },

                                        border: "none",

                                        borderRadius: "8px",

                                        backgroundColor: item.iconBackground,

                                        boxSizing: "border-box",

                                        transition: "all 0.18s ease",

                                        "&:hover": {
                                            backgroundColor: item.iconBackground,

                                            transform: "translateY(-2px)",

                                            boxShadow:
                                                "0 4px 12px rgba(15, 23, 42, 0.08)",
                                        },
                                    }}
                                >

                                    {/* =================================================
                                    ICON
                                ================================================= */}

                                    <Box
                                        sx={{
                                            width: {
                                                xs: 34,
                                                sm: 36,
                                                md: 38,
                                            },

                                            height: {
                                                xs: 34,
                                                sm: 36,
                                                md: 38,
                                            },

                                            minWidth: {
                                                xs: 34,
                                                sm: 36,
                                                md: 38,
                                            },

                                            borderRadius: "8px",

                                            backgroundColor: "#ffffff",

                                            color: item.iconColor,

                                            display: "flex",

                                            alignItems: "center",

                                            justifyContent: "center",

                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",

                                            "& svg": {
                                                fontSize: {
                                                    xs: 19,
                                                    sm: 20,
                                                    md: 21,
                                                },
                                            },
                                        }}
                                    >
                                        {item.icon}
                                    </Box>


                                    {/* =================================================
                                    TEXT CONTENT
                                ================================================= */}

                                    <Box
                                        sx={{
                                            flex: 1,

                                            minWidth: 0,

                                            overflow: "hidden",
                                        }}
                                    >

                                        {/* Title */}

                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xs: "11px",
                                                    sm: "11.5px",
                                                    md: "12px",
                                                },

                                                fontWeight: 600,

                                                color: "#182230",

                                                lineHeight: 1.25,

                                                mb: 0.3,

                                                whiteSpace: "nowrap",

                                                overflow: "hidden",

                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.title}
                                        </Typography>


                                        {/* Description */}

                                        <Typography
                                            component="div"
                                            sx={{
                                                fontSize: {
                                                    xs: "9.5px",
                                                    sm: "10px",
                                                    md: "10.5px",
                                                },

                                                fontWeight: 400,

                                                color: "#667085",

                                                lineHeight: 1.25,

                                                whiteSpace: "nowrap",

                                                overflow: "hidden",

                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.description}
                                        </Typography>

                                    </Box>

                                </Box>

                            </ButtonBase>

                        </Tooltip>

                    ))}

                </Box>

            </CardContent>
        </ParentCard>
    );
};

export default QuickAccess;