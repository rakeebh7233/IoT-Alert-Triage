import { Box, Paper, Typography } from "@mui/material";
import type { Alert } from "../features/alerts/types/alert";

const statuses = ["All","new", "acknowledged", "resolved", "dismissed"];

type SummaryBarProps = {
  alerts: Alert[];
  selectedStatus?: string;
  onStatusClick: (status: string | undefined) => void;
};

export function SummaryBar({
  alerts,
  selectedStatus,
  onStatusClick,
}: SummaryBarProps) {
  const statusCounts = statuses.reduce<Record<string, number>>((acc, status) => {
    if (status === "All") {
        acc[status] = alerts.length;
      } else {
        acc[status] = alerts.filter(
          (alert) => alert.triage?.status === status
        ).length;
      }
  
      return acc;
  }, {});

  return (
    <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 4, justifyContent: "center" }}>
      {statuses.map((status) => {
        const isActive = selectedStatus === status;

        return (
          <Box
            key={status}
            onClick={() => onStatusClick(status === "All" ? undefined : isActive
                                                            ? undefined: status)}
            sx={{
              textAlign: "center",
              cursor: "pointer",
              color: isActive ? "primary.main" : "inherit",
              borderBottom: isActive ? "2px solid" : "2px solid transparent",
              borderColor: isActive ? "primary.main" : "transparent",
              pb: 1,
              "&:hover": { color: "primary.main" },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {statusCounts[status] ?? 0}
            </Typography>

            <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
              {status}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}