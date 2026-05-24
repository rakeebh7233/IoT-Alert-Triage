/*
  Warnings:

  - You are about to alter the column `timestampUtc` on the `alerts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `DateTime`.
  - You are about to drop the column `isDuplicate` on the `sensor_readings` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "recoveries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" DATETIME NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "threshold" REAL,
    "readingValue" REAL,
    "readingName" TEXT,
    CONSTRAINT "recoveries_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_alerts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" DATETIME NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "threshold" REAL,
    "readingValue" REAL,
    "readingName" TEXT,
    CONSTRAINT "alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_alerts" ("alertType", "deviceId", "id", "readingName", "readingValue", "severity", "threshold", "timestampUtc") SELECT "alertType", "deviceId", "id", "readingName", "readingValue", "severity", "threshold", "timestampUtc" FROM "alerts";
DROP TABLE "alerts";
ALTER TABLE "new_alerts" RENAME TO "alerts";
CREATE TABLE "new_sensor_readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" DATETIME NOT NULL,
    "inputName" TEXT NOT NULL,
    "inputValue" REAL NOT NULL,
    "breachesThreshold" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "sensor_readings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sensor_readings" ("breachesThreshold", "deviceId", "id", "inputName", "inputValue", "timestampUtc") SELECT "breachesThreshold", "deviceId", "id", "inputName", "inputValue", "timestampUtc" FROM "sensor_readings";
DROP TABLE "sensor_readings";
ALTER TABLE "new_sensor_readings" RENAME TO "sensor_readings";
CREATE INDEX "sensor_readings_deviceId_timestampUtc_idx" ON "sensor_readings"("deviceId", "timestampUtc");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "recoveries_deviceId_timestampUtc_idx" ON "recoveries"("deviceId", "timestampUtc");

-- CreateIndex
CREATE INDEX "recoveries_deviceId_alertType_idx" ON "recoveries"("deviceId", "alertType");
