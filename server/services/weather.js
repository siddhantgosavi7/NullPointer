import { env } from '../config/env.js';

function createRiskProfile({ location = 'Pune, Maharashtra', crop = 'Tomato', temp = 29, humidity = 82, rain = 68, wind = 11 }) {
  const riskScore = Math.min(100, Math.round(humidity * 0.45 + rain * 0.35 + Math.max(0, temp - 24) * 3));

  return {
    location,
    crop,
    temp,
    humidity,
    rain,
    wind,
    riskScore,
    risks: [
      { disease: 'Fungal Blight', level: riskScore > 70 ? 'High' : 'Medium', action: 'Spray preventive fungicide before evening humidity rises.' },
      { disease: 'Powdery Mildew', level: 'Medium', action: 'Improve airflow and inspect shaded rows.' },
      { disease: 'Bacterial Spot', level: 'Low', action: 'Avoid splash irrigation for 48 hours.' },
    ],
  };
}

export async function buildWeatherRisk({ location = 'Pune, Maharashtra', crop = 'Tomato' } = {}) {
  if (!env.openWeatherMapApiKey) {
    return createRiskProfile({ location, crop });
  }

  const endpoint = new URL(env.openWeatherMapBaseUrl);
  endpoint.searchParams.set('q', location);
  endpoint.searchParams.set('appid', env.openWeatherMapApiKey);
  endpoint.searchParams.set('units', 'metric');

  const response = await fetch(endpoint);
  if (!response.ok) {
    return createRiskProfile({ location, crop });
  }

  const data = await response.json();
  const temp = Math.round(data?.main?.temp ?? 29);
  const humidity = Math.round(data?.main?.humidity ?? 82);
  const rain = Math.round(data?.rain?.['1h'] ? Math.min(100, data.rain['1h'] * 20) : data?.clouds?.all ?? 35);
  const wind = Math.round(data?.wind?.speed ?? 11);
  const resolvedLocation = [data?.name, data?.sys?.country].filter(Boolean).join(', ') || location;

  return createRiskProfile({ location: resolvedLocation, crop, temp, humidity, rain, wind });
}
