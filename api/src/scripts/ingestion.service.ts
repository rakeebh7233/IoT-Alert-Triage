import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";
import path from "path";
import { SensorMessageSchema, type SensorMessage } from "../utils/message.validator.js";

async function ingestSensors() {
  try {
    // 1. Get all valid device IDs, readingTypes, thresholds from the database
    const devices = await prisma.device.findMany({
      select: {
        id: true,
        readingTypes: true,
        alertThresholds: true,
      },
    });
    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    // 2. Load sensor messages
    const dataPath = path.join(process.cwd(), "..", "data", "sensor_messages.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const messages = JSON.parse(rawData);

    // 3. Process and validate
    for (const msg of messages) {
      // Validate alert/recovery messages have required fields
      const result = SensorMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn(`Skipping message: Invalid schema for device_id ${msg.device_id}`, result.error.cause);
        continue;
      }

      const validMsg = result.data;

      // Validate device ID
      const device = deviceMap.get(validMsg.device_id);
      if (!device) {
        console.warn(`Skipping message: Unknown device_id ${validMsg.device_id}`);
        continue;
      }

      if (validMsg.message_type === "reading") {
        for (const input of validMsg.inputs) {
          // Validate readings match the device's expected reading_types.
          const readingTypes = device.readingTypes as string[];
          if (!readingTypes.includes(input.input_name)) {
            console.warn(
              `Skipping invalid reading type ${input.input_name} for ${validMsg.device_id}`
            );
            continue;
          }

          // Validate sensor readings against the device's alert_thresholds
          const thresholds = device.alertThresholds as Record<string, number>;
          const highThreshold = thresholds[`${input.input_name}_high`];
          const lowThreshold = thresholds[`${input.input_name}_low`];

          const breachesHigh =
            highThreshold !== undefined && input.input_value > highThreshold;
          const breachesLow =
            lowThreshold !== undefined && input.input_value < lowThreshold;
          const breachesThreshold = breachesHigh || breachesLow;

          // Detect and handle duplicate messages
          const duplicate = await prisma.sensorReading.findFirst({
            where: {
              deviceId: validMsg.device_id,
              timestampUtc: new Date(validMsg.timestamp),
              inputName: input.input_name,
              inputValue: input.input_value,
            },
          });
          if (duplicate) {
            console.warn(`Duplicate reading skipped for ${validMsg.device_id}`);
            continue;
          }

          await prisma.sensorReading.create({
            data: {
              deviceId: validMsg.device_id,
              timestampUtc: new Date(validMsg.timestamp),
              inputName: input.input_name,
              inputValue: input.input_value,
              breachesThreshold,
            },
          });

          if (breachesThreshold) {
            const alertType = breachesHigh ? `high_${input.input_name}` : `low_${input.input_name}`;
            const threshold = breachesHigh ? highThreshold : lowThreshold;

            const alert = await prisma.alert.create({
              data: {
                deviceId: device.id,
                timestampUtc: new Date(validMsg.timestamp),
                alertType: alertType,
                severity: "warning",
                threshold: threshold ?? null,
                readingValue: input.input_value,
                readingName: input.input_name,
              },
            });

            await prisma.alertTriage.create({
              data: {
                alertId: alert.id,
                status: "new",
              },
            });

            await prisma.alertTimelineEntry.create({
              data: {
                alertId: alert.id,
                action: "created",
                user: "system",
                details: "Alert created from threshold-breaching sensor reading",
              },
            });
          }
        }
      } else if (validMsg.message_type === "alert") {
        // Detect and handle duplicate messages
        const duplicate = await prisma.alert.findFirst({
          where: {
            deviceId: validMsg.device_id,
            timestampUtc: new Date(validMsg.timestamp),
            alertType: validMsg.alert_type,
          },
        });
        if (duplicate) {
          console.warn(`Duplicate alert skipped for ${validMsg.device_id}`);
          continue;
        }

        const alert = await prisma.alert.create({
          data: {
            deviceId: validMsg.device_id,
            timestampUtc: new Date(validMsg.timestamp),
            alertType: validMsg.alert_type,
            severity: validMsg.severity,
            threshold: validMsg.threshold ?? null,
            readingValue: validMsg.reading_value ?? null,
            readingName: validMsg.reading_name || null,
          },
        });

        await prisma.alertTriage.create({
          data: {
            alertId: alert.id,
            status: "new",
          },
        });

        await prisma.alertTimelineEntry.create({
          data: {
            alertId: alert.id,
            action: "created",
            user: "system",
            details: "Alert ingested from device message",
          },
        });

      } else if (validMsg.message_type === "recovery") {
        // Detect and handle duplicate messages
        const duplicate = await prisma.recovery.findFirst({
          where: {
            deviceId: validMsg.device_id,
            timestampUtc: new Date(validMsg.timestamp),
            alertType: validMsg.alert_type,
          },
        });
        if (duplicate) {
          console.warn(`Duplicate alert skipped for ${validMsg.device_id}`);
          continue;
        }

        await prisma.recovery.create({
          data: {
            deviceId: validMsg.device_id,
            timestampUtc: new Date(validMsg.timestamp),
            alertType: validMsg.alert_type,
            severity: validMsg.severity,
            threshold: validMsg.threshold ?? null,
            readingValue: validMsg.reading_value ?? null,
            readingName: validMsg.reading_name || null,
          },
        });
      }
    }
    console.log("Ingestion complete.");
  } catch (error) {
    console.error("Error during ingestion:", error);
  } finally {
    await prisma.$disconnect();
  }
}


ingestSensors();
