'use client';
import { useState } from 'react';
import { useGetAlertsQuery, useAcknowledgeAlertMutation } from '@/features/alerts/api/alertsApi';
import { Container, Typography, Box, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AlertsPage() {
    const [search, setSearch] = useState("");
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("");
    const [acknowledgeAlert] = useAcknowledgeAlertMutation();

    const { data: alerts = [], isLoading, error } = useGetAlertsQuery({
        q: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
    });

    const stats = ['New', 'Acknowledged', 'In Progress', 'Resolved', 'Dismissed'];

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Alert Queue</Typography>

            {/* Summary Bar */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 4, justifyContent: 'center' }}>
                {stats.map((status) => (
                    <Box key={status} sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>0</Typography>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>{status}</Typography>
                    </Box>
                ))}
            </Paper>

            {/* Filter Controls */}
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
                    <Select multiple label="Severity" value={[]}>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                    </Select>
                </FormControl>
            </Box>

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
                                <TableCell>{alert.triage?.assignedTo || 'Unassigned'}</TableCell>
                                <TableCell>
                                    <IconButton size="small"><CheckCircleIcon /></IconButton>
                                    <IconButton size="small"><VisibilityIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}