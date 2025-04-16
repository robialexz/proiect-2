import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  HelpCircle,
  Search,
  Package,
  FileSpreadsheet,
  User,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { dataLoader } from "@/lib/data-loader";

// Enhanced AI reply logic with context awareness
const getAIResponse = async (message: string) => {
  const lowerMessage = message.toLowerCase();

  // Check for inventory related questions
  if (
    lowerMessage.includes("inventar") ||
    lowerMessage.includes("materiale") ||
    lowerMessage.includes("stoc")
  ) {
    try {
      // Try to get inventory count from cache or database
      const cacheKey = "inventory_stats";
      let stats = dataLoader.getData(cacheKey);

      if (!stats) {
        const { data, error } = await supabase
          .from("materials")
          .select("id, quantity", { count: "exact" });

        if (error) throw error;

        const totalItems = data?.length || 0;
        const totalQuantity =
          data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        stats = { totalItems, totalQuantity };
        dataLoader.saveData(cacheKey, stats, 5 * 60 * 1000); // Cache for 5 minutes
      }

      if (
        lowerMessage.includes("câte") ||
        lowerMessage.includes("numar") ||
        lowerMessage.includes("total")
      ) {
        return `În prezent, avem ${stats.totalItems} materiale diferite în inventar, cu o cantitate totală de ${stats.totalQuantity} unități.`;
      } else {
        return "Pot să te ajut cu informații despre inventar, căutarea materialelor, sau exportul datelor în Excel. Ce anume dorești să afli?";
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      return "Îmi pare rău, nu am putut accesa informațiile despre inventar în acest moment. Poți încerca din nou mai târziu sau contacta administratorul sistemului.";
    }
  }

  // Authentication related questions
  if (
    lowerMessage.includes("login") ||
    lowerMessage.includes("autentificare") ||
    lowerMessage.includes("parola")
  ) {
    if (
      lowerMessage.includes("parola") &&
      (lowerMessage.includes("uitat") || lowerMessage.includes("reset"))
    ) {
      return 'Pentru resetarea parolei, folosește opțiunea "Ai uitat parola?" de pe pagina de login. Vei primi un email cu instrucțiuni pentru resetarea parolei.';
    }
    return 'Pentru autentificare, folosește adresa de email și parola asociată contului tău. Dacă întâmpini probleme, poți folosi opțiunea "Ai uitat parola?" sau contacta administratorul sistemului.';
  }

  // Excel/import/export related questions
  if (
    lowerMessage.includes("excel") ||
    lowerMessage.includes("import") ||
    lowerMessage.includes("export")
  ) {
    return 'Poți exporta datele din inventar în format Excel folosind butonul "Export to Excel" din partea de sus a paginii. Pentru importul datelor, folosește funcția de upload din secțiunea corespunzătoare.';
  }

  // Help with using the platform
  if (
    lowerMessage.includes("ajutor") ||
    lowerMessage.includes("cum") ||
    lowerMessage.includes("folosesc")
  ) {
    return "Platforma noastră oferă funcționalități pentru gestionarea inventarului, proiectelor și materialelor. Poți naviga folosind meniul din stânga. Pentru acțiuni specifice pe fiecare pagină, caută butoanele de acțiune din partea de sus a paginii. Ai nevoie de ajutor cu o funcționalitate anume?";
  }

  // Default response with suggestions
  return "Sunt asistentul tău AI! Pot să te ajut cu informații despre inventar, proiecte, materiale, import/export date sau utilizarea platformei. Ce întrebare ai?";
};

interface ChatBotWidgetProps {
  initialMessage?: string;
  contextType?: "inventory" | "projects" | "general";
}

const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({
  initialMessage = "Salut! Sunt asistentul AI. Cu ce te pot ajuta astăzi?",
  contextType = "general",
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([
    {
      sender: "bot",
      text: initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Set context-specific suggestions based on the context type
  useEffect(() => {
    if (contextType === "inventory") {
      setSuggestions([
        "Câte materiale avem în inventar?",
        "Cum pot exporta inventarul în Excel?",
        "Cum adaug un material nou?",
      ]);
    } else if (contextType === "projects") {
      setSuggestions([
        "Cum creez un proiect nou?",
        "Cum pot asocia materiale cu un proiect?",
        "Cum văd toate proiectele active?",
      ]);
    } else {
      setSuggestions([
        "Cum folosesc platforma?",
        "Am uitat parola, ce fac?",
        "Cum pot vedea inventarul complet?",
      ]);
    }
  }, [contextType]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await getAIResponse(userMessage);
      setMessages((m) => [...m, { sender: "bot", text: aiReply }]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          text: "Îmi pare rău, am întâmpinat o problemă în procesarea întrebării tale. Te rog să încerci din nou.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
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
            <div className="relative">
              <HelpCircle size={28} />
              <div className="absolute -top-1 -right-1 bg-white text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
            </div>
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
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="w-96 max-w-sm bg-white dark:bg-slate-900 shadow-2xl rounded-xl flex flex-col border border-slate-200 dark:border-slate-700"
            style={{ height: 480 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-indigo-600 text-white rounded-t-xl">
              <span className="font-semibold flex items-center">
                <HelpCircle size={18} className="mr-2" />
                Asistent AI
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2 mt-1">
                      <HelpCircle
                        size={16}
                        className="text-indigo-600 dark:text-indigo-300"
                      />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-lg shadow-sm text-sm max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2 mt-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                    <HelpCircle
                      size={16}
                      className="text-indigo-600 dark:text-indigo-300"
                    />
                  </div>
                  <div className="px-4 py-3 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && messages.length < 3 && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Întrebări sugerate:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              className="flex items-center border-t border-slate-200 dark:border-slate-700 px-3 py-3 bg-white dark:bg-slate-900 rounded-b-xl"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full outline-none px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                placeholder="Scrie un mesaj..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ml-2 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                disabled={loading || !input.trim()}
                title="Trimite"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBotWidget;
