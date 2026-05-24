import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
    const alerts = await prisma.alert.findMany({
        where: {
            device: {
                company: req.user!.company,
            },
        },

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
    const id = Number(req.params.id);
    const alert = await prisma.alert.findFirst({
        where: {
            id,
            device: {
                company: req.user!.company,
            },
        },

        include: {
            device: true,
            triage: true,
            timeline: {
                orderBy: { timestamp: "asc" }
            }
        },
    });

    if (!alert) {
        return res.status(404).json({
            error: "Alert not found",
        });
    }

    res.json(alert);
});

export default router;