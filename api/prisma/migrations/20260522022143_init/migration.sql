-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "installedDate" DATETIME NOT NULL,
    "floorCount" INTEGER,
    "readingTypes" JSONB NOT NULL,
    "alertThresholds" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" DATETIME NOT NULL,
    "inputName" TEXT NOT NULL,
    "inputValue" REAL NOT NULL,
    "breachesThreshold" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "sensor_readings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" BIGINT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "threshold" REAL,
    "readingValue" REAL,
    "readingName" TEXT,
    CONSTRAINT "alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_triage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alertId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "resolutionType" TEXT,
    "resolutionRootCause" TEXT,
    "resolutionActionTaken" TEXT,
    "resolutionPreventiveMeasures" TEXT,
    "resolutionTimeSpentMinutes" INTEGER,
    CONSTRAINT "alert_triage_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alert_triage_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_timeline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alertId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "details" TEXT,
    "note" TEXT,
    CONSTRAINT "alert_timeline_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "bearerToken" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "sensor_readings_deviceId_timestampUtc_idx" ON "sensor_readings"("deviceId", "timestampUtc");

-- CreateIndex
CREATE UNIQUE INDEX "alert_triage_alertId_key" ON "alert_triage"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "users_bearerToken_key" ON "users"("bearerToken");
