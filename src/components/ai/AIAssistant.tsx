import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, User, Send, X, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIService } from "@/hooks/useAIService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { generateResponse } = useAIService();

  // Funcție pentru a genera un ID unic
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Funcție pentru a adăuga un mesaj în conversație
  const addMessage = (role: "user" | "assistant" | "system", content: string) => {
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
      // Obținem răspunsul de la AI
      const response = await generateResponse(userMessage, messages);
      
      // Adăugăm răspunsul asistentului
      addMessage("assistant", response);
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

  // Funcție pentru a deschide/închide asistentul
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  // Funcție pentru a minimiza/maximiza asistentul
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Scroll automat la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus pe input când se deschide asistentul
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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
              className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
              size="icon"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t("ai.openAssistant", "Deschide asistentul AI")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Fereastra asistentului */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-20 right-4 w-80 md:w-96 bg-card rounded-lg shadow-xl border overflow-hidden z-50",
              isMinimized && "h-auto"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-muted">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-medium">
                  {t("ai.assistantTitle", "Asistent AI")}
                </h3>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleMinimize}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleAssistant}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conținut */}
            {!isMinimized && (
              <>
                {/* Mesaje */}
                <ScrollArea className="h-[380px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          message.role === "user"
                            ? "ml-auto items-end"
                            : "mr-auto items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.content}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {message.role === "user"
                            ? t("ai.you", "Tu")
                            : t("ai.assistant", "Asistent")}{" "}
                          • {formatTime(message.timestamp)}
                        </span>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start max-w-[80%] mr-auto">
                        <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t(
                        "ai.inputPlaceholder",
                        "Scrieți un mesaj..."
                      )}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
