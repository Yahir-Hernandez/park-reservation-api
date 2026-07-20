export interface Park {
  id: number;
  name: string;
  location: string;
  services: string[];
  schedule: string;
  latitude: number;
  longitude: number;
  start_season: string;
  end_season: string;
  close_days: string[];
  has_cabinets: boolean;
  capacity_cabinets?: number;
  capacity_camping: number;
  created_at: string;
}




