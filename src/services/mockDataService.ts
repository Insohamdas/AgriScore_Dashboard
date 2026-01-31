import { 
  User, Farm, Field, Device, Sensor, Reading, Alert, IrrigationEvent, 
  UserRole, DeviceStatus, SensorType, AlertSeverity, IrrigationStatus,
  Task, HarvestItem
} from '../types';

// --- Data Generators ---

const generateReadings = (sensorId: number, type: SensorType, hours: number = 24): Reading[] => {
  const readings: Reading[] = [];
  const now = new Date();
  
  let baseValue = 0;
  let volatility = 0;

  switch(type) {
    case SensorType.SOIL_MOISTURE: baseValue = 45; volatility = 5; break; // %
    case SensorType.AIR_TEMP: baseValue = 24; volatility = 8; break; // Celsius
    case SensorType.PH: baseValue = 6.5; volatility = 0.5; break;
    case SensorType.HUMIDITY: baseValue = 60; volatility = 10; break;
    default: baseValue = 50; volatility = 10;
  }

  for (let i = 0; i < hours * 4; i++) { // every 15 mins
    const time = new Date(now.getTime() - (i * 15 * 60 * 1000));
    // Add some sine wave variance for temp/humidity to simulate day/night
    const timeFactor = Math.sin(time.getHours() / 24 * Math.PI * 2);
    
    const val = baseValue + (timeFactor * (volatility / 2)) + (Math.random() * volatility - volatility/2);
    
    readings.push({
      reading_id: `r-${sensorId}-${i}`,
      sensor_id: sensorId,
      value: Number(val.toFixed(2)),
      timestamp: time.toISOString()
    });
  }
  return readings.reverse();
};

// --- Mock Database State ---

export const MOCK_USER: User = {
  user_id: 1,
  username: 'Manish Kumar',
  email: 'kmanish45@gmail.com',
  role: UserRole.FARMER,
  created_at: '2023-01-15T08:00:00Z'
};

export const MOCK_FARMS: Farm[] = [
  { farm_id: 101, owner_id: 1, name: 'Green Valley Estates', location_lat: 22.68, location_long: 88.38, total_area: 150 },
  { farm_id: 102, owner_id: 1, name: 'Sunny Hills Orchard', location_lat: 22.70, location_long: 88.40, total_area: 85 },
];

export const MOCK_FIELDS: Field[] = [
  { field_id: 201, farm_id: 101, name: 'North Zone Wheat', crop_type: 'Wheat', planting_date: '2025-11-01', soil_type: 'Loamy' },
  { field_id: 202, farm_id: 101, name: 'River Side Rice', crop_type: 'Rice', planting_date: '2025-06-15', soil_type: 'Clay' },
  { field_id: 203, farm_id: 102, name: 'Hilltop Corn', crop_type: 'Corn', planting_date: '2025-03-10', soil_type: 'Sandy Loam' },
];

export const MOCK_DEVICES: Device[] = [
  { device_id: 301, field_id: 201, device_name: 'Node-WZ-01', status: DeviceStatus.ONLINE, battery_level: 88, last_ping: new Date().toISOString() },
  { device_id: 302, field_id: 201, device_name: 'Node-WZ-02', status: DeviceStatus.MAINTENANCE, battery_level: 12, last_ping: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
  { device_id: 303, field_id: 202, device_name: 'Node-RS-01', status: DeviceStatus.ONLINE, battery_level: 95, last_ping: new Date().toISOString() },
  { device_id: 304, field_id: 203, device_name: 'Node-HT-01', status: DeviceStatus.OFFLINE, battery_level: 0, last_ping: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
];

export const MOCK_SENSORS: Sensor[] = [
  { sensor_id: 401, device_id: 301, sensor_type: SensorType.SOIL_MOISTURE, unit: '%', threshold_min: 30, threshold_max: 80 },
  { sensor_id: 402, device_id: 301, sensor_type: SensorType.AIR_TEMP, unit: '°C', threshold_min: 10, threshold_max: 35 },
  { sensor_id: 403, device_id: 303, sensor_type: SensorType.WATER_LEVEL, unit: 'cm', threshold_min: 5, threshold_max: 50 },
  { sensor_id: 404, device_id: 303, sensor_type: SensorType.PH, unit: 'pH', threshold_min: 5.5, threshold_max: 7.5 },
];

// Generate readings for all sensors
const ALL_READINGS: Record<number, Reading[]> = {};
MOCK_SENSORS.forEach(s => {
  ALL_READINGS[s.sensor_id] = generateReadings(s.sensor_id, s.sensor_type);
});

export const MOCK_ALERTS: Alert[] = [
  { 
    alert_id: 501, sensor_id: 401, message: 'Critical: Soil Moisture Low', severity: AlertSeverity.CRITICAL, is_resolved: false, created_at: new Date(Date.now() - 3600000).toISOString(),
    farm_name: 'Green Valley Estates', field_name: 'North Zone Wheat', sensor_type: 'Soil Moisture'
  },
  { 
    alert_id: 502, sensor_id: 402, message: 'Warning: High Temperature', severity: AlertSeverity.WARNING, is_resolved: true, created_at: new Date(Date.now() - 7200000).toISOString(),
    farm_name: 'Green Valley Estates', field_name: 'North Zone Wheat', sensor_type: 'Air Temp'
  },
  { 
    alert_id: 503, sensor_id: 304, message: 'Device Offline: Node-HT-01', severity: AlertSeverity.INFO, is_resolved: false, created_at: new Date(Date.now() - 86400000).toISOString(), // Linked to device really, but using schema logic
    farm_name: 'Sunny Hills Orchard', field_name: 'Hilltop Corn', sensor_type: 'System'
  }
];

export const MOCK_IRRIGATION: IrrigationEvent[] = [
  { event_id: 601, field_id: 201, start_time: new Date(Date.now() - 12 * 3600000).toISOString(), end_time: new Date(Date.now() - 11 * 3600000).toISOString(), volume_liters: 5000, status: IrrigationStatus.COMPLETED, field_name: 'North Zone Wheat', farm_name: 'Green Valley Estates' },
  { event_id: 602, field_id: 202, start_time: new Date(Date.now() + 2 * 3600000).toISOString(), status: IrrigationStatus.SCHEDULED, field_name: 'River Side Rice', farm_name: 'Green Valley Estates' },
];

export const MOCK_TASKS: Task[] = [
  { id: 1, name: 'Apply Fertilizer to potato farm', date: '02-Feb-26', status: 'Pending' },
];

export const MOCK_HARVEST: HarvestItem[] = [
  { id: 1, name: 'Tomatoes', amount: 150, unit: 'tons', color: 'bg-red-100 text-red-600' },
  { id: 2, name: 'Carrots', amount: 120, unit: 'tons', color: 'bg-orange-100 text-orange-600' },
  { id: 3, name: 'Corn', amount: 200, unit: 'tons', color: 'bg-yellow-100 text-yellow-600' },
];

// --- API Facade ---

export const api = {
  getFarms: () => Promise.resolve(MOCK_FARMS),
  getFarmById: (id: number) => Promise.resolve(MOCK_FARMS.find(f => f.farm_id === id)),
  getFieldsByFarm: (farmId: number) => Promise.resolve(MOCK_FIELDS.filter(f => f.farm_id === farmId)),
  getDevicesByField: (fieldId: number) => Promise.resolve(MOCK_DEVICES.filter(d => d.field_id === fieldId)),
  getSensorsByDevice: (deviceId: number) => Promise.resolve(MOCK_SENSORS.filter(s => s.device_id === deviceId)),
  getReadings: (sensorId: number) => Promise.resolve(ALL_READINGS[sensorId] || []),
  getAlerts: () => Promise.resolve(MOCK_ALERTS),
  getIrrigationEvents: () => Promise.resolve(MOCK_IRRIGATION),
  getUser: () => Promise.resolve(MOCK_USER),
  getTasks: () => Promise.resolve(MOCK_TASKS),
  getHarvestSummary: () => Promise.resolve(MOCK_HARVEST),
};