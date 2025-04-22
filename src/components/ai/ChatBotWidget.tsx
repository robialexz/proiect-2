import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Settings,
  History,
  Trash2,
  Copy,
  Check,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cacheService } from "@/lib/cache-service";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useAIService } from "@/hooks/useAIService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      let stats = cacheService.get<{
        totalItems: number;
        totalQuantity: number;
      }>(cacheKey, { namespace: "data" });

      if (!stats) {
        let data = null;
        let error = null;

        try {
          const response = await supabase
            .from("materials")
            .select("id, quantity", { count: "exact" });

          data = response.data;
          error = response.error;
        } catch (err) {
          // Handle error appropriately
          error = err;
        }

        if (error) throw error;

        const totalItems = data?.length || 0;
        const totalQuantity =
          data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        stats = { totalItems, totalQuantity };
        cacheService.set(cacheKey, stats, {
          namespace: "data",
          ttl: 5 * 60 * 1000,
        }); // Cache for 5 minutes
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
      // Removed console statement
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

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatBotWidgetProps {
  initialMessage?: string;
  contextType?: "inventory" | "projects" | "general";
}

const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({
  initialMessage = "Salut! Sunt asistentul AI. Cu ce te pot ajuta astăzi?",
  contextType = "general",
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "chat" | "suggestions" | "history"
  >("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    generateResponse,
    updateContext,
    suggestions: aiSuggestions,
    saveConversation,
    analyzeSentiment,
  } = useAIService();

  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  // Actualizăm contextul când se schimbă pagina
  useEffect(() => {
    updateContext({ page: location.pathname });
  }, [location.pathname, updateContext]);

  // Funcție pentru a genera un ID unic
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Funcție pentru a adăuga un mesaj în conversație
  const addMessage = (
    role: "user" | "assistant" | "system",
    content: string
  ) => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Funcție pentru a trimite un mesaj
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Adăugăm mesajul utilizatorului
    const userMessage = input.trim();
    addMessage("user", userMessage);
    setInput("");
    setIsLoading(true);

    try {
      // Analizăm sentimentul mesajului
      const sentiment = await analyzeSentiment(userMessage);

      // Dacă sentimentul este negativ, afișăm un toast
      if (sentiment === "negative") {
        toast({
          title: t("ai.negativeSentiment", "Feedback negativ detectat"),
          description: t(
            "ai.negativeSentimentDescription",
            "Am detectat un sentiment negativ în mesajul dumneavoastră. Vom încerca să vă ajutăm cât mai bine."
          ),
          variant: "default",
        });
      }

      // Obținem răspunsul de la AI
      const response = await generateResponse(userMessage, messages);

      // Adăugăm răspunsul asistentului
      addMessage("assistant", response);

      // Salvăm conversația
      await saveConversation([
        ...messages,
        {
          id: generateId(),
          role: "user",
          content: userMessage,
          timestamp: new Date(),
        },
        {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      addMessage(
        "assistant",
        t(
          "ai.error",
          "Îmi pare rău, am întâmpinat o problemă în procesarea cererii dumneavoastră. Vă rugăm să încercați din nou."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  // Verificăm dacă utilizatorul este autentificat
  if (!user) return null;

  // Funcție pentru a deschide/închide asistentul
  const toggleAssistant = () => {
    setOpen(!open);
    setIsMinimized(false);
  };

  // Funcție pentru a minimiza/maximiza asistentul
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Funcție pentru a șterge conversația
  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t(
          "ai.welcome",
          "Bună ziua! Sunt asistentul AI al aplicației. Cum vă pot ajuta astăzi?"
        ),
        timestamp: new Date(),
      },
    ]);
  };

  // Funcție pentru a copia un mesaj
  const copyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);

    // Resetăm starea după 2 secunde
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Funcție pentru a folosi o sugestie
  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setActiveTab("chat");
    inputRef.current?.focus();
  };

  // Formatarea datei pentru afișare
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Buton pentru deschiderea asistentului */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleAssistant}
              className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
              size="icon"
            >
              <Bot className="h-7 w-7" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                AI
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t("ai.openAssistant", "Deschide asistentul AI")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
              ref={messagesEndRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2 mt-1">
                      <HelpCircle
                        size={16}
                        className="text-indigo-600 dark:text-indigo-300"
                      />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-lg shadow-sm text-sm max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2 mt-1">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
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
                sendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full outline-none px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                placeholder="Scrie un mesaj..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                className="ml-2 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                disabled={isLoading || !input.trim()}
                title="Trimite"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotWidget;
