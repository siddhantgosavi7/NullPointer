import { Bell, Bot, CalendarDays, FileText, MapPin, ScanLine, ShieldCheck, Sprout } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card, StatCard } from '../components/Card';
import { DiseaseBarChart, FrequencyPieChart, HealthTrendChart } from '../components/Charts';
import { getHistory } from '../services/api';

export function DashboardPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const stats = useMemo(() => {
    const total = history.length || 0;
    const averageConfidence = total ? Math.round(history.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / total) : 0;
    const alerts = history.filter((item) => String(item.severity || '').toLowerCase() === 'high').length;

    return {
      total,
      averageConfidence,
      alerts,
      reminders: Math.max(3, Math.min(8, total + 2)),
    };
  }, [history]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-600">Farmer Dashboard</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Today’s crop health workspace</h1>
        </div>
        <Button as={Link} to="/detect"><ScanLine size={18} /> New Scan</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ScanLine} label="Total scans performed" value={String(stats.total)} />
        <StatCard icon={ShieldCheck} label="Crop health score" value={`${Math.max(40, 100 - stats.alerts * 8)}%`} />
        <StatCard icon={Bell} label="Weather risk alerts" value={String(stats.alerts || 0)} />
        <StatCard icon={CalendarDays} label="Farming reminders" value={String(stats.reminders)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 text-xl font-black dark:text-white">Crop health trends</h2><HealthTrendChart /></Card>
        <Card><h2 className="mb-4 text-xl font-black dark:text-white">Disease frequency chart</h2><DiseaseBarChart /></Card>
        <Card><h2 className="mb-4 text-xl font-black dark:text-white">Monthly analysis graph</h2><FrequencyPieChart /></Card>
        <Card>
          <h2 className="mb-4 text-xl font-black dark:text-white">Recommended actions</h2>
          <div className="grid gap-3">
            {[
              'Inspect the most recent affected leaves for spread',
              'Review the latest weather alert before irrigation',
              'Share the newest report with your local expert',
            ].map((item) => (
              <p key={item} className="rounded-lg bg-leaf-50 p-4 font-semibold text-leaf-900 dark:bg-leaf-950 dark:text-leaf-100">{item}</p>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick to="/detect" icon={ScanLine} label="New Scan" />
        <Quick to="/chatbot" icon={Bot} label="Open Chatbot" />
        <Quick to="/schemes" icon={MapPin} label="View Nearby Experts" />
        <Quick to="/reports" icon={FileText} label="Generate Report" />
      </div>
      <Card className="mt-6">
        <h2 className="mb-4 text-xl font-black dark:text-white">Disease history</h2>
        <div className="grid gap-3">
          {history.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <img src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=700&q=80'} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="font-bold">{item.crop} · {item.disease}</p><p className="text-sm text-slate-500">{item.date}</p></div>
              <Sprout className="text-leaf-600" />
            </div>
          ))}
          {!history.length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">No detections yet. Start with a new leaf scan to populate this section.</p>}
        </div>
      </Card>
    </section>
  );
}

function Quick({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex min-h-24 items-center gap-3 rounded-lg bg-white p-5 font-black shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-1 dark:bg-slate-900 dark:ring-white/10">
      <Icon className="text-leaf-600" /> {label}
    </Link>
  );
}
