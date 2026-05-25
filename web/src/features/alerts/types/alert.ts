export type AlertStatus = "new" | "acknowledged" | "resolved" | "dismissed";
export type AlertSeverity = "critical" | "warning";

export interface Device {
  id: string;
  name: string;
  location: string;
  company: string;
  timezone: string;
}

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