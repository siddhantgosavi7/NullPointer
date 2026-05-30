import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  openWeatherMapApiKey: process.env.OPENWEATHERMAP_API_KEY || '',
  openWeatherMapBaseUrl: process.env.OPENWEATHERMAP_BASE_URL || 'https://api.openweathermap.org/data/2.5/weather',
};
