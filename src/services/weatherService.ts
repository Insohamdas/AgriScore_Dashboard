import { log } from '../lib/logger';

export interface WeatherIconInfo {
  desc: string;
  icon: React.ComponentType<{ className?: string; fill?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  desc: string;
  icon: React.ComponentType<{ className?: string; fill?: string; style?: React.CSSProperties }>;
  humidity: number;
  wind: number;
  windDir: number;
  precip: number;
  pressure: number;
  visibility: string;
  uv: number;
  dewPoint: number;
}

export interface DailyForecast {
  day: string;
  fullDate: string;
  max: number;
  min: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  rainSum: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  icon: React.ComponentType<{ className?: string }>;
  pop: number;
}

export interface AstroInfo {
  sunrise: string;
  sunset: string;
}

export interface TempTrendPoint {
  name: string;
  temp: number;
}

interface OpenMeteoResponse {
  current: any;
  hourly: any;
  daily: any;
}

// NOTE: The Weather page already defines the icon mapping using lucide icons.
// To avoid a circular dependency on React icons from this service, the page
// passes the concrete icon components back in via mapper functions.

export const fetchWeather = async (
  lat: number,
  lon: number,
  getWeatherInfo: (code: number) => WeatherIconInfo
): Promise<{
  currentWeather: CurrentWeather;
  forecast: DailyForecast[];
  hourlyForecast: HourlyForecast[];
  astro: AstroInfo;
  tempTrend: TempTrendPoint[];
}> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability,uv_index,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenMeteoResponse = await response.json();

    const info = getWeatherInfo(data.current.weather_code);
    const nowHour = new Date().getHours();

    const currentWeather: CurrentWeather = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      desc: info.desc,
      icon: info.icon,
      humidity: data.current.relative_humidity_2m,
      wind: Math.round(data.current.wind_speed_10m),
      windDir: data.current.wind_direction_10m,
      precip: data.current.precipitation,
      pressure: data.current.surface_pressure,
      visibility: (data.current.visibility / 1000).toFixed(1),
      uv: data.hourly.uv_index[nowHour],
      dewPoint: Math.round(data.hourly.dew_point_2m[nowHour]),
    };

    const forecast: DailyForecast[] = data.daily.time.slice(0, 5).map((time: string, index: number) => {
      const dInfo = getWeatherInfo(data.daily.weather_code[index]);
      return {
        day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        max: Math.round(data.daily.temperature_2m_max[index]),
        min: Math.round(data.daily.temperature_2m_min[index]),
        icon: dInfo.icon,
        color: dInfo.color,
        rainSum: data.daily.precipitation_sum[index],
      };
    });

    const next24Hours: HourlyForecast[] = data.hourly.time
      .slice(nowHour, nowHour + 24)
      .map((t: string, i: number) => {
        const idx = nowHour + i;
        const hInfo = getWeatherInfo(data.hourly.weather_code[idx]);
        return {
          time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(data.hourly.temperature_2m[idx]),
          icon: hInfo.icon,
          pop: data.hourly.precipitation_probability[idx],
        };
      });

    const tempTrend: TempTrendPoint[] = next24Hours.map((h) => ({ name: h.time, temp: h.temp }));

    const astro: AstroInfo = {
      sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    return { currentWeather, forecast, hourlyForecast: next24Hours, astro, tempTrend };
  } catch (error) {
    log.error('Weather fetch failed', error);
    throw error instanceof Error ? error : new Error('Unknown weather error');
  }
};
