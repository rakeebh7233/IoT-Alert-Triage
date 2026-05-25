'use client';
import { useState } from 'react';
import { useGetAlertsQuery, useAcknowledgeAlertMutation } from '@/features/alerts/api/alertsApi';
import { useGetDevicesQuery } from '@/features/devices/api/devicesApi';
import { Container, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { FilterControls } from '@/components/FilterControls';
import { useRouter } from "next/navigation";
import { SummaryBar } from '@/components/SummaryBar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {AssignAlertDialog} from "../../components/AssignAlertDialog";


export default function AlertsPage() {
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [deviceId, setDeviceId] = useState("");
    const [sortBy, setSortBy] = useState<"severity" | "time" | "status">("time");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [acknowledgeAlert] = useAcknowledgeAlertMutation();
    const [assignAlertId, setAssignAlertId] = useState<number | null>(null);
    const { data: summaryAlerts = [] } = useGetAlertsQuery();

    const { data: alerts = [], isLoading, error } = useGetAlertsQuery({
        q: search || undefined,
        severity,
        status: statusFilter,
        device_id: deviceId || undefined,
    });

    const { data: devices } = useGetDevicesQuery();
    const router = useRouter();


    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>Alert Queue</Typography>

            <SummaryBar
                alerts={summaryAlerts}
                selectedStatus={statusFilter}
                onStatusClick={setStatusFilter}
            />

            <FilterControls
                search={search}
                setSearch={setSearch}
                severity={severity}
                setSeverity={setSeverity}
                deviceId={deviceId}
                setDeviceId={setDeviceId}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                devices={devices}
            />

            {/* Alert List Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Severity</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Device/Building</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Assignee</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>}
                        {error && <TableRow><TableCell colSpan={7}>Error loading alerts</TableCell></TableRow>}
                        {alerts?.map((alert) => (
                            <TableRow key={alert.id}>
                                <TableCell>
                                    <Chip label={alert.severity} color={alert.severity === 'critical' ? 'error' : 'warning'} size="small" />
                                </TableCell>
                                <TableCell>{alert.alertType}</TableCell>
                                <TableCell>{alert.device?.name} ({alert.device?.location})</TableCell>
                                <TableCell>{new Date(alert.timestampUtc).toLocaleTimeString()}</TableCell>
                                <TableCell>{alert.triage?.status || 'New'}</TableCell>
                                <TableCell>{alert.triage?.assignee?.name ?? "Unassigned"}</TableCell>
                                <TableCell>
                                    {alert.triage?.status === "new" && (
                                        <IconButton
                                            size="small"
                                            onClick={() => acknowledgeAlert(alert.id)}
                                        >
                                            <WarningIcon color="secondary" />
                                        </IconButton>
                                    )}

                                    {alert.triage?.status === "acknowledged" && (
                                        <IconButton
                                            size="small"
                                            onClick={() => router.push(`/alerts/${alert.id}?resolve=true`)}
                                        >
                                            <DoneAllIcon color="action" />
                                        </IconButton>
                                    )}

                                    {alert.triage?.status === "resolved" && (
                                        <IconButton size="small" >
                                            <DoneAllIcon color="success" />
                                        </IconButton>
                                    )}

                                    <IconButton
                                        size="small"
                                        onClick={() => setAssignAlertId(alert.id)}
                                        disabled={alert.triage?.status === "resolved"}
                                    >
                                        <PersonAddIcon color={alert.triage?.status === "resolved" ? 'disabled' : 'primary'} />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        onClick={() => router.push(`/alerts/${alert.id}`)}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {assignAlertId && (
                <AssignAlertDialog
                    alertId={assignAlertId}
                    currentAssigneeId={
                        alerts.find((a) => a.id === assignAlertId)?.triage?.assignedTo
                    }
                    open={Boolean(assignAlertId)}
                    onClose={() => setAssignAlertId(null)}
                />
            )}
        </Container>
    );
}