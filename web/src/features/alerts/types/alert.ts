import { Device } from "../../devices/types/device";

export type AlertStatus = "new" | "acknowledged" | "resolved" | "dismissed";
export type AlertSeverity = "critical" | "warning";

export interface AlertTriage {
  id: number;
  alertId: number;
  status: AlertStatus;
  assignedTo: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface Alert {
  id: number;
  deviceId: string;
  timestampUtc: string;
  alertType: string;
  severity: AlertSeverity;
  threshold: number | null;
  readingValue: number | null;
  readingName: string | null;
  device: Device;
  triage: AlertTriage | null;
  timeline?: AlertTimelineEntry[];
}

export interface GetAlertsParams {
  severity?: string;
  status?: string;
  device_id?: string;
  assigned_to?: string;
  q?: string;
  from?: string;
  to?: string;
}

export interface AlertTimelineEntry {
  id: number;
  alertId: number;
  timestamp: string;
  action: string;
  user: string;
  details: string | null;
  note: string | null;
}