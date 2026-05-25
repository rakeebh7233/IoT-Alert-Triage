import { Box, FormControl, TextField, InputLabel, Select, MenuItem, Stack, Chip } from "@mui/material";
import { Device } from "@/features/devices/types/device";

interface FilterControlsProps {
    search: string;
    setSearch: (val: string) => void;
    severity: string;
    setSeverity: (val: string) => void;
    deviceId: string;
    setDeviceId: (val: string) => void;
    statusFilter: string | undefined;
    setStatusFilter: (val: string | undefined) => void;
    devices: Device[] | undefined;
  }

export function FilterControls({
    search,
    setSearch,
    severity,
    setSeverity,
    deviceId,
    setDeviceId,
    statusFilter,
    setStatusFilter,
    devices,
  }: FilterControlsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
                size="small"
                label="Search device or title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Severity</InputLabel>
                <Select label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <MenuItem value="">All Severities</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Device / Building</InputLabel>
                <Select
                    label="Device / Building"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                >
                    <MenuItem value="">All devices</MenuItem>
                    {devices?.map((device: Device) => (
                        <MenuItem key={device.id} value={device.id}>
                            {device.name} — {device.location}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
                {["new", "acknowledged", "resolved", "dismissed"].map((value) => (
                    <Chip
                        key={value}
                        label={value}
                        clickable
                        color={statusFilter === value ? "primary" : "default"}
                        onClick={() => setStatusFilter(statusFilter === value ? "" : value)}
                    />
                ))}
            </Stack>
        </Box>

    );
}