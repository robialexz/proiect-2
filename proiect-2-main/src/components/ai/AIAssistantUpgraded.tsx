import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Bot, 
  User, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Loader2, 
  Sparkles,
  Lightbulb,
  HelpCircle,
  Settings,
  History,
  Trash2,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIService } from "@/hooks/useAIService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export const AIAssistantUpgraded: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "suggestions" | "history">("chat");
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    generateResponse, 
    updateContext, 
    suggestions, 
    saveConversation,
    analyzeSentiment
  } = useAIService();

  // Actualizăm contextul când se schimbă pagina
  useEffect(() => {
    updateContext({ page: location.pathname });
  }, [location.pathname, updateContext]);

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
      await saveConversation([...messages, { id: generateId(), role: "user", content: userMessage, timestamp: new Date() }, { id: generateId(), role: "assistant", content: response, timestamp: new Date() }]);
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

  // Scroll automat la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus pe input când se deschide asistentul
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === "chat") {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, activeTab]);

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

      {/* Fereastra asistentului */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "600px",
              width: isMinimized ? "auto" : "400px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-20 right-4 bg-card rounded-lg shadow-xl border overflow-hidden z-50",
              isMinimized && "h-auto w-auto"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-muted">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-medium">
                  {t("ai.assistantTitle", "Asistent AI")}
                </h3>
                <Badge variant="outline" className="ml-2 text-xs">
                  {t("ai.version", "v2.0")}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {t("ai.settings", "Setări")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearConversation}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("ai.clearConversation", "Șterge conversația")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="chat" className="flex-1">
                      <Bot className="h-4 w-4 mr-2" />
                      {t("ai.chat", "Chat")}
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="flex-1">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {t("ai.suggestions", "Sugestii")}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">
                      <History className="h-4 w-4 mr-2" />
                      {t("ai.history", "Istoric")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="p-0 m-0">
                    {/* Mesaje */}
                    <ScrollArea className="h-[480px] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex flex-col max-w-[80%] group",
                              message.role === "user"
                                ? "ml-auto items-end"
                                : "mr-auto items-start"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {message.role === "assistant" && (
                                <div className="flex-shrink-0 mt-1">
                                  <Bot className="h-5 w-5 text-primary" />
                                </div>
                              )}
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
                              {message.role === "user" && (
                                <div className="flex-shrink-0 mt-1">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center mt-1 gap-2">
                              <span className="text-xs text-muted-foreground">
                                {message.role === "user"
                                  ? t("ai.you", "Tu")
                                  : t("ai.assistant", "Asistent")}{" "}
                                • {formatTime(message.timestamp)}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => copyMessage(message.id, message.content)}
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex items-start max-w-[80%] mr-auto">
                            <div className="flex-shrink-0 mt-1 mr-2">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t("ai.thinking", "Se gândește...")}</span>
                              </div>
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
                  </TabsContent>

                  <TabsContent value="suggestions" className="p-0 m-0">
                    <ScrollArea className="h-[480px]">
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                            {t("ai.suggestedQuestions", "Întrebări sugerate")}
                          </h3>
                          <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-2"
                                onClick={() => useSuggestion(suggestion)}
                              >
                                <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                            {t("ai.helpTopics", "Subiecte de ajutor")}
                          </h3>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => useSuggestion("Cum folosesc inventarul?")}
                            >
                              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{t("ai.helpInventory", "Cum folosesc inventarul?")}</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => useSuggestion("Cum creez un proiect nou?")}
                            >
                              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{t("ai.helpProject", "Cum creez un proiect nou?")}</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => useSuggestion("Cum adaug un furnizor?")}
                            >
                              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{t("ai.helpSupplier", "Cum adaug un furnizor?")}</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => useSuggestion("Cum generez un raport?")}
                            >
                              <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>{t("ai.helpReport", "Cum generez un raport?")}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="history" className="p-0 m-0">
                    <ScrollArea className="h-[480px]">
                      <div className="p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <History className="h-4 w-4 mr-2" />
                          {t("ai.conversationHistory", "Istoricul conversațiilor")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {t(
                            "ai.historyDescription",
                            "Istoricul conversațiilor va fi disponibil în curând. Această funcționalitate este în curs de dezvoltare."
                          )}
                        </p>
                        <div className="flex justify-center py-8">
                          <Button
                            variant="outline"
                            onClick={clearConversation}
                            className="flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("ai.clearCurrentConversation", "Șterge conversația curentă")}
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
