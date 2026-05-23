import fs from "fs/promises";
import path from "path";

import { prisma } from "../lib/prisma.js";

async function main() {

  const filePath = path.join(process.cwd(),"..", "data", "devices.json");

  const raw = await fs.readFile(filePath, "utf-8");

  const devices = JSON.parse(raw);

  for (const device of devices) {

    await prisma.device.create({
      data: {
        id: device.device_id,

        type: device.type,

        company: device.company,

        name: device.name,

        location: device.location,

        timezone: device.timezone,

        installedDate: new Date(device.installed_date),

        floorCount: device.floor_count,

        readingTypes: device.reading_types,

        alertThresholds: device.alert_thresholds
      }
    });

    console.log(`Inserted ${device.device_id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {

    console.error(error);

    await prisma.$disconnect();

    process.exit(1);
  });

