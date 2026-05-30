import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { ReportModal } from '../components/ReportModal';
import { SeverityBadge } from '../components/SeverityBadge';
import { createReport, getHistory } from '../services/api';

export function ReportsPage() {
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const sample = {
    crop: 'Tomato',
    disease: 'Early Blight',
    severity: 'Medium',
    confidence: 92,
    treatment: ['Mancozeb 75% WP at 2g per liter of water'],
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-wide text-leaf-600">Crop Health Report Generator</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Create downloadable diagnosis reports</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <h2 className="mb-4 text-xl font-black dark:text-white">Report details</h2>
          {['Farmer name', 'Crop name', 'Village', 'Treatment notes'].map((label) => (
            <label key={label} className="mb-4 block">
              <span className="mb-2 block text-sm font-bold">{label}</span>
              <input className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" placeholder={label} />
            </label>
          ))}
          <Button className="w-full" onClick={async () => setReport(await createReport(sample))}><FileText size={18} /> Preview report</Button>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black dark:text-white">Generated report preview</h2>
            <SeverityBadge severity={sample.severity} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Preview label="Farmer details" value="Prathamesh Chougale · Pune" />
            <Preview label="Crop name" value={sample.crop} />
            <Preview label="Disease detected" value={sample.disease} />
            <Preview label="Weather conditions" value="29 C, humid, rain likely" />
          </div>
          <div className="mt-5"><ProgressBar label="AI confidence score" value={sample.confidence} /></div>
          <p className="mt-5 rounded-lg bg-leaf-50 p-4 font-semibold text-leaf-900 dark:bg-leaf-950 dark:text-leaf-100">Suggested treatment: {sample.treatment[0]}</p>
          <Button className="mt-5" onClick={() => setReport(sample)}><Download size={18} /> Download Report</Button>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="mb-4 text-xl font-black dark:text-white">Recent reports</h2>
        <div className="grid gap-3">
          {history.map((item) => (
            <button key={item.id} onClick={() => setReport({ ...sample, crop: item.crop, disease: item.disease, severity: item.severity, confidence: item.confidence })} className="flex items-center justify-between rounded-lg bg-slate-50 p-4 text-left dark:bg-slate-800">
              <span className="font-bold">{item.crop} · {item.disease}</span>
              <Download className="text-leaf-600" />
            </button>
          ))}
        </div>
      </Card>
      <ReportModal report={report} onClose={() => setReport(null)} />
    </section>
  );
}

function Preview({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold dark:text-white">{value}</p>
    </div>
  );
}
