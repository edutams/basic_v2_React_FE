import React from "react";
import {
    Card,
    Box,
    Typography,
    Tooltip,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

/**
 * Stats Card — matching the same design as the bursary KpiCard:
 * Large rounded icon chip on the left, uppercase label, big value,
 * divider line, and bottom row with subtitle + trend + extra info.
 */
const StatsCard = ({
    icon,
    value,
    title,
    subtitle,
    progress,
    progressLabel,
    iconColor = "#159a72",
    iconBackground = "#e8f8f3",
    progressColor = "#159a72",
    onClick,
    trend,
    extraLabel,
}) => {
    const isPositiveTrend = typeof trend === "number" ? trend >= 0 : null;

    return (
        <Tooltip title={onClick ? "Click to view breakdown" : ""} placement="top" arrow>
            <Card
                elevation={0}
                onClick={onClick}
                sx={{
                    height: "100%",
                    bgcolor: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    cursor: onClick ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
                    "&:hover": onClick
                        ? {
                            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                            transform: "translateY(-2px)",
                            borderColor: "#94a3b8",
                        }
                        : {},
                }}
            >
                {/* Top section: icon + label + value */}
                <Box sx={{ p: "18px 20px 14px", flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        {/* Icon chip */}
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "12px",
                                backgroundColor: iconBackground,
                                color: iconColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                "& svg": {
                                    fontSize: 24,
                                },
                            }}
                        >
                            {icon}
                        </Box>

                        {/* Label + Value */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: "0.62rem",
                                    fontWeight: 700,
                                    color: "#6B7280",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.4,
                                    lineHeight: 1.25,
                                    mb: 0.5,
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                                    fontWeight: 800,
                                    color: "#111827",
                                    lineHeight: 1.2,
                                }}
                            >
                                {value}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Divider line */}
                <Box sx={{ mx: "18px", borderTop: "1px solid #F3F4F6" }} />

                {/* Bottom row: subtitle | trend | extra info */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: "18px",
                        py: "12px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "0.68rem",
                            color: "#9CA3AF",
                            fontWeight: 500,
                        }}
                    >
                        {subtitle}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {typeof trend === "number" && (
                            <>
                                {isPositiveTrend ? (
                                    <ArrowUpward sx={{ fontSize: 13, color: "#16A34A" }} />
                                ) : (
                                    <ArrowDownward sx={{ fontSize: 13, color: "#EF4444" }} />
                                )}
                                <Typography
                                    fontWeight={700}
                                    sx={{
                                        fontSize: "0.68rem",
                                        color: isPositiveTrend ? "#16A34A" : "#EF4444",
                                    }}
                                >
                                    {Math.abs(trend).toFixed(1)}%
                                </Typography>
                            </>
                        )}
                        {extraLabel && (
                            <Typography
                                sx={{
                                    fontSize: "0.65rem",
                                    color: "#9CA3AF",
                                    ml: 0.25,
                                }}
                            >
                                {extraLabel}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Card>
        </Tooltip>
    );
};

export default StatsCard;
