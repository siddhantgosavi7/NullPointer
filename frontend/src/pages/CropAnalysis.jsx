import React, { useState } from 'react';
import { ImagePlus, Leaf, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import { analyzeCrop, formatCropAnalysisResult } from '../services/cropAnalysisService';

const CropAnalysis = () => {
  const [cropType, setCropType] = useState('Wheat');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match('image.*')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!imageFile) {
      setError('Please upload an image of the plant or leaf.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('crop_type', cropType);
      formData.append('growth_stage', growthStage);

      const prediction = await analyzeCrop(formData);
      setResult(formatCropAnalysisResult(prediction));
    } catch (err) {
      console.error('Crop analysis failed:', err);
      setError(err.message || 'Crop analysis service is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full max-w-5xl mx-auto flex flex-col">
      <div className="mt-8 mb-8 text-center">
        <span className="text-[10px] font-medium tracking-[4px] uppercase text-[rgba(210,230,160,0.65)] block mb-2">Field Intelligence</span>
        <h1 className="font-serif text-3xl md:text-5xl text-heading">
          Crop <em className="italic text-accent">Analysis</em>
        </h1>
        <p className="text-body font-light max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
          Upload crop imagery and select crop details to get a local analysis of plant health, nutrient status, pests, and growth stage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <form onSubmit={handleAnalyze} className="glass-card p-8 space-y-6 border border-[rgba(140,180,120,0.15)]">
          <div className="grid grid-cols-1 gap-4">
            <label className="text-sm font-medium text-heading">Crop Type</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
            >
              {['Wheat', 'Rice', 'Corn', 'Soybean', 'Maize'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="text-sm font-medium text-heading">Growth Stage</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="glass-input w-full p-4 bg-[rgba(10,15,10,0.6)]"
            >
              {['Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Seedling'].map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium text-heading">Upload Crop Image</label>
            <div className="relative rounded-3xl border border-[rgba(140,180,120,0.15)] bg-[rgba(10,15,10,0.6)] p-6 flex flex-col items-center justify-center gap-3 text-center">
              {selectedImage ? (
                <img src={selectedImage} alt="Uploaded crop" className="max-h-48 rounded-3xl object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-body">
                  <div className="w-16 h-16 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
                    <ImagePlus className="text-accent w-6 h-6" />
                  </div>
                  <p className="text-sm">Upload a plant or leaf photo to analyze crop health.</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 text-sm text-body" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-[#b44949] bg-[#3c1a1a] p-3 text-sm text-[#f5c6c6]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !imageFile}
            className="glass-button w-full py-4 text-[11px] tracking-[1.5px] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Crop'}
          </button>

          {result && (
            <button
              type="button"
              onClick={resetForm}
              className="glass-button w-full py-3 text-[11px] tracking-[1.5px] uppercase border border-[rgba(180,210,140,0.2)] bg-transparent"
            >
              Reset Form
            </button>
          )}
        </form>

        <div className="glass-card p-8 border border-[rgba(140,180,120,0.15)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[rgba(180,210,140,0.1)] flex items-center justify-center">
              <ShieldCheck className="text-accent w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-heading">Instant Crop Insights</h3>
              <p className="text-sm text-body mt-2">Use local inference to identify nutrient stress, pest risk, and plant growth recommendations without sending data to external services.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-[rgba(10,15,10,0.35)] border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Growth Stage</p>
              <p className="text-sm text-body">{growthStage}</p>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(10,15,10,0.35)] border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Expected Confidence</p>
              <p className="text-sm text-body">{result ? `${result.confidence.toFixed(1)}%` : 'Predictions based on local AI heuristics'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(10,15,10,0.35)] border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Recommendations</p>
              <p className="text-sm text-body">Get tailored crop management suggestions for fertilizer, irrigation, and pest monitoring.</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
          <Activity className="mb-4 text-accent w-12 h-12 animate-spin" />
          <p className="text-sm text-body">Analyzing uploaded image and crop state...</p>
        </div>
      )}

      {result && !loading && (
        <div className="glass-card p-8 border border-[rgba(180,210,140,0.25)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase tracking-[3px] text-label">Analysis Result</span>
              <h2 className="text-3xl font-serif text-heading mt-2">{result.cropType} Health</h2>
            </div>
            <div className="rounded-full bg-[rgba(180,210,140,0.1)] px-4 py-2 text-xs uppercase tracking-[2px] text-accent">{result.growthStage}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-3xl bg-[rgba(10,15,10,0.35)] p-5 border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Health Score</p>
              <div className="text-4xl font-serif text-accent">{result.healthScore}</div>
            </div>
            <div className="rounded-3xl bg-[rgba(10,15,10,0.35)] p-5 border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Pest Risk</p>
              <div className="text-sm text-heading">{result.pestRisk}</div>
            </div>
            <div className="rounded-3xl bg-[rgba(10,15,10,0.35)] p-5 border border-[rgba(140,180,120,0.1)]">
              <p className="text-[10px] uppercase tracking-[3px] text-label mb-2">Confidence</p>
              <div className="text-sm text-accent">{result.confidence.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-[rgba(10,15,10,0.35)] p-6 border border-[rgba(140,180,120,0.1)]">
              <h3 className="text-sm uppercase tracking-[2px] text-label mb-3">Growth Assessment</h3>
              <p className="text-sm leading-relaxed text-body">{result.growthAssessment}</p>
            </div>
            <div className="rounded-3xl bg-[rgba(10,15,10,0.35)] p-6 border border-[rgba(140,180,120,0.1)]">
              <h3 className="text-sm uppercase tracking-[2px] text-label mb-3">Nutrient Deficiencies</h3>
              {result.nutrientDeficiencies.length > 0 ? (
                <ul className="space-y-2 text-sm text-body">
                  {result.nutrientDeficiencies.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-body">None detected.</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-[rgba(10,15,10,0.35)] p-6 border border-[rgba(140,180,120,0.1)]">
            <h3 className="text-sm uppercase tracking-[2px] text-label mb-4">Actionable Recommendations</h3>
            <ul className="space-y-3 text-sm text-body">
              {result.recommendations.length > 0 ? result.recommendations.map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <Sparkles className="text-accent w-4 h-4 mt-1" />
                  <span>{item}</span>
                </li>
              )) : <li>No recommendations available.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropAnalysis;
