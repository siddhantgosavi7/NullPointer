import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, MapPin, Droplets, Sun, ChevronRight, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';

const CropRecommendation = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    soilType: '',
    location: '',
    water: '',
    season: ''
  });

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else analyze();
  };

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult({
        primary: {
          name: "Soybean",
          profitability: 88,
          risk: "Low",
          yield: "22-25 Quintals/Hectare",
          time: "90-110 Days"
        },
        secondary: [
          { name: "Cotton", profit: 82, risk: "Medium" },
          { name: "Pigeon Pea (Tur)", profit: 75, risk: "Low" }
        ]
      });
    }, 2000);
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setFormData({ soilType: '', location: '', water: '', season: '' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full max-w-4xl mx-auto flex flex-col">
      <div className="mt-8 mb-8 text-center">
        <span className="text-[10px] font-medium tracking-[4px] uppercase text-[rgba(210,230,160,0.65)] block mb-2">{t('cropRecommendation.smartFarming')}</span>
        <h1 className="font-serif text-3xl md:text-5xl text-heading">
          {t('cropRecommendation.titlePrefix')} <em className="italic text-accent drop-shadow-[0_0_30px_rgba(230,245,120,0.2)]">{t('cropRecommendation.titleHighlight')}</em>
        </h1>
      </div>

      {!result && !loading && (
        <div className="glass-card p-8 md:p-10 relative overflow-hidden flex-1 flex flex-col">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-accent' : 'bg-[rgba(140,180,120,0.15)]'}`}></div>
            ))}
          </div>

          <div className="flex-1">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
                    <MapPin className="text-accent w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-heading">{t('cropRecommendation.step1Title')}</h2>
                </div>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => handleSelect('location', e.target.value)}
                  placeholder={t('cropRecommendation.locationPlaceholder')} 
                  className="glass-input w-full p-4 text-base font-light placeholder:text-[rgba(180,210,150,0.3)] bg-[rgba(10,15,10,0.6)]"
                />
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
                    <Sprout className="text-accent w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-heading">{t('cropRecommendation.selectSoilType')}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[t('cropRecommendation.soilTypes.black'), t('cropRecommendation.soilTypes.red'), t('cropRecommendation.soilTypes.alluvial'), t('cropRecommendation.soilTypes.sandy')].map((type) => (
                    <div 
                      key={type}
                      onClick={() => handleSelect('soilType', type)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${formData.soilType === type ? 'bg-[rgba(180,210,140,0.15)] border-accent shadow-[0_0_20px_rgba(230,245,120,0.1)]' : 'bg-[rgba(15,25,15,0.4)] border-[rgba(140,180,120,0.15)] hover:border-[rgba(180,210,140,0.4)]'}`}
                    >
                      <h3 className={`text-sm font-medium ${formData.soilType === type ? 'text-accent' : 'text-heading'}`}>{type}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
                    <Droplets className="text-accent w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-heading">{t('cropRecommendation.waterAvailability')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: t('cropRecommendation.waterOptions.rainfed.label'), desc: t('cropRecommendation.waterOptions.rainfed.desc') },
                    { label: t('cropRecommendation.waterOptions.limited.label'), desc: t('cropRecommendation.waterOptions.limited.desc') },
                    { label: t('cropRecommendation.waterOptions.assured.label'), desc: t('cropRecommendation.waterOptions.assured.desc') }
                  ].map((option) => (
                    <div 
                      key={option.label}
                      onClick={() => handleSelect('water', option.label)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col ${formData.water === option.label ? 'bg-[rgba(180,210,140,0.15)] border-accent shadow-[0_0_20px_rgba(230,245,120,0.1)]' : 'bg-[rgba(15,25,15,0.4)] border-[rgba(140,180,120,0.15)] hover:border-[rgba(180,210,140,0.4)]'}`}
                    >
                      <h3 className={`text-sm font-medium mb-2 ${formData.water === option.label ? 'text-accent' : 'text-heading'}`}>{option.label}</h3>
                      <p className="text-xs font-light text-body">{option.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
                    <Sun className="text-accent w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif text-heading">{t('cropRecommendation.targetSeason')}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[t('cropRecommendation.seasons.kharif'), t('cropRecommendation.seasons.rabi'), t('cropRecommendation.seasons.zaid'), t('cropRecommendation.seasons.perennial')].map((season) => (
                    <div 
                      key={season}
                      onClick={() => handleSelect('season', season)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${formData.season === season ? 'bg-[rgba(180,210,140,0.15)] border-accent shadow-[0_0_20px_rgba(230,245,120,0.1)]' : 'bg-[rgba(15,25,15,0.4)] border-[rgba(140,180,120,0.15)] hover:border-[rgba(180,210,140,0.4)]'}`}
                    >
                      <h3 className={`text-sm font-medium ${formData.season === season ? 'text-accent' : 'text-heading'}`}>{season}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-end">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-[11px] font-medium tracking-[1.5px] uppercase text-body hover:text-white transition-colors mr-auto"
              >
                {t('cropRecommendation.backButton')}
              </button>
            )}
            <button 
              onClick={nextStep}
              disabled={
                (step === 1 && !formData.location) ||
                (step === 2 && !formData.soilType) ||
                (step === 3 && !formData.water) ||
                (step === 4 && !formData.season)
              }
              className="glass-button px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[11px] font-medium tracking-[1.5px] uppercase">{step === 4 ? t('cropRecommendation.analyzeData') : t('cropRecommendation.nextStep')}</span>
              {step < 4 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card flex-1 flex flex-col items-center justify-center p-12">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-2 border-[rgba(140,180,120,0.2)] rounded-full"></div>
            <div className="absolute inset-0 border-2 border-accent rounded-full border-t-transparent animate-spin duration-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="text-accent w-8 h-8 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-serif text-heading mb-2">{t('cropRecommendation.analyzingData')}</h2>
          <p className="text-sm font-light text-body">{t('cropRecommendation.runningModels', { location: formData.location || t('cropRecommendation.yourLocation') })}</p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="glass-card p-8 border border-accent/30 shadow-[0_0_50px_rgba(230,245,120,0.1)] relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-[10px] font-medium tracking-[3px] uppercase text-accent mb-2 flex items-center gap-2">
                  <CheckCircle2 size={14} /> {t('cropRecommendation.topRecommendation')}
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-heading text-[rgba(245,255,230,1)]">{result.primary.name}</h2>
              </div>
              <div className="w-16 h-16 rounded-full bg-[rgba(180,210,140,0.1)] border border-[rgba(180,210,140,0.3)] flex items-center justify-center">
                <Sprout className="text-accent w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <div className="bg-[rgba(10,15,10,0.4)] border border-[rgba(140,180,120,0.1)] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-label mb-1">{t('cropRecommendation.profitabilityIndex')}</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-serif text-accent">{result.primary.profitability}</span>
                  <span className="text-xs text-body mb-1">/100</span>
                </div>
              </div>
              <div className="bg-[rgba(10,15,10,0.4)] border border-[rgba(140,180,120,0.1)] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-label mb-1">{t('cropRecommendation.riskFactor')}</p>
                <span className="text-lg font-medium text-[rgba(180,210,140,0.9)]">{result.primary.risk}</span>
              </div>
              <div className="bg-[rgba(10,15,10,0.4)] border border-[rgba(140,180,120,0.1)] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-label mb-1">{t('cropRecommendation.expectedYield')}</p>
                <span className="text-sm font-medium text-heading">{result.primary.yield}</span>
              </div>
              <div className="bg-[rgba(10,15,10,0.4)] border border-[rgba(140,180,120,0.1)] rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-label mb-1">{t('cropRecommendation.harvestTime')}</p>
                <span className="text-sm font-medium text-heading">{result.primary.time}</span>
              </div>
            </div>
          </div>

          <h3 className="font-serif text-xl text-heading mb-4 px-2">{t('cropRecommendation.alternativeOptions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {result.secondary.map((crop, idx) => (
              <div key={idx} className="glass-card p-5 flex justify-between items-center group hover:bg-[rgba(20,30,20,0.4)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(140,180,120,0.1)] flex items-center justify-center">
                    <Sprout className="text-[rgba(180,210,140,0.7)] w-5 h-5 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-heading">{crop.name}</h4>
                    <p className="text-[10px] text-body uppercase tracking-wider">{crop.risk} {t('cropRecommendation.riskLabel')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-label block">{t('cropRecommendation.profitIndex')}</span>
                  <span className="text-lg font-serif text-[rgba(180,210,140,0.9)]">{crop.profit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={resetForm} className="px-6 py-3 text-[11px] font-medium tracking-[1.5px] uppercase text-body hover:text-white border border-[rgba(140,180,120,0.2)] rounded-full hover:bg-[rgba(20,30,20,0.5)] transition-all">
              {t('cropRecommendation.runNewAnalysis')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
