import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

const router = Router();

function parseId(id: string) {
    const parsed = Number(id);
    return Number.isInteger(parsed) ? parsed : null;
}

async function findTenantAlert(alertId: number, company: string) {
    return prisma.alert.findFirst({
        where: {
            id: alertId,
            device: { company },
        },
        include: {
            device: true,
            triage: true,
            timeline: {
                orderBy: { timestamp: "asc" },
            },
        },
    });
}

router.get("/", async (req, res) => {
    const severity = typeof req.query.severity === "string" ? req.query.severity : undefined;
    const deviceId = typeof req.query.device_id === "string" ? req.query.device_id : undefined;
    const assignedTo = typeof req.query.assigned_to === "string"
        ? req.query.assigned_to
        : undefined;

    const q =
        typeof req.query.q === "string" && req.query.q.trim().length > 0
            ? req.query.q.trim()
            : undefined;

    const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

    const statusQuery = req.query.status;
    const statuses = typeof statusQuery === "string"
        ? [statusQuery] : Array.isArray(statusQuery)
            ? statusQuery.filter((s): s is string => typeof s === "string") : undefined;

    const where: Prisma.AlertWhereInput = {
        device: {
            company: req.user!.company,
        },
    };

    if (severity) { where.severity = severity; }
    if (deviceId) { where.deviceId = deviceId; }
    if (from || to) {
        where.timestampUtc = {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
        };
    }

    if (statuses?.length || assignedTo) {
        where.triage = {
            is: {
                ...(statuses?.length ? { status: { in: statuses } } : {}),
                ...(assignedTo ? { assignedTo } : {}),
            },
        };
    }

    if (q) {
        where.OR = [
            { alertType: { contains: q } },
            { device: { is: { name: { contains: q } } } },
            { device: { is: { id: { contains: q } } } },
        ];
    }

    const alerts = await prisma.alert.findMany({
        where,
        include: {
            device: true,
            triage: true,
        },
        orderBy: {
            timestampUtc: "desc",
        },
    });

    res.json(alerts);
});

router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) { return res.status(400).json({ error: "Invalid alert id" }); }

    const alert = await findTenantAlert(id, req.user!.company);
    if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
    }

    res.json(alert);
});

router.post("/:id/acknowledge", async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) { return res.status(400).json({ error: "Invalid alert id" }); }

    const alert = await findTenantAlert(id, req.user!.company);
    if (!alert || !alert.triage) {
        return res.status(404).json({ error: "Alert not found" });
    }

    if (alert.triage.status !== "new") {
        return res.status(409).json({
            error: `Cannot acknowledge alert from status '${alert.triage.status}'`,
        });
    }

    await prisma.alertTriage.update({
        where: { alertId: id },
        data: {
            status: "acknowledged",
            acknowledgedAt: new Date(),
        },
    });

    await prisma.alertTimelineEntry.create({
        data: {
            alertId: id,
            action: "acknowledged",
            user: req.user!.name,
            details: "Alert acknowledged",
        },
    });

    const updated = await findTenantAlert(id, req.user!.company);
    res.json(updated);
});

router.post("/:id/assign", async (req, res) => {
    const id = parseId(req.params.id);
    const { assignee_id, note } = req.body;

    if (!id) { return res.status(400).json({ error: "Invalid alert id" }); }
    if (typeof assignee_id !== "string") {
        return res.status(400).json({ error: "assignee_id is required" });
    }

    const alert = await findTenantAlert(id, req.user!.company);
    if (!alert || !alert.triage) {
        return res.status(404).json({ error: "Alert not found" });
    }

    if (alert.triage.status === "resolved" || alert.triage.status === "dismissed") {
        return res.status(409).json({
            error: `Cannot assign alert from terminal status '${alert.triage.status}'`,
        });
    }

    const assignee = await prisma.user.findFirst({
        where: {
            id: assignee_id,
            company: req.user!.company,
        },
    });
    if (!assignee) {
        return res.status(404).json({ error: "Assignee not found" });
    }

    await prisma.alertTriage.update({
        where: { alertId: id },
        data: {
            assignedTo: assignee.id,
        },
    });

    await prisma.alertTimelineEntry.create({
        data: {
            alertId: id,
            action: "assigned",
            user: req.user!.name,
            details: `Assigned to ${assignee.name}`,
            note: typeof note === "string" ? note : null,
        },
    });

    const updated = await findTenantAlert(id, req.user!.company);
    res.json(updated);
});

router.post("/:id/notes", async (req, res) => {
    const id = parseId(req.params.id);
    const { note } = req.body;

    if (!id) { return res.status(400).json({ error: "Invalid alert id" }); }

    if (typeof note !== "string" || note.trim().length === 0) {
        return res.status(400).json({ error: "note is required" });
    }

    const alert = await findTenantAlert(id, req.user!.company);
    if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
    }

    await prisma.alertTimelineEntry.create({
        data: {
            alertId: id,
            action: "note_added",
            user: req.user!.name,
            details: "Note added",
            note,
        },
    });

    const updated = await findTenantAlert(id, req.user!.company);
    res.json(updated);
});

router.post("/:id/resolve", async (req, res) => {
    const id = parseId(req.params.id);
    const {
        resolution_type,
        root_cause,
        action_taken,
        preventive_measures,
        time_spent_minutes,
    } = req.body;

    if (!id) { return res.status(400).json({ error: "Invalid alert id" }); }
    if (typeof resolution_type !== "string" ||
        typeof root_cause !== "string" ||
        typeof action_taken !== "string") {
        return res.status(400).json({
            error: "resolution_type, root_cause, and action_taken are required",
        });
    }

    const allowedResolutionTypes = [
        "fixed",
        "false_alarm",
        "known_issue",
        "deferred",
        "cannot_reproduce",
    ];
    if (!allowedResolutionTypes.includes(resolution_type)) {
        return res.status(400).json({
            error: "Invalid resolution_type",
        });
    }

    const alert = await findTenantAlert(id, req.user!.company);
    if (!alert || !alert.triage) {
        return res.status(404).json({ error: "Alert not found" });
    }

    if (alert.triage.status !== "acknowledged") {
        return res.status(409).json({
            error: `Cannot resolve alert from status '${alert.triage.status}'`,
        });
    }

    await prisma.alertTriage.update({
        where: { alertId: id },
        data: {
            status: "resolved",
            resolvedAt: new Date(),
            resolutionType: resolution_type,
            resolutionRootCause: root_cause,
            resolutionActionTaken: action_taken,
            resolutionPreventiveMeasures:
                typeof preventive_measures === "string" ? preventive_measures : null,
            resolutionTimeSpentMinutes:
                typeof time_spent_minutes === "number" ? time_spent_minutes : null,
        },
    });

    await prisma.alertTimelineEntry.create({
        data: {
            alertId: id,
            action: "resolved",
            user: req.user!.name,
            details: `Resolved as ${resolution_type}`,
        },
    });

    const updated = await findTenantAlert(id, req.user!.company);
    res.json(updated);
});

export default router;