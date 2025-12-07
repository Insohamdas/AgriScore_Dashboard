import axios from 'axios';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  location: string;
  lastUpdated: string;
}

interface ForecastData {
  date: string;
  high: number;
  low: number;
  condition: string;
  rainfall: number;
}

/**
 * Fetch real weather data from Open-Meteo API (free, no API key needed)
 * Open-Meteo provides weather data for any location worldwide
 */
export const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility',
        timezone: 'auto'
      }
    });

    const current = response.data.current;
    const getWeatherCondition = (code: number, isDay: boolean): string => {
      const conditions: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        51: 'Light drizzle',
        61: 'Slight rain',
        71: 'Slight snow',
        80: 'Moderate rain showers',
        95: 'Thunderstorm'
      };
      return conditions[code] || 'Unknown';
    };

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      precipitation: current.precipitation || 0,
      condition: getWeatherCondition(current.weather_code, current.is_day === 1),
      location: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Fetch weather forecast data
 */
export const fetchWeatherForecast = async (latitude: number, longitude: number, days = 7): Promise<ForecastData[]> => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'auto',
        forecast_days: days
      }
    });

    const daily = response.data.daily;
    return daily.time.map((date: string, index: number) => ({
      date,
      high: daily.temperature_2m_max[index],
      low: daily.temperature_2m_min[index],
      condition: 'Moderate',
      rainfall: daily.precipitation_sum[index] || 0
    }));
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

/**
 * Fetch agricultural alerts based on weather conditions
 * Provides crop-specific recommendations
 */
export const fetchAgriculturalAlerts = async (latitude: number, longitude: number, cropType: string) => {
  try {
    const weather = await fetchWeatherData(latitude, longitude);

    const alerts: string[] = [];

    // Temperature alerts
    if (weather.temperature > 35) {
      alerts.push(`⚠️ High temperature alert: ${weather.temperature}°C may affect ${cropType} yield. Increase irrigation.`);
    }
    if (weather.temperature < 10) {
      alerts.push(`❄️ Low temperature alert: ${weather.temperature}°C. Frost risk for ${cropType}.`);
    }

    // Humidity alerts
    if (weather.humidity > 80) {
      alerts.push(`💧 High humidity (${weather.humidity}%) may increase fungal diseases. Improve ventilation.`);
    }

    // Rain alerts
    if (weather.precipitation > 50) {
      alerts.push(`🌧️ Heavy rainfall (${weather.precipitation}mm) detected. Check for waterlogging.`);
    }

    // Wind alerts
    if (weather.windSpeed > 40) {
      alerts.push(`💨 Strong winds (${weather.windSpeed} km/h). Risk of crop damage. Secure structures.`);
    }

    return {
      weatherData: weather,
      alerts,
      recommendations: generateRecommendations(weather, cropType)
    };
  } catch (error) {
    console.error('Error fetching agricultural alerts:', error);
    throw error;
  }
};

/**
 * Generate crop-specific recommendations based on weather
 */
const generateRecommendations = (weather: WeatherData, cropType: string): string[] => {
  const recommendations: string[] = [];

  if (weather.humidity < 40 && weather.temperature > 25) {
    recommendations.push(`Apply protective mulch for ${cropType} to retain soil moisture.`);
  }

  if (weather.windSpeed > 20) {
    recommendations.push('Consider implementing windbreaks to protect crops.');
  }

  if (weather.temperature > 30 && weather.humidity > 70) {
    recommendations.push(`Monitor ${cropType} for pest infestations in warm, humid conditions.`);
  }

  if (weather.precipitation > 25) {
    recommendations.push('Check soil drainage systems. Apply fungicide if needed.');
  }

  recommendations.push(`Best time to apply fertilizers: After ${weather.precipitation > 10 ? 'rain' : 'irrigation'} for better absorption.`);

  return recommendations;
};

/**
 * Cache weather data to reduce API calls
 */
const weatherCache: Record<string, { data: WeatherData; timestamp: number }> = {};

export const fetchWeatherDataCached = async (latitude: number, longitude: number, cacheMinutes = 30): Promise<WeatherData> => {
  const cacheKey = `${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
  const now = Date.now();
  const cached = weatherCache[cacheKey];

  if (cached && now - cached.timestamp < cacheMinutes * 60 * 1000) {
    return cached.data;
  }

  const data = await fetchWeatherData(latitude, longitude);
  weatherCache[cacheKey] = { data, timestamp: now };
  return data;
};
