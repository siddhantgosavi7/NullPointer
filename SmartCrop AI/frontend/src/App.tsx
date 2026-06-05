import { useMemo, useState } from 'react';

type Language = 'Hindi' | 'Marathi' | 'Telugu' | 'English';

type AnalyzeResponse = {
  disease?: string;
  confidence?: number;
  advice?: string;
  remedy?: {
    organic?: string;
    chemical?: string;
  } | string;
  error?: string;
};

const API_URL = 'http://127.0.0.1:8000/api/analyze/';

const LANGUAGE_OPTIONS: Array<{ label: string; value: Language; voiceLang: string }> = [
  { label: 'Hindi', value: 'Hindi', voiceLang: 'hi-IN' },
  { label: 'Marathi', value: 'Marathi', voiceLang: 'mr-IN' },
  { label: 'Telugu', value: 'Telugu', voiceLang: 'te-IN' },
  { label: 'English', value: 'English', voiceLang: 'en-IN' },
];

const getSpeechLanguageCode = (language: Language) => {
  switch (language) {
    case 'Hindi':
      return 'hi-IN';
    case 'Marathi':
      return 'mr-IN';
    case 'Telugu':
      return 'te-IN';
    default:
      return 'en-IN';
  }
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Hindi');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confidencePercent = useMemo(() => {
    if (!result?.confidence) {
      return 0;
    }

    return Math.max(0, Math.min(100, Number(result.confidence)));
  }, [result]);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const setFile = (file: File | null) => {
    clearPreview();
    setSelectedFile(file);
    setResult(null);
    setErrorMessage(null);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    setPreviewUrl(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0] ?? null;
    if (file?.type.startsWith('image/')) {
      setFile(file);
      return;
    }

    setErrorMessage('Please upload a valid image file.');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Choose a crop image before submitting.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('language', selectedLanguage);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as AnalyzeResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to analyze the crop image.');
      }

      setResult(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const remedyText = typeof result?.remedy === 'string' ? { organic: result.remedy } : result?.remedy;

  const speakAdvice = () => {
    if (!result?.advice || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(result.advice);
    utterance.lang = getSpeechLanguageCode(selectedLanguage);

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith(utterance.lang.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">SmartCrop AI</span>
          <h1>Upload a crop image and get disease analysis instantly.</h1>
          <p>
            Choose your preferred language, submit the image, and review the prediction, confidence score,
            and agricultural advice from the backend API.
          </p>
        </div>

        <form className="panel" onSubmit={handleSubmit}>
          <label className="field">
            <span>Advice language</span>
            <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value as Language)}>
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label
            className="dropzone"
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={handleDrop}
          >
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <strong>{selectedFile ? selectedFile.name : 'Drop an image here or click to browse'}</strong>
            <span>PNG, JPG, or JPEG supported</span>
          </label>

          {previewUrl ? <img className="preview" src={previewUrl} alt="Selected crop preview" /> : null}

          <div className="actions">
            <button className="primary" type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? 'Analyzing…' : 'Submit'}
            </button>
            <button className="secondary" type="button" onClick={() => setFile(null)}>
              Clear
            </button>
          </div>

          {errorMessage ? <p className="error">{errorMessage}</p> : null}
        </form>
      </section>

      <section className="results-card">
        <h2>Results</h2>

        {result?.disease ? (
          <>
            <div className="result-grid">
              <article className="result-box">
                <span>Disease</span>
                <strong>{result.disease}</strong>
              </article>
              <article className="result-box">
                <span>Confidence</span>
                <strong>{confidencePercent.toFixed(2)}%</strong>
              </article>
            </div>

            <div className="meter">
              <div className="meter-fill" style={{ width: `${confidencePercent}%` }} />
            </div>

            <article className="advice-box">
              <span>Gemini Advice</span>
              <p>{result.advice ?? 'No advice returned.'}</p>
            </article>

            <article className="advice-box secondary-tone">
              <span>Remedy</span>
              <p>{remedyText?.organic ?? 'Follow the advice returned by the backend.'}</p>
              {remedyText?.chemical ? <p>{remedyText.chemical}</p> : null}
            </article>

            <button className="speech" type="button" onClick={speakAdvice} disabled={!result.advice}>
              Speak Advice
            </button>
          </>
        ) : (
          <p className="empty">Your analysis results will appear here after you submit an image.</p>
        )}
      </section>
    </main>
  );
}
