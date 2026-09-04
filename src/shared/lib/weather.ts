/**
 * Open-Meteo: free, no key, no attribution requirement, CORS-open.
 * https://open-meteo.com — the SW caches responses for an hour.
 */
export interface Weather {
  tempC: number;
  feelsC: number;
  code: number;
  isDay: boolean;
  maxC: number;
  minC: number;
}

export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<Weather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(3));
  url.searchParams.set('longitude', lon.toFixed(3));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,is_day,weather_code');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const j = await res.json() as {
    current: { temperature_2m: number; apparent_temperature: number; is_day: number; weather_code: number };
    daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
  };
  return {
    tempC: Math.round(j.current.temperature_2m),
    feelsC: Math.round(j.current.apparent_temperature),
    code: j.current.weather_code,
    isDay: j.current.is_day === 1,
    maxC: Math.round(j.daily.temperature_2m_max[0]),
    minC: Math.round(j.daily.temperature_2m_min[0]),
  };
}

/** WMO weather code → an icon from our registry. */
export function weatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'sun' : 'moon';
  if (code <= 3) return 'contrast';                       // mainly clear → overcast
  if (code === 45 || code === 48) return 'wifi';          // fog
  if (code >= 51 && code <= 67) return 'droplet';         // drizzle / rain
  if (code >= 71 && code <= 77) return 'droplet';         // snow
  if (code >= 80 && code <= 82) return 'droplet';         // showers
  if (code >= 95) return 'bolt';                          // thunderstorm
  return 'contrast';
}

export function weatherLabel(code: number, lang: 'uk' | 'en'): string {
  const uk: Record<string, string> = {
    clear: 'Ясно', cloudy: 'Хмарно', fog: 'Туман', rain: 'Дощ',
    snow: 'Сніг', shower: 'Злива', storm: 'Гроза',
  };
  const en: Record<string, string> = {
    clear: 'Clear', cloudy: 'Cloudy', fog: 'Fog', rain: 'Rain',
    snow: 'Snow', shower: 'Showers', storm: 'Thunderstorm',
  };
  const d = lang === 'en' ? en : uk;
  if (code === 0) return d.clear;
  if (code <= 3) return d.cloudy;
  if (code === 45 || code === 48) return d.fog;
  if (code >= 51 && code <= 67) return d.rain;
  if (code >= 71 && code <= 77) return d.snow;
  if (code >= 80 && code <= 82) return d.shower;
  if (code >= 95) return d.storm;
  return d.cloudy;
}
