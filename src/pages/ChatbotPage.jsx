import { ImagePlus, Mic, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LanguageSelector } from '../components/LanguageSelector';
import { sendChatMessage } from '../services/api';
import { useTranslation } from 'react-i18next';

const suggestedPrompts = [
  'Why are my tomato leaves turning yellow?',
  'Best fertilizer for sugarcane?',
  'How to prevent fungal infection?',
  'Should I spray after rainfall?',
];

export function ChatbotPage() {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Namaste. Tell me what you see on the crop, or upload an image.' }]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);

  const send = async (value = text) => {
    if (!value.trim()) return;
    setMessages((items) => [...items, { role: 'user', text: value }]);
    setText('');
    setTyping(true);
    const reply = await sendChatMessage(value, i18n.language);
    setMessages((items) => [...items, reply]);
    setTyping(false);
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[.75fr_1.25fr]">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black dark:text-white">AI Farmer Assistant</h1>
          <LanguageSelector />
        </div>
        <div className="grid gap-3">
          {suggestedPrompts.map((prompt) => (
            <button key={prompt} onClick={() => send(prompt)} className="rounded-lg bg-leaf-50 p-4 text-left font-semibold text-leaf-900 hover:bg-leaf-100 dark:bg-leaf-950 dark:text-leaf-100">
              {prompt}
            </button>
          ))}
        </div>
      </Card>
      <Card className="flex min-h-[650px] flex-col p-0">
        <div className="border-b border-slate-200 p-4 dark:border-white/10">
          <h2 className="font-black dark:text-white">Chat</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[82%] rounded-lg px-4 py-3 text-sm ${message.role === 'user' ? 'bg-leaf-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>{message.text}</p>
            </div>
          ))}
          {typing && <p className="w-fit rounded-lg bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">AI is typing...</p>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex gap-2 border-t border-slate-200 p-4 dark:border-white/10">
          <button type="button" className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 dark:border-white/10" aria-label="Upload image"><ImagePlus /></button>
          <button type="button" className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 dark:border-white/10" aria-label="Voice input"><Mic /></button>
          <input value={text} onChange={(event) => setText(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 outline-none dark:border-white/10 dark:bg-slate-950" placeholder="Ask about crop disease, fertilizer, or prevention..." />
          <Button><Send size={18} /></Button>
        </form>
      </Card>
    </section>
  );
}
