"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useGetAlertByIdQuery, useAcknowledgeAlertMutation, useAddAlertNoteMutation, useResolveAlertMutation } from "@/features/alerts/api/alertsApi";
import { Container, Typography, Paper, Box, Chip, Button, TextField, Stack, Divider, CircularProgress, Alert as MuiAlert } from "@mui/material";
import { ResolveAlertDialog } from "@/components/ResolveAlertDialog";
import { AssignAlertDialog } from "@/components/AssignAlertDialog";

export default function AlertDetailPage() {
    const { id } = useParams<{ id: string }>();
    const alertId = Number(id);
    const [note, setNote] = useState("");

    const { data: alert } = useGetAlertByIdQuery(alertId);
    const [acknowledgeAlert, { isLoading: isAcknowledging }] = useAcknowledgeAlertMutation();
    const [addAlertNote, { isLoading: isSubmittingNote }] = useAddAlertNoteMutation();

    const searchParams = useSearchParams();
    const shouldOpenResolve = searchParams.get("resolve") === "true";
    const [isResolveOpen, setIsResolveOpen] = useState(shouldOpenResolve);

    const [isAssignOpen, setIsAssignOpen] = useState(false);

    async function handleAcknowledge() {
        await acknowledgeAlert(alertId)
    }

    async function handleSubmitNote() {
        const trimmedNote = note.trim();
        if (!trimmedNote) return;

        await addAlertNote({
            alertId,
            note: trimmedNote,
        }).unwrap();

        setNote("");
    }

    if (!alert) {
        return (
            <Container sx={{ mt: 4 }}>
                <MuiAlert severity="error">Alert not found.</MuiAlert>
            </Container>
        );
    }

    const status = alert.triage?.status ?? "new";
    const timeline = alert.timeline ?? [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, }} >
                    <Typography variant="h4">{alert.alertType}</Typography>
                    <Box>
                        <Chip
                            label={alert.severity}
                            color={alert.severity === "critical" ? "error" : "warning"}
                            sx={{ mr: 1 }}
                        />
                        <Chip label={status} />
                    </Box>
                </Box>

                <Typography variant="subtitle1" color="text.secondary">
                    {alert.device.name} — {alert.device.location}
                </Typography>

                <Box sx={{ my: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                    <Typography variant="h6">Trigger Reading</Typography>
                    <Typography>
                        {alert.readingName ?? "N/A"}: {alert.readingValue ?? "N/A"} /
                        Threshold: {alert.threshold ?? "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    {status === "new" && (
                        <Button
                            variant="contained"
                            onClick={handleAcknowledge}
                            disabled={isAcknowledging}
                        >
                            {isAcknowledging ? "Acknowledging..." : "Acknowledge"}
                        </Button>
                    )}

                    {status === "acknowledged" && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => setIsResolveOpen(true)}
                        >
                            Resolve
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        disabled={status === "resolved" || alert.triage?.assignedTo != null }
                        onClick={() => setIsAssignOpen(true)}
                    >
                        Assign
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Assignment
                </Typography>

                <Typography>
                    Current Assignee: {alert.triage?.assignedTo ?? "Unassigned"}
                </Typography>

                <Button
                    sx={{ mt: 1 }}
                    variant="outlined"
                    disabled={status === "resolved"}
                    onClick={() => setIsAssignOpen(true)}
                >
                    Change Assignee
                </Button>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Timeline
                </Typography>

                {timeline.length === 0 && (
                    <Typography color="text.secondary">
                        No timeline entries available.
                    </Typography>
                )}

                {timeline.length > 0 && (
                    <Stack spacing={2}>
                        {timeline.map((entry) => (
                            <Box key={entry.id}>
                                <Typography variant="body2">
                                    <strong>{entry.action}</strong>
                                    {entry.details ? ` — ${entry.details}` : ""}
                                </Typography>

                                {entry.note && (
                                    <Typography variant="body2" color="text.secondary">
                                        Note: {entry.note}
                                    </Typography>
                                )}

                                <Typography variant="caption" color="text.secondary">
                                    {new Date(entry.timestamp).toLocaleString()} · {entry.user}
                                </Typography>

                                <Divider sx={{ mt: 1 }} />
                            </Box>
                        ))}
                    </Stack>
                )}

                <Box sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        label="Add Note"
                        multiline
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={handleSubmitNote}
                        disabled={isSubmittingNote || note.trim().length === 0}
                    >
                        {isSubmittingNote ? "Submitting..." : "Submit"}
                    </Button>
                </Box>
            </Paper>

            <ResolveAlertDialog
                alertId={alertId}
                open={isResolveOpen}
                onClose={() => setIsResolveOpen(false)}
            />

            <AssignAlertDialog
                alertId={alertId}
                currentAssigneeId={alert.triage?.assignedTo}
                open={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
            />
        </Container>
    );
}