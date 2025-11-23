// Based on the ERD Specification

export enum UserRole {
  ADMIN = 'Admin',
  FARMER = 'Farmer',
  VIEWER = 'Viewer'
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Farm {
  farm_id: number;
  owner_id: number;
  name: string;
  location_lat: number;
  location_long: number;
  total_area: number; // hectares
}

export interface Field {
  field_id: number;
  farm_id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  soil_type: string;
}

export enum DeviceStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance'
}

export interface Device {
  device_id: number;
  field_id: number;
  device_name: string;
  status: DeviceStatus;
  battery_level: number;
  last_ping: string;
}

export enum SensorType {
  SOIL_MOISTURE = 'Soil Moisture',
  PH = 'pH',
  NPK = 'NPK',
  AIR_TEMP = 'Air Temp',
  WATER_LEVEL = 'Water Level',
  HUMIDITY = 'Humidity'
}

export interface Sensor {
  sensor_id: number;
  device_id: number;
  sensor_type: SensorType;
  unit: string;
  threshold_min: number;
  threshold_max: number;
}

export interface Reading {
  reading_id: string; // BigInt/UUID treated as string for frontend
  sensor_id: number;
  value: number;
  timestamp: string;
}

export enum AlertSeverity {
  INFO = 'Info',
  WARNING = 'Warning',
  CRITICAL = 'Critical'
}

export interface Alert {
  alert_id: number;
  sensor_id: number;
  message: string;
  severity: AlertSeverity;
  is_resolved: boolean;
  created_at: string;
  // Hydrated fields for UI convenience
  farm_name?: string;
  field_name?: string;
  sensor_type?: string;
}

export enum IrrigationStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed'
}

export interface IrrigationEvent {
  event_id: number;
  field_id: number;
  start_time: string;
  end_time?: string;
  volume_liters?: number;
  status: IrrigationStatus;
  // Hydrated for UI
  field_name?: string;
  farm_name?: string;
}

// --- New Types for Dashboard UI ---

export interface Task {
  id: number;
  name: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface HarvestItem {
  id: number;
  name: string;
  amount: number; // tons
  unit: string;
  color: string; // hex or tailwind class helper
}