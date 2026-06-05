"use client";

import { useMemo, useState } from "react";

type Remedy = {
  organic?: string;
  chemical?: string;
};

type DetectionResponse = {
  disease: string;
  confidence: number;
  remedy?: Remedy | string;
  advice?: string;
};

const API_URL = "http://127.0.0.1:8000/api/analyze/";

const LANGUAGE_OPTIONS = [
  { label: "Hindi", value: "Hindi", voiceLang: "hi-IN" },
  { label: "Marathi", value: "Marathi", voiceLang: "mr-IN" },
  { label: "Telugu", value: "Telugu", voiceLang: "te-IN" },
  { label: "English", value: "English", voiceLang: "en-IN" },
] as const;

type LanguageValue = (typeof LANGUAGE_OPTIONS)[number]["value"];

export default function CropDiseaseDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageValue>("Hindi");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResponse | null>(null);

  const confidencePercent = useMemo(() => {
    if (!result) {
      return 0;
    }
    return Math.max(0, Math.min(100, Number(result.confidence) * 100));
  }, [result]);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const setFile = (file: File | null) => {
    clearPreview();
    setErrorMessage(null);
    setResult(null);
    setSelectedFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      setFile(file);
    } else {
      setErrorMessage("Please upload a valid image file.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Choose a crop image before submitting.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("language", selectedLanguage);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to analyze the crop image.");
      }

      const data = (await response.json()) as DetectionResponse;
      setResult(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const remedyText = typeof result?.remedy === "string" ? { organic: result.remedy } : result?.remedy;

  const speakAdvice = () => {
    if (!result?.advice || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const voiceLang = LANGUAGE_OPTIONS.find((option) => option.value === selectedLanguage)?.voiceLang ?? "en-IN";
    const utterance = new SpeechSynthesisUtterance(result.advice);
    utterance.lang = voiceLang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith(voiceLang.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ecfdf5_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  SmartCrop AI
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Indian Crop Disease Detection
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Upload a plant leaf photo, get a quick AI diagnosis, and see practical organic and chemical remedies tailored for Indian farmers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-semibold text-slate-700">
                    Advice language
                  </label>
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value as LanguageValue)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  onDragEnter={() => setIsDragging(true)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50 shadow-inner"
                      : "border-slate-300 bg-slate-50/80 hover:border-emerald-400 hover:bg-emerald-50/50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Upload crop image"
                  />
                  <div className="pointer-events-none mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700 shadow-sm">
                      📷
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Drag and drop crop image here</p>
                      <p className="mt-1 text-sm text-slate-500">or click to browse JPG, PNG, and other image formats</p>
                    </div>
                  </div>
                </div>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-700">Image Preview</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Remove
                      </button>
                    </div>
                    <img src={previewUrl} alt="Selected crop preview" className="h-72 w-full object-cover" />
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isLoading || !selectedFile}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Analyzing crop image
                      </span>
                    ) : (
                      "Detect Disease"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}
              </form>
            </section>

            <aside className="border-t border-white/70 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 lg:p-10">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Live Result</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Diagnosis summary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Results appear here after analysis, along with confidence and treatment guidance.
                </p>
              </div>

              {result ? (
                <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
                  <div>
                    <p className="text-sm text-slate-300">Detected Disease</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-emerald-300">{result.disease}</h3>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>Confidence</span>
                      <span>{confidencePercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-500"
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Organic remedy</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {remedyText?.organic ?? "Follow recommended crop hygiene and consult a local agronomist."}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Chemical remedy</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {remedyText?.chemical ?? "Use only label-approved treatments recommended in your district."}
                      </p>
                    </div>
                  </div>

                  {result.advice ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Gemini advice</p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">{result.advice}</p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={speakAdvice}
                    disabled={!result?.advice}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Speak Advice
                  </button>
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-slate-300">
                  Upload an image to see the disease prediction, confidence score, and remedies.
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
