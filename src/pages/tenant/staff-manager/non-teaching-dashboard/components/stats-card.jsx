import React from "react";
import {
    Card,
    CardContent,
    Box,
    Typography,
    LinearProgress,
} from "@mui/material";

const StatsCard = ({
    icon,
    value,
    title,
    subtitle,
    progress,
    progressLabel,
    iconColor = "#16a085",
    iconBackground = "#e8f8f5",
    progressColor = "#16a085",
}) => {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                border: "1px solid #edf0f2",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                transition: "all 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
                    transform: "translateY(-1px)",
                },
            }}
        >
            <CardContent
                sx={{
                    p: "16px !important",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.8,
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            minWidth: 46,
                            borderRadius: "11px",
                            backgroundColor: iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: iconColor,
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Content */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {/* Value */}
                        <Typography
                            sx={{
                                fontSize: "22px",
                                lineHeight: 1.1,
                                fontWeight: 700,
                                color: "#111827",
                                mb: 0.4,
                            }}
                        >
                            {value}
                        </Typography>

                        {/* Title */}
                        <Typography
                            sx={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#27303f",
                                lineHeight: 1.3,
                                mb: 0.7,
                            }}
                        >
                            {title}
                        </Typography>

                        {/* Subtitle */}
                        {subtitle && (
                            <Typography
                                sx={{
                                    fontSize: "10px",
                                    color: "#6b7280",
                                    lineHeight: 1.3,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Progress */}
                {progress !== undefined && (
                    <Box sx={{ mt: 1.6 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 4,
                                borderRadius: 10,
                                backgroundColor: "#edf1f3",

                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: progressColor,
                                    borderRadius: 10,
                                },
                            }}
                        />

                        {progressLabel && (
                            <Typography
                                sx={{
                                    fontSize: "9px",
                                    color: "#4b5563",
                                    mt: 0.7,
                                }}
                            >
                                {progressLabel}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;