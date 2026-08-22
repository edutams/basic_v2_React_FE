import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Stack,
  Typography,
  Divider,
  CircularProgress,
  Button
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import tenantApi from "@/api/tenant/tenant_api";
import { TenantAuthContext } from "@/context/TenantContext/auth";
import { ActivityLogModal } from "@/pages/tenant/staff-manager/non-teaching-dashboard/components/Activity-log";

dayjs.extend(relativeTime);

const defaultIconPresets = [
  { icon: AssignmentOutlinedIcon, color: "#7c3aed", bg: "#ede9fe" },
  { icon: HowToRegOutlinedIcon, color: "#e11d48", bg: "#ffe4e6" },
  { icon: CheckCircleOutlineOutlinedIcon, color: "#16a34a", bg: "#dcfce7" },
  { icon: CloudUploadOutlinedIcon, color: "#2563eb", bg: "#dbeafe" },
  { icon: DescriptionOutlinedIcon, color: "#64748b", bg: "#e2e8f0" },
];

const getLogMeta = (description = "", logName = "", index = 0) => {
  const desc = (description || "").toLowerCase();
  const name = (logName || "").toLowerCase();

  if (desc.includes("assignment") || name.includes("assignment")) {
    return defaultIconPresets[0];
  }
  if (desc.includes("attendance") || name.includes("attendance")) {
    return defaultIconPresets[1];
  }
  if (desc.includes("grade") || desc.includes("mark") || desc.includes("score") || name.includes("grade") || name.includes("assessment")) {
    return defaultIconPresets[2];
  }
  if (desc.includes("upload") || desc.includes("resource") || desc.includes("material") || desc.includes("file") || name.includes("resource")) {
    return defaultIconPresets[3];
  }

  return defaultIconPresets[index % defaultIconPresets.length];
};

export default function ActivityLog() {
  const authContext = useContext(TenantAuthContext);
  const currentUserId = authContext?.user?.id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      setLogs([]);
      return;
    }

    let isMounted = true;

    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const res = await tenantApi.get(`/activity-logs/causer/${currentUserId}`, {
          params: { limit: 5 },
        });
        const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);

        if (isMounted) {
          setLogs(Array.isArray(list) ? list.slice(0, 5) : []);
        }
      } catch (err) {
        console.warn("Failed to fetch logged-in user activity logs:", err);
        if (isMounted) {
          setLogs([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivityLogs();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  return (
    <>
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: "10px",
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
          },
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>
              Activity Log
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => setModalOpen(true)}
            >
              View all
            </Button>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress size={26} />
            </Box>
          ) : logs.length === 0 ? (
            <Box textAlign="center" py={3.5}>
              <HistoryOutlinedIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.5 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
                No recent activity recorded
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>
                Your actions will appear here as you perform activities.
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1}>
              {logs.map((item, idx) => {
                const meta = getLogMeta(item.description, item.log_name, idx);
                const Icon = meta.icon;
                const titleText = item.description || "System Action";
                const subtitleText = item.log_name || item.event || "Activity";
                const timeText = item.my_updated_at || (item.created_at ? dayjs(item.created_at).fromNow() : "Recently");

                return (
                  <Stack
                    key={item.id || idx}
                    direction="row"
                    spacing={1.25}
                    alignItems="flex-start"
                    sx={{
                      pt: 0.2,
                      transition: "transform 150ms ease",
                      "&:hover": { transform: "translateX(2px)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: meta.bg,
                        color: meta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 17 }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: "#1e293b" }}>
                        {titleText}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.3 }}>
                        {subtitleText}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 10.5, color: "text.disabled", whiteSpace: "nowrap" }}>
                      {timeText}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Full Activity Log Modal */}
      <ActivityLogModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
