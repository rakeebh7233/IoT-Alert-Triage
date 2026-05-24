import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { DateTime } from "luxon";

const router = Router();

router.get("/", async (req, res) => {
    const devices = await prisma.device.findMany({
        where: {
            company: req.user!.company,
        },
    });
    res.json(devices);
});


router.get("/:id/readings", async (req, res) => {
  const deviceId = req.params.id;
  const { start, end } = req.query;

  if (typeof start !== "string" || typeof end !== "string") {
    return res.status(400).json({
      error: "start and end query params are required",
    });
  }

  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      company: req.user!.company,
    },
  });

  if (!device) {
    return res.status(404).json({
      error: "Device not found",
    });
  }

  const startUtc = DateTime.fromISO(start, {
    zone: device.timezone,
  }).toUTC();

  const endUtc = DateTime.fromISO(end, {
    zone: device.timezone,
  }).toUTC();

  if (!startUtc.isValid || !endUtc.isValid) {
    return res.status(400).json({
      error: "Invalid start or end datetime",
    });
  }

  if (endUtc <= startUtc) {
    return res.status(400).json({
      error: "end must be after start",
    });
  }

  const readings = await prisma.sensorReading.findMany({
    where: {
      deviceId,
      timestampUtc: {
        gte: startUtc.toJSDate(),
        lte: endUtc.toJSDate(),
      },
    },
    orderBy: {
      timestampUtc: "asc",
    },
  });

  const response = readings.map((reading) => ({
    id: reading.id,
    deviceId: reading.deviceId,
    inputName: reading.inputName,
    inputValue: reading.inputValue,
    breachesThreshold: reading.breachesThreshold,

    timestampUtc: reading.timestampUtc.toISOString(),

    timestampLocal: DateTime.fromJSDate(reading.timestampUtc)
      .setZone(device.timezone)
      .toISO(),

    timezone: device.timezone,
  }));

  return res.json({
    device: {
      id: device.id,
      name: device.name,
      timezone: device.timezone,
    },
    startLocal: start,
    endLocal: end,
    readings: response,
  });
});

router.get("/:id", async (req, res) => {
    const device = await prisma.device.findFirst({
        where: {
            id: req.params.id,
            company: req.user!.company,
        },
        include: {
            alerts: true,
        },
    });

    if (!device) {
        return res.status(404).json({
            error: "Device not found",
        });
    }
    res.json(device);
});

export default router;