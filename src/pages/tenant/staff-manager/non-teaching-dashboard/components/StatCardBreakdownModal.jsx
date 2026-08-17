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
} from "@mui/material";

/**
 * Non-teaching stat card breakdown modal.
 *
 * Opens when a stat card is clicked and shows the card's headline info with a
 * placeholder breakdown area — swap the placeholder for real breakdown content
 * (tables/charts) once the stats endpoints are wired up.
 */
const StatCardBreakdownModal = ({ open, stat, onClose }) => {
    if (!stat) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: stat.iconBackground,
                            color: stat.iconColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            "& svg": { fontSize: 20 },
                        }}
                    >
                        {stat.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>
                            {stat.title}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            {stat.subtitle}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Typography
                    sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        color: "text.secondary",
                        mb: 1.5,
                    }}
                >
                    Breakdown
                </Typography>
                <Box
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px dashed rgba(69, 67, 67, 0.45)",
                        textAlign: "center",
                        bgcolor: (t) =>
                            t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#fafafa",
                    }}
                >
                    <Typography
                        sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: stat.iconColor }}
                    >
                        {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.75 }}>
                        Detailed breakdown coming soon
                    </Typography>
                    {typeof stat.progress === "number" && (
                        <Box sx={{ mt: 2, maxWidth: 280, mx: "auto", textAlign: "left" }}>
                            <LinearProgress
                                variant="determinate"
                                value={stat.progress}
                                sx={{
                                    height: 6,
                                    borderRadius: 6,
                                    backgroundColor: "#F3F4F6",
                                    "& .MuiLinearProgress-bar": {
                                        backgroundColor: stat.progressColor,
                                        borderRadius: 6,
                                    },
                                }}
                            />
                            {stat.progressLabel && (
                                <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.75 }}>
                                    {stat.progressLabel}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default StatCardBreakdownModal;
