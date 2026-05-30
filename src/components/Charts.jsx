

const healthTrends = [
  { month: 'Jan', score: 74, scans: 12 },
  { month: 'Feb', score: 79, scans: 18 },
  { month: 'Mar', score: 68, scans: 24 },
  { month: 'Apr', score: 82, scans: 21 },
  { month: 'May', score: 88, scans: 32 },
  { month: 'Jun', score: 84, scans: 29 },
];

const diseaseFrequency = [
  { name: 'Blight', value: 32 },
  { name: 'Rust', value: 24 },
  { name: 'Mildew', value: 18 },
  { name: 'Leaf Spot', value: 26 },
];

export function HealthTrendChart() {
  return (
    <div className="grid gap-3">
      {healthTrends.map((item) => (
        <div key={item.month} className="grid grid-cols-[48px_1fr_40px] items-center gap-3 text-sm">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{item.month}</span>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-leaf-600" style={{ width: `${item.score}%` }} />
          </div>
          <span className="text-right font-bold text-slate-800 dark:text-slate-100">{item.score}</span>
        </div>
      ))}
    </div>
  );
}

export function DiseaseBarChart() {
  const max = Math.max(...diseaseFrequency.map((item) => item.value));

  return (
    <div className="grid gap-3">
      {diseaseFrequency.map((item) => (
        <div key={item.name} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-sm">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{item.name}</span>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="text-right font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function FrequencyPieChart() {
  const total = diseaseFrequency.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-3">
      {diseaseFrequency.map((item) => (
        <div key={item.name} className="grid gap-1">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span>{item.name}</span>
            <span>{Math.round((item.value / total) * 100)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-leaf-500" style={{ width: `${(item.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
