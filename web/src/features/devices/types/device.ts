export interface Device {
    id: string;
    name: string;
    type: string;
    company: string;
    timezone: string;
    location: string;
    installedDate: string;
    floorCount?: number | null;
  }