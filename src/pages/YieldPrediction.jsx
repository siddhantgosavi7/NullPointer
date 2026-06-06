import React, { useState } from 'react';
import { ArrowUpRight, Droplets, Thermometer, Leaf, Layers } from 'lucide-react';
import { predictYield, formatYieldPrediction } from '../services/yieldPredictionService';

const YieldPrediction = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    soilMoisture: '',
    soilPH: '',
    rainfall: '',
    temperature: '',
    historicalYields: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const parseHistorical = () => {
    return formData.historicalYields
      .split(',')
      .map((item) => parseFloat(item.trim()))
      .filter((value) => !Number.isNaN(value))
      .map((yieldVal) => ({ yield: yieldVal }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      crop_type: formData.cropType,
      area: Number(formData.area),
      soil_parameters: {
        moisture: Number(formData.soilMoisture),
        ph: Number(formData.soilPH),
      },
      weather_data: {
        rainfall: Number(formData.rainfall),
        temperature: Number(formData.temperature),
      },
      historical_data: parseHistorical(),
    };

    try {
      const prediction = await predictYield(payload);
      setResult(formatYieldPrediction(prediction));
    } catch (err) {
      setError(err.message || 'Yield prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full max-w-5xl mx-auto flex flex-col">
      <div className="mt-8 mb-8 text-center">
        <span className="text-[10px] font-medium tracking-[4px] uppercase text-[rgba(210,230,160,0.65)] block mb-2">Yield Forecast</span>
        <h1 className="font-serif text-3xl md:text-5xl text-heading">
          Yield <em className="italic text-accent">Prediction</em>
        </h1>
        <p className="text-body font-light max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
          Provide crop, area, soil, weather, and historical data to estimate productivity using the local AI model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 border border-[rgba(140,180,120,0.15)]">
          <div className="grid grid-cols-1 gap-4">
            <label className="text-sm font-medium text-heading">Crop Type</label>
            <select
              value={formData.cropType}
              onChange={(e) => handleChange('cropType', e.target.value)}
              className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
            >
              <option value="">Select crop</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Corn">Corn</option>
              <option value="Soybean">Soybean</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading">Area (Hectares)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                min="0"
                step="0.1"
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading">Soil pH</label>
              <input
                type="number"
                value={formData.soilPH}
                onChange={(e) => handleChange('soilPH', e.target.value)}
                min="0"
                max="14"
                step="0.1"
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="e.g. 6.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading">Soil Moisture (%)</label>
              <input
                type="number"
                value={formData.soilMoisture}
                onChange={(e) => handleChange('soilMoisture', e.target.value)}
                min="0"
                max="100"
                step="1"
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="e.g. 32"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading">Rainfall (mm)</label>
              <input
                type="number"
                value={formData.rainfall}
                onChange={(e) => handleChange('rainfall', e.target.value)}
                min="0"
                step="1"
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="e.g. 68"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-heading">Temperature (°C)</label>
              <input
                type="number"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                min="-10"
                max="60"
                step="0.1"
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="e.g. 28"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-heading">Historical Yields</label>
              <input
                type="text"
                value={formData.historicalYields}
                onChange={(e) => handleChange('historicalYields', e.target.value)}
                className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
                placeholder="Comma-separated values"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.cropType || !formData.area}
            className="glass-button w-full py-4 text-[11px] tracking-[1.5px] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Predicting...' : 'Predict Yield'}
          </button>

          {error && (
            <div className="text-sm text-rose-300 bg-[rgba(200,60,60,0.15)] p-3 rounded-lg">
              {error}
            </div>
          )}
        </form>

        <div className="glass-card p-8 border border-[rgba(140,180,120,0.15)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
              <Layers className="text-accent w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-heading">Yield Prediction Overview</h3>
              <p className="text-sm text-body mt-2">
                This local AI-driven endpoint estimates agricultural yield using crop, area, soil, weather, and historical trends.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-[rgba(10,15,10,0.35)] border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Confidence</p>
              <div className="text-3xl font-serif text-accent">{result ? `${result.confidence.toFixed(1)}%` : '--'}</div>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(10,15,10,0.35)] border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Forecast</p>
              <p className="text-sm text-body">{result ? result.forecast : 'Enter inputs and submit to see the forecast.'}</p>
            </div>
          </div>

          {result && (
            <div className="mt-6 p-5 rounded-2xl bg-[rgba(15,25,15,0.5)] border border-[rgba(140,180,120,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium uppercase tracking-[2px] text-accent">Prediction</h4>
                <span className="text-xs text-body">Yield estimate</span>
              </div>
              <div className="text-4xl font-serif text-heading mb-4">{result.predictedYield} quintals</div>
              <ul className="space-y-3 text-sm text-body leading-relaxed">
                {result.suggestions.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <ArrowUpRight size={14} className="text-accent mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {result.note && <p className="text-[11px] text-[rgba(210,230,190,0.7)] mt-4">{result.note}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
