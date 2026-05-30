import { CloudRain, Droplets, ThermometerSun, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SeverityBadge } from '../components/SeverityBadge';
import { getWeatherRisk } from '../services/api';

export function WeatherPage() {
  const [data, setData] = useState(null);
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [loading, setLoading] = useState(true);

  const loadWeather = async (query) => {
    setLoading(true);
    const next = await getWeatherRisk(query);
    setData(next);
    setLoading(false);
  };

  useEffect(() => { loadWeather(location); }, []);

  if (loading && !data) return <section className="mx-auto max-w-7xl px-4 py-10"><div className="skeleton h-96 rounded-lg" /></section>;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-leaf-600">Weather & Risk Alerts</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{data.location}</h1>
      </div>
      <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="mb-2 block text-sm font-bold">Location</span>
          <input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Enter city or village" />
        </label>
        <Button onClick={() => loadWeather(location)}>Refresh weather</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Weather icon={ThermometerSun} label="Temperature" value={`${data.temp} C`} />
        <Weather icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
        <Weather icon={CloudRain} label="Rain prediction" value={`${data.rain}%`} />
        <Weather icon={Wind} label="Wind speed" value={`${data.wind} km/h`} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {data.risks.map((risk) => (
          <Card key={risk.disease}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black dark:text-white">{risk.disease}</h2>
              <SeverityBadge severity={risk.level} />
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">{risk.action}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="text-xl font-black dark:text-white">Alert notifications</h2>
        <p className="mt-3 rounded-lg bg-red-50 p-4 font-semibold text-red-800 dark:bg-red-950 dark:text-red-100">High evening humidity may increase fungal spread. Inspect tomato and grape leaves before the next irrigation cycle.</p>
      </Card>
    </section>
  );
}

function Weather({ icon: Icon, label, value }) {
  return (
    <Card className="overflow-hidden">
      <Icon className="mb-4 text-leaf-600" size={32} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-black dark:text-white">{value}</p>
    </Card>
  );
}
