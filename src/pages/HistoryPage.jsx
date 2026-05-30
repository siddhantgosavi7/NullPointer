import { Download, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SeverityBadge } from '../components/SeverityBadge';
import { apiAssetUrl, getHistory } from '../services/api';

export function HistoryPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  useEffect(() => { getHistory().then(setHistory); }, []);
  const items = useMemo(() => history.filter((item) => `${item.crop} ${item.disease}`.toLowerCase().includes(query.toLowerCase())), [history, query]);

  const handleExport = () => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('KrishiRakshak AI History Export', 14, 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    const lines = items.flatMap((item, index) => [
      `${index + 1}. ${item.crop} - ${item.disease}`,
      `Severity: ${item.severity} | Confidence: ${item.confidence}% | Date: ${item.date}`,
      `Location: ${item.location || 'N/A'}`,
      '',
    ]);

    pdf.text(lines.length ? lines : ['No records available for export.'], 14, 32);
    pdf.save('krishirakshak-history.pdf');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-600">Crop Health History</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Timeline of previous diagnoses</h1>
        </div>
        <Button onClick={handleExport}><Download size={18} /> Export PDF</Button>
      </div>
      <label className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
        <Search className="text-leaf-600" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search crop, disease, or date..." />
      </label>
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
              <img src={apiAssetUrl(item.imageUrl || item.image)} alt={`${item.crop} diagnosis`} className="h-36 w-full rounded-lg object-cover md:h-24" />
              <div>
                <p className="text-sm text-slate-500">{item.date}</p>
                <h2 className="text-2xl font-black dark:text-white">{item.crop} · {item.disease}</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Recurrence analysis: monitor this crop family over the next 14 days.</p>
              </div>
              <SeverityBadge severity={item.severity} />
            </div>
          </Card>
        ))}
        {!items.length && <Card><p className="text-center font-semibold">No diagnoses match your search.</p></Card>}
      </div>
    </section>
  );
}
