"use client";

import { useMemo, useState } from "react";
import {Avatar,Box,Button,Dialog,DialogTitle,DialogContent,DialogActions,List,ListItemButton,ListItemAvatar, ListItemText,TextField, Typography,Chip,} from "@mui/material";
import { useGetUsersQuery } from "../features/users/usersApi";
import { useAssignAlertMutation } from "../features/alerts/api/alertsApi";

type AssignAlertDialogProps = {
  alertId: number;
  currentAssigneeId?: string | null;
  open: boolean;
  onClose: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AssignAlertDialog({alertId, currentAssigneeId, open, onClose}: AssignAlertDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId ?? "");
  const [note, setNote] = useState("");

  const { data: users = [], isLoading } = useGetUsersQuery();
  const [assignAlert, { isLoading: isAssigning }] = useAssignAlertMutation();

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [search, users]);

  async function handleAssign() {
    if (!selectedUserId) return;

    await assignAlert({
      alertId,
      assignee_id: selectedUserId,
      note: note.trim() || undefined,
    }).unwrap();

    setSearch("");
    setNote("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Alert</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          size="small"
          label="Search team members"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />

        {isLoading && (
          <Typography color="text.secondary">Loading users...</Typography>
        )}

        {!isLoading && (
          <List sx={{ maxHeight: 320, overflow: "auto" }}>
            {filteredUsers.map((user) => {
              const isCurrent = user.id === currentAssigneeId;
              const isSelected = user.id === selectedUserId;

              return (
                <ListItemButton
                  key={user.id}
                  selected={isSelected}
                  onClick={() => setSelectedUserId(user.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{getInitials(user.name)}</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {user.name}
                        {isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={user.role}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}

        <TextField
          fullWidth
          label="Reason for assignment"
          multiline
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedUserId || isAssigning}
        >
          {isAssigning ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}