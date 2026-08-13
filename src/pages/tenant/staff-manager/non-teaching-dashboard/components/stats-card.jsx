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
                bgcolor: iconBackground,
                border: `1.5px solid ${iconColor}`,
                borderRadius: "8px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
                "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <CardContent
                sx={{
                    p: "12px !important",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            mb: 0.3,
                        }}
                    >
                        <Typography
                            fontWeight="600"
                            sx={{
                                fontSize: "0.78rem",
                                color: "#374151",
                                lineHeight: 1.25,
                                maxWidth: "75%",
                            }}
                        >
                            {title}
                        </Typography>

                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "7px",
                                backgroundColor: iconBackground,
                                color: iconColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                "& svg": {
                                    fontSize: 16,
                                },
                            }}
                        >
                            {icon}
                        </Box>
                    </Box>

                    {subtitle && (
                        <Typography
                            sx={{
                                fontSize: "0.67rem",
                                color: "#9CA3AF",
                                lineHeight: 1.2,
                                mb: 0.5,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}

                    <Typography
                        fontWeight="700"
                        sx={{
                            fontSize: "1.05rem",
                            color: "#111827",
                            lineHeight: 1.2,
                            mt: 0.2,
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                {progress !== undefined && (
                    <Box sx={{ mt: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 4,
                                borderRadius: 4,
                                backgroundColor: "#F3F4F6",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: progressColor,
                                    borderRadius: 4,
                                },
                            }}
                        />

                        {progressLabel && (
                            <Typography
                                sx={{
                                    fontSize: "0.65rem",
                                    color: "#6B7280",
                                    mt: 0.5,
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