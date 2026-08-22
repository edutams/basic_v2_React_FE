import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stack,
    LinearProgress,
    IconButton,
    Chip,
    Paper,
    Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";

/**
 * Premium Stat Card Breakdown Modal.
 * Displays term completion progress and 4 metric cards (Total, Spent, Holidays, Remaining).
 */
const StatCardBreakdownModal = ({ open, stat, onClose }) => {
    if (!stat) return null;

    const getOverviewValue = (labelKey) => {
        if (!Array.isArray(stat.overview)) return null;
        const item = stat.overview.find((i) => i.label?.toLowerCase().includes(labelKey.toLowerCase()));
        return item ? item.value : null;
    };

    const totalDays = getOverviewValue("total") ?? getOverviewValue("term") ?? 0;
    const daysSpent = getOverviewValue("spent") ?? getOverviewValue("days in") ?? stat.value ?? 0;
    const holidayDays = getOverviewValue("holiday") ?? 0;
    const daysRemaining = getOverviewValue("remaining") ?? getOverviewValue("left") ?? 0;

    const numericTotal = Number(totalDays) || 0;
    const numericSpent = Number(daysSpent) || 0;
    const percentage = numericTotal > 0 ? Math.min(100, Math.round((numericSpent / numericTotal) * 100)) : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
            <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            bgcolor: stat.iconBackground || "#FFF7ED",
                            color: stat.iconColor || "#EA580C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            "& svg": { fontSize: 22 },
                        }}
                    >
                        {stat.icon || <CalendarTodayOutlinedIcon />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#1e293b", lineHeight: 1.2 }}>
                            {stat.title}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
                            {stat.subtitle || "Term Progress & Summary"}
                        </Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2.5 }}>
                {Array.isArray(stat.overview) && stat.overview.length > 0 ? (
                    <Stack spacing={2.5}>
                        {/* Progress Highlight Banner */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                                border: "1px solid #fed7aa",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9a3412" }}>
                                    Term Completion Progress
                                </Typography>
                                <Chip
                                    label={`${percentage}% Complete`}
                                    size="small"
                                    sx={{
                                        bgcolor: "#ea580c",
                                        color: "#ffffff",
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                    }}
                                />
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: "rgba(234, 88, 12, 0.2)",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: "#ea580c",
                                        borderRadius: 4,
                                    },
                                }}
                            />

                            <Typography sx={{ fontSize: 11.5, color: "#c2410c", mt: 1, fontWeight: 500 }}>
                                {daysSpent} days spent • {holidayDays} holiday days allocated • {daysRemaining} days remaining.
                            </Typography>
                        </Paper>

                        <Grid container spacing={1.5} alignItems="stretch">
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        height: "100%",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        bgcolor: "#f8fafc",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "9px",
                                            bgcolor: "#eff6ff",
                                            color: "#2563eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            "& svg": { fontSize: 19 },
                                        }}
                                    >
                                        <CalendarTodayOutlinedIcon />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>
                                            {totalDays}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: 10.5, color: "text.secondary", fontWeight: 600, mt: 0.25 }}>
                                            Total Days
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        height: "100%",
                                        borderRadius: "12px",
                                        border: "1px solid #fed7aa",
                                        bgcolor: "#fff7ed",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "9px",
                                            bgcolor: "#ffedd5",
                                            color: "#ea580c",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            "& svg": { fontSize: 19 },
                                        }}
                                    >
                                        <CheckCircleOutlineOutlinedIcon />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#ea580c", lineHeight: 1.1 }}>
                                            {daysSpent}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: 10.5, color: "#c2410c", fontWeight: 600, mt: 0.25 }}>
                                            Days Spent
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        height: "100%",
                                        borderRadius: "12px",
                                        border: "1px solid #fde68a",
                                        bgcolor: "#fffbef",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "9px",
                                            bgcolor: "#fef3c7",
                                            color: "#d97706",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            "& svg": { fontSize: 19 },
                                        }}
                                    >
                                        <BeachAccessOutlinedIcon />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#d97706", lineHeight: 1.1 }}>
                                            {holidayDays}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: 10.5, color: "#b45309", fontWeight: 600, mt: 0.25 }}>
                                            Holidays
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        height: "100%",
                                        borderRadius: "12px",
                                        border: "1px solid #ddd6fe",
                                        bgcolor: "#f5f3ff",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.25,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "9px",
                                            bgcolor: "#ede9fe",
                                            color: "#7c3aed",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            "& svg": { fontSize: 19 },
                                        }}
                                    >
                                        <AccessTimeOutlinedIcon />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#7c3aed", lineHeight: 1.1 }}>
                                            {daysRemaining}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: 10.5, color: "#6d28d9", fontWeight: 600, mt: 0.25 }}>
                                            Days Left
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Stack>
                ) : (
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px dashed rgba(69, 67, 67, 0.3)",
                            textAlign: "center",
                            bgcolor: "#fafafa",
                        }}
                    >
                        <Typography
                            sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, color: stat.iconColor }}
                        >
                            {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.75 }}>
                            Stat Details & Overview
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                <Button onClick={onClose} variant="contained" color="primary" sx={{ borderRadius: "8px" }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StatCardBreakdownModal;
