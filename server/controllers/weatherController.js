import { buildWeatherRisk } from '../services/weather.js';

export async function weatherRisk(req, res, next) {
  try {
    res.json(await buildWeatherRisk(req.query));
  } catch (error) {
    next(error);
  }
}
