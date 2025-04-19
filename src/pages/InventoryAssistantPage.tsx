import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  HelpCircle,
  Clipboard,
  CheckCircle2,
} from "lucide-react";
import { inventoryService } from "@/lib/inventory-service";
// Importăm serviciul mock în loc de cel real pentru a asigura funcționalitatea
import { mockInventoryAssistantService as inventoryAssistantService } from "@/lib/mock-inventory-assistant-service";
import { Material } from "@/types";

/**
 * Pagina pentru AI Inventory Assistant
 * Oferă o interfață conversațională pentru interacțiunea cu inventarul
 */
const InventoryAssistantPage: React.FC = () => {
  // State pentru mesaje
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
      isProcessing?: boolean;
      isError?: boolean;
    }>
  >([
    {
      id: "1",
      role: "assistant",
      content:
        "Bună ziua! Sunt asistentul tău pentru inventar. Cum te pot ajuta astăzi? Poți să mă întrebi despre stocuri, să setezi niveluri minime, să generezi liste de reaprovizionare și multe altele.",
      timestamp: new Date(),
    },
  ]);

  // State pentru input
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] =
    useState(false);
  const [isSpeechSynthesisActive, setIsSpeechSynthesisActive] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Referințe
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognition = useRef<any>(null);
  const { toast } = useToast();

  // Efect pentru scroll la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Efect pentru inițializarea recunoașterii vocale
  useEffect(() => {
    // Verificăm dacă browserul suportă Speech Recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      speechRecognition.current.lang = "ro-RO";

      speechRecognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setInput(transcript);
      };

      speechRecognition.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsSpeechRecognitionActive(false);
        toast({
          title: "Eroare recunoaștere vocală",
          description: `A apărut o eroare: ${event.error}`,
          variant: "destructive",
        });
      };

      speechRecognition.current.onend = () => {
        setIsSpeechRecognitionActive(false);
      };
    }

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
    };
  }, [toast]);

  // Funcție pentru a genera un ID unic
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Funcție pentru a procesa mesajul utilizatorului
  const processUserMessage = async (message: string) => {
    if (!message.trim()) return;

    // Adăugăm mesajul utilizatorului
    const userMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Adăugăm un mesaj temporar pentru asistent (în procesare)
    const assistantMessageId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isProcessing: true,
      },
    ]);

    setIsProcessing(true);
    setInput("");

    try {
      // Procesăm mesajul cu serviciul de asistent
      const response = await inventoryAssistantService.processMessage(message);

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Actualizăm mesajul asistentului cu răspunsul
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  response.data?.response ||
                  "Nu am putut procesa cererea. Te rog să încerci din nou.",
                isProcessing: false,
              }
            : msg
        )
      );

      // Citim răspunsul dacă sinteza vocală este activă
      if (isSpeechSynthesisActive && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          response.data?.response || ""
        );
        utterance.lang = "ro-RO";
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error processing message:", error);

      // Actualizăm mesajul asistentului cu eroarea
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  "A apărut o eroare în procesarea cererii tale. Te rog să încerci din nou.",
                isProcessing: false,
                isError: true,
              }
            : msg
        )
      );

      toast({
        title: "Eroare",
        description:
          error instanceof Error
            ? error.message
            : "A apărut o eroare în procesarea cererii tale.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Funcție pentru a gestiona trimiterea mesajului
  const handleSendMessage = () => {
    processUserMessage(input);
  };

  // Funcție pentru a gestiona apăsarea tastei Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Funcție pentru a gestiona recunoașterea vocală
  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) {
      toast({
        title: "Recunoaștere vocală indisponibilă",
        description: "Browserul tău nu suportă recunoașterea vocală.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeechRecognitionActive) {
      speechRecognition.current.stop();
      setIsSpeechRecognitionActive(false);
    } else {
      speechRecognition.current.start();
      setIsSpeechRecognitionActive(true);
      toast({
        title: "Recunoaștere vocală activată",
        description: "Poți vorbi acum. Voi transcrie ce spui.",
        variant: "default",
      });
    }
  };

  // Funcție pentru a gestiona sinteza vocală
  const toggleSpeechSynthesis = () => {
    if (!("speechSynthesis" in window)) {
      toast({
        title: "Sinteză vocală indisponibilă",
        description: "Browserul tău nu suportă sinteza vocală.",
        variant: "destructive",
      });
      return;
    }

    setIsSpeechSynthesisActive(!isSpeechSynthesisActive);
    toast({
      title: isSpeechSynthesisActive
        ? "Sinteză vocală dezactivată"
        : "Sinteză vocală activată",
      description: isSpeechSynthesisActive
        ? "Nu voi mai citi răspunsurile cu voce tare."
        : "Voi citi răspunsurile cu voce tare.",
      variant: "default",
    });
  };

  // Funcție pentru a copia conversația în clipboard
  const copyConversationToClipboard = () => {
    const conversationText = messages
      .map(
        (msg) => `${msg.role === "user" ? "Tu" : "Asistent"}: ${msg.content}`
      )
      .join("\n\n");

    navigator.clipboard
      .writeText(conversationText)
      .then(() => {
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);

        toast({
          title: "Conversație copiată",
          description: "Conversația a fost copiată în clipboard.",
          variant: "default",
        });
      })
      .catch((err) => {
        console.error("Failed to copy conversation:", err);
        toast({
          title: "Eroare",
          description: "Nu am putut copia conversația în clipboard.",
          variant: "destructive",
        });
      });
  };

  // Funcție pentru a șterge conversația
  const clearConversation = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: "Conversația a fost ștearsă. Cu ce te pot ajuta?",
        timestamp: new Date(),
      },
    ]);
  };

  // Funcție pentru a trimite o întrebare predefinită
  const sendPredefinedQuestion = (question: string) => {
    processUserMessage(question);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>Asistent Inventar AI</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSpeechSynthesis}
                    title={
                      isSpeechSynthesisActive
                        ? "Dezactivează sinteza vocală"
                        : "Activează sinteza vocală"
                    }
                  >
                    {isSpeechSynthesisActive ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyConversationToClipboard}
                    title="Copiază conversația"
                  >
                    {copiedToClipboard ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearConversation}
                    title="Șterge conversația"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash-2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </Button>
                </div>
              </div>
              <CardDescription>
                Asistentul tău personal pentru gestionarea inventarului.
                Întreabă-mă orice despre stocuri, materiale sau comenzi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4 max-h-[500px] pr-2">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      } rounded-lg p-3`}
                    >
                      <div className="mr-2 mt-0.5">
                        {message.role === "user" ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        {message.isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Se procesează...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSpeechRecognition}
                  disabled={isProcessing}
                  className={
                    isSpeechRecognitionActive
                      ? "bg-red-100 text-red-600 border-red-300 hover:bg-red-200 hover:text-red-700"
                      : ""
                  }
                >
                  {isSpeechRecognitionActive ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Întreabă ceva despre inventar..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !input.trim()}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-1/4">
          <Tabs defaultValue="examples" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="examples">Exemple</TabsTrigger>
              <TabsTrigger value="help">Ajutor</TabsTrigger>
            </TabsList>
            <TabsContent value="examples" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Întrebări sugerate
                  </CardTitle>
                  <CardDescription>
                    Încearcă aceste exemple pentru a vedea ce pot face
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      sendPredefinedQuestion(
                        "Câte bucăți de ciment mai avem în stoc?"
                      )
                    }
                  >
                    Câte bucăți de ciment mai avem în stoc?
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      sendPredefinedQuestion(
                        "Setează nivelul minim de stoc la 50 pentru cărămizi"
                      )
                    }
                  >
                    Setează nivelul minim de stoc la 50 pentru cărămizi
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      sendPredefinedQuestion(
                        "Generează o listă de reaprovizionare pentru materialele cu stoc scăzut"
                      )
                    }
                  >
                    Generează o listă de reaprovizionare
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      sendPredefinedQuestion(
                        "Care sunt materialele din categoria 'Electrice' cu stoc sub 10 bucăți?"
                      )
                    }
                  >
                    Materiale electrice cu stoc sub 10 bucăți
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() =>
                      sendPredefinedQuestion(
                        "Adaugă 20 de bucăți de parchet laminat în stoc"
                      )
                    }
                  >
                    Adaugă 20 de bucăți de parchet laminat în stoc
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="help" className="flex-grow">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    Cum să folosești asistentul
                  </CardTitle>
                  <CardDescription>
                    Ghid rapid pentru utilizarea asistentului AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-blue-500" />
                      Întrebări despre stoc
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Poți întreba despre cantitățile disponibile, locații,
                      prețuri și detalii despre materiale.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-blue-500" />
                      Actualizări de stoc
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Poți cere asistentului să actualizeze cantități, să seteze
                      niveluri minime/maxime sau să marcheze materiale pentru
                      comandă.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-blue-500" />
                      Generare de rapoarte
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cere asistentului să genereze liste de reaprovizionare,
                      rapoarte de stoc sau analize de utilizare.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <Info className="h-4 w-4 mr-1 text-blue-500" />
                      Comenzi vocale
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Apasă pe butonul de microfon pentru a activa recunoașterea
                      vocală și vorbește natural.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="mr-1">
                      Stoc
                    </Badge>
                    <Badge variant="outline" className="mr-1">
                      Cantitate
                    </Badge>
                    <Badge variant="outline" className="mr-1">
                      Materiale
                    </Badge>
                    <Badge variant="outline" className="mr-1">
                      Reaprovizionare
                    </Badge>
                    <Badge variant="outline" className="mr-1">
                      Raport
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InventoryAssistantPage;
