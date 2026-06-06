import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, ImagePlus, X, AlertCircle, CheckCircle2, Leaf, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { predictDisease, formatPredictionResult } from '../services/diseaseDetectionService';

const DiseaseDetection = () => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Check if it's an image
    if (!file.type.match('image.*')) {
      setError('Please select a valid image file.');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setError(null);
      analyzeImage(file);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (file) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      // Call the disease detection model
      const prediction = await predictDisease(file);
      const formattedResult = formatPredictionResult(prediction);
      setResult(formattedResult);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(
        'Disease detection service unavailable. Make sure the local backend is running at http://localhost:8000'
      );
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setImageFile(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full max-w-5xl mx-auto flex flex-col">
      
      <div className="mt-8 mb-8 text-center">
        <span className="text-[10px] font-medium tracking-[4px] uppercase text-[rgba(210,230,160,0.65)] block mb-2">{t('diseaseDetection.plantHealthScanner')}</span>
        <h1 className="font-serif text-3xl md:text-5xl text-heading">
          {t('diseaseDetection.titlePrefix')} <em className="italic text-accent drop-shadow-[0_0_30px_rgba(230,245,120,0.2)]">{t('diseaseDetection.titleHighlight')}</em>
        </h1>
        <p className="text-body font-light max-w-lg mx-auto mt-4 text-sm leading-relaxed">
          {t('diseaseDetection.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Upload Area */}
        <div className="flex flex-col h-full">
          {!selectedImage ? (
            <div 
              className={`flex-1 glass-card p-8 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[400px] ${dragActive ? 'border-accent bg-[rgba(30,50,20,0.4)]' : 'border-[rgba(140,180,120,0.3)] hover:border-[rgba(180,210,140,0.6)] hover:bg-[rgba(15,25,15,0.4)]'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(15,25,15,0.6)] border border-[rgba(140,180,120,0.2)] flex items-center justify-center mb-6 text-accent shadow-[0_0_30px_rgba(230,245,120,0.1)]">
                <UploadCloud size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-serif text-heading mb-2">{t('diseaseDetection.dragDropTitle')}</h3>
              <p className="text-xs text-body font-light mb-8 max-w-xs leading-relaxed">
                {t('diseaseDetection.supportedFormats')}
              </p>
              
              <label className="glass-button px-8 py-3 cursor-pointer">
                <span className="text-[11px] font-medium tracking-[1.5px] uppercase">{t('diseaseDetection.browseFiles')}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleChange} />
              </label>
            </div>
          ) : (
            <div className="flex-1 glass-card overflow-hidden relative min-h-[400px] flex flex-col border border-[rgba(180,210,140,0.4)] shadow-[0_0_30px_rgba(230,245,120,0.05)]">
              <img src={selectedImage} alt="Uploaded crop" className="w-full h-full object-cover absolute inset-0 opacity-80 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,10,0.9)] via-[rgba(10,15,10,0.3)] to-transparent"></div>
              
              <button 
                onClick={resetAnalysis}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors z-20"
              >
                <X size={16} />
              </button>

              <div className="mt-auto p-6 relative z-10">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-2 border-[rgba(140,180,120,0.2)] rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-accent rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-accent">
                        <Sparkles size={20} className="animate-pulse" />
                      </div>
                    </div>
                    <h3 className="font-serif text-lg text-heading">{t('diseaseDetection.analyzingTitle')}</h3>
                    <p className="text-xs text-body font-light mt-1">{t('diseaseDetection.extractingFeatures')}</p>
                  </div>
                ) : result ? (
                  <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-12 h-12 rounded-full bg-[rgba(180,60,40,0.2)] border border-[rgba(220,80,60,0.3)] flex items-center justify-center text-[rgba(255,160,140,0.9)]">
                          <ShieldAlert size={24} />
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl text-heading text-[rgba(255,230,220,1)] drop-shadow-[0_0_10px_rgba(220,80,60,0.4)]">{result.disease}</h3>
                          <p className="text-xs font-light tracking-wide text-[rgba(255,160,140,0.8)] uppercase mt-1">{t('diseaseDetection.highRiskDetected')}</p>
                        </div>
                      </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="flex flex-col h-full">
          {error ? (
            <div className="flex-1 glass-card p-8 border border-[rgba(255,100,100,0.3)] bg-[rgba(100,20,20,0.2)] flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-16 h-16 text-[rgba(255,120,120,0.8)] mb-4" strokeWidth={1} />
              <h3 className="font-serif text-xl text-[rgba(255,150,150,0.9)] mb-3">{t('diseaseDetection.detectionFailed')}</h3>
              <p className="text-xs font-light text-[rgba(255,120,120,0.7)] mb-6">{error}</p>
              <button 
                onClick={resetAnalysis}
                className="glass-button px-6 py-2 text-[11px] tracking-[1.5px] uppercase"
              >
                {t('diseaseDetection.tryAnotherImage')}
              </button>
            </div>
          ) : !result && !analyzing ? (
            <div className="flex-1 glass-card p-8 flex flex-col items-center justify-center text-center border border-[rgba(140,180,120,0.1)] bg-[rgba(10,15,10,0.3)]">
              <ImagePlus className="w-16 h-16 text-[rgba(140,180,120,0.2)] mb-4" strokeWidth={1} />
              <h3 className="font-serif text-xl text-[rgba(215,230,190,0.4)]">{t('diseaseDetection.awaitingImage')}</h3>
              <p className="text-xs font-light text-[rgba(215,230,190,0.3)] mt-2">{t('diseaseDetection.analysisResultsHere')}</p>
            </div>
          ) : analyzing ? (
            <div className="flex-1 glass-card p-8 flex flex-col">
              <div className="space-y-6 animate-pulse opacity-60">
                <div>
                  <div className="h-4 bg-[rgba(140,180,120,0.2)] rounded w-1/4 mb-2"></div>
                  <div className="h-8 bg-[rgba(140,180,120,0.2)] rounded w-3/4"></div>
                </div>
                <div className="h-px bg-[rgba(140,180,120,0.1)] w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-[rgba(140,180,120,0.15)] rounded-xl"></div>
                  <div className="h-16 bg-[rgba(140,180,120,0.15)] rounded-xl"></div>
                </div>
                <div>
                  <div className="h-4 bg-[rgba(140,180,120,0.2)] rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[rgba(140,180,120,0.15)] rounded w-full"></div>
                    <div className="h-3 bg-[rgba(140,180,120,0.15)] rounded w-5/6"></div>
                    <div className="h-3 bg-[rgba(140,180,120,0.15)] rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-card p-8 flex flex-col border border-[rgba(180,210,140,0.25)] relative overflow-hidden animate-in fade-in slide-in-from-right-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(220,80,60,0.1)] blur-3xl rounded-full"></div>
              
              {result.uncertain && (
                <div className="mb-4 p-4 rounded-lg bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] flex items-start gap-3">
                  <AlertTriangle size={16} className="text-[rgba(255,180,0,0.8)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[rgba(255,200,100,0.9)]">{result.message}</p>
                </div>
              )}

                  <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-medium tracking-[3px] uppercase text-label block mb-1">{t('diseaseDetection.identifiedCrop')}</span>
                  <div className="flex items-center gap-2">
                    <Leaf size={14} className="text-accent" />
                    <span className="text-sm text-heading">{result.crop}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium tracking-[3px] uppercase text-label block mb-1">{t('diseaseDetection.confidence')}</span>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-lg font-serif text-accent">{result.confidence.toFixed(1)}%</span>
                    <CheckCircle2 size={16} className={result.confidence >= 80 ? "text-[rgba(180,210,140,0.9)]" : "text-[rgba(255,180,0,0.7)]"} />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[rgba(140,180,120,0.15)] to-transparent w-full mb-6"></div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-medium tracking-[3px] uppercase text-label block mb-1">{t('diseaseDetection.severityLevel')}</span>
                  <div className="text-sm text-heading">{result.severity || t('common.noDataFound')}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium tracking-[3px] uppercase text-label block mb-1">{t('diseaseDetection.infectedArea')}</span>
                  <div className="text-sm text-accent">{result.infected_area !== null && result.infected_area !== undefined ? `${result.infected_area}%` : 'N/A'}</div>
                </div>
              </div>

              {result.scores && result.scores.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-label mb-4">{t('diseaseDetection.predictionBreakdown')}</h4>
                  <div className="space-y-2">
                    {result.scores.map((score, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-body capitalize w-20">{score.class}</span>
                        <div className="flex-1 h-2 rounded-full bg-[rgba(140,180,120,0.1)] overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-accent to-[rgba(230,245,120,0.6)] transition-all duration-300"
                            style={{ width: `${score.percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-[rgba(215,230,190,0.6)] w-12 text-right">{score.percent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-[rgba(140,180,120,0.15)] to-transparent w-full mb-6"></div>

              <div className="mb-8">
                <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-label mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-[rgba(255,160,140,0.8)]" />
                  {t('diseaseDetection.treatmentProtocol')}
                </h4>
                <ul className="space-y-3">
                  {result.treatment.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm font-light leading-relaxed text-[rgba(215,230,190,0.8)]">
                      <span className="text-accent mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[rgba(15,25,15,0.4)] rounded-xl p-5 border border-[rgba(140,180,120,0.1)] mt-auto">
                <h4 className="text-[10px] font-medium tracking-[2px] uppercase text-[rgba(210,230,160,0.5)] mb-2">{t('diseaseDetection.preventativeMeasure')}</h4>
                <p className="text-xs font-light leading-relaxed text-body">{result.prevention}</p>
              </div>

              <div className="mt-6 flex gap-4">
                <button className="glass-button flex-1 py-3 bg-[rgba(180,60,40,0.2)] border-[rgba(220,80,60,0.3)] hover:bg-[rgba(180,60,40,0.3)] hover:border-[rgba(220,80,60,0.5)] group">
                  <span className="text-[11px] font-medium tracking-[1.5px] uppercase text-[rgba(255,180,160,1)] group-hover:text-white transition-colors">{t('diseaseDetection.findLocalFungicide')}</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
