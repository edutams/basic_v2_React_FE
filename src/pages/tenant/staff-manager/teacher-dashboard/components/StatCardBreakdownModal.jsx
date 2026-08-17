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
} from "@mui/material";

/**
 * Teacher stat card breakdown modal.
 *
 * Opens when a stat card is clicked and shows the card's headline info with a
 * placeholder breakdown area — swap the placeholder for real breakdown content
 * (tables/charts) once the stats endpoints are wired up.
 */
const StatCardBreakdownModal = ({ open, stat, onClose }) => {
    if (!stat) return null;
    const Icon = stat.icon;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: stat.iconBg,
                            color: stat.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>
                            {stat.label}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                            {stat.sub}
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
                        sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: stat.color }}
                    >
                        {stat.value}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.75 }}>
                        Detailed breakdown coming soon
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default StatCardBreakdownModal;
