import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';

// Dummy AI reply logic (replace with real API call in production)
const getAIResponse = async (message: string) => {
  // Simulează un răspuns AI
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(
        message.toLowerCase().includes('parola')
          ? 'Pentru resetarea parolei, folosește opțiunea "Ai uitat parola?" de pe pagina de login.'
          : 'Sunt asistentul tău AI! Pot răspunde la întrebări despre platformă, funcționalități sau securitate.'
      );
    }, 1000);
  });
};

const ChatBotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text: 'Salut! Sunt asistentul AI. Cu ce te pot ajuta astăzi?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);
    const aiReply = await getAIResponse(userMessage);
    setMessages((m) => [...m, { sender: 'bot', text: aiReply }]);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="open"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white rounded-full shadow-lg p-4 hover:bg-indigo-700 focus:outline-none"
            title="Deschide chat AI"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#6366f1" />
              <text x="12" y="16" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">AI</text>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="w-80 max-w-xs bg-white dark:bg-slate-900 shadow-2xl rounded-xl flex flex-col border border-slate-200 dark:border-slate-700"
            style={{ height: 420 }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-t-xl">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">Asistent AI</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gradient-to-br from-indigo-50/60 via-white/80 to-slate-100/60 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg shadow text-sm max-w-[80%] ' +
                      (msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none')
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form
              className="flex items-center border-t border-slate-100 dark:border-slate-800 px-2 py-2 bg-slate-50 dark:bg-slate-800 rounded-b-xl"
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent outline-none px-2 py-1 text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Scrie un mesaj..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                disabled={loading || !input.trim()}
                title="Trimite"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBotWidget;
