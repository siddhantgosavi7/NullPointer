import { ArrowRight, Bot, CloudSun, FileText, ShieldCheck, Smartphone, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const features = [
  ['Instant leaf scan', UploadCloud, 'Upload or capture crop images and receive AI diagnosis within seconds.'],
  ['Weather risk alerts', CloudSun, 'Understand humidity, rain, and temperature-driven disease risks.'],
  ['Farmer assistant', Bot, 'Ask crop questions in English, Hindi, or Marathi with image context.'],
  ['Report generator', FileText, 'Create treatment-ready reports for sharing with experts and shops.'],
];

export function LandingPage() {
  const { t } = useTranslation();
  return (
    <>
      <section className="bg-farm bg-cover bg-center">
        <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl flex-col justify-center px-4 py-14 text-white">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full bg-white/18 px-4 py-2 text-sm font-bold ring-1 ring-white/25">Built for field decisions, not office desks</p>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">{t('appName')}</h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold text-leaf-50">{t('heroTagline')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/auth">Start session <ArrowRight size={18} /></Button>
              <Button as={Link} to="/detect" variant="secondary">{t('uploadLeaf')}</Button>
            </div>
          </div>
          <div className="mt-10 grid gap-3 text-sm font-bold sm:grid-cols-3">
            {['AI scan with treatment plan', 'Weather-driven disease risk', 'Reports ready for experts'].map((item) => (
              <div key={item} className="border-l-4 border-leaf-300 bg-slate-950/24 px-4 py-3 backdrop-blur">{item}</div>
            ))}
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Features" title="Everything a farmer needs after spotting a sick leaf" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, Icon, text]) => (
            <Card key={title}>
              <Icon className="mb-4 text-leaf-600" size={30} />
              <h3 className="text-lg font-black dark:text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
          <SectionTitle eyebrow="How it works" title="Scan, understand, treat, prevent" />
          {['Capture a clear leaf photo', 'AI detects disease and severity', 'Download treatment report'].map((step, index) => (
            <Card key={step}>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-leaf-600 text-xl font-black text-white">{index + 1}</div>
              <h3 className="text-xl font-black dark:text-white">{step}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Built for quick field decisions with clear language and practical next steps.</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-2xl font-black dark:text-white">Benefits for farmers</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {['Reduce crop loss', 'Avoid unnecessary sprays', 'Get expert-ready reports', 'Work in local languages'].map((item) => (
              <p key={item} className="flex items-center gap-3 rounded-lg bg-leaf-50 p-4 font-bold text-leaf-900 dark:bg-leaf-950 dark:text-leaf-100">
                <ShieldCheck size={20} /> {item}
              </p>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black dark:text-white">Testimonials</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">“The diagnosis report helped me explain the issue to my local agronomist and act the same day.”</p>
          <p className="mt-4 font-bold">Anita Jadhav, Nashik</p>
        </Card>
      </section>
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <SectionTitle eyebrow="FAQ" title="Clear answers before the first scan" />
        {['Can I use the app offline?', 'Does it replace an agriculture expert?', 'Can I export reports as PDF?'].map((q) => (
          <details key={q} className="mb-3 rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
            <summary className="cursor-pointer font-bold">{q}</summary>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Yes, the UI is prepared for this workflow with mock data now and backend integration points ready.</p>
          </details>
        ))}
      </section>
      <Link to="/detect" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-leaf-600 text-white shadow-soft" aria-label="Start new scan">
        <Smartphone />
      </Link>
    </>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-black uppercase tracking-wide text-leaf-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
    </div>
  );
}
