import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { inventoryAssistantService } from "@/lib/inventory-assistant-service";
import { cacheService } from "@/lib/cache-service";

// Tipuri pentru mesaje
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// Tipuri pentru context
interface AIContext {
  page?: string;
  projectId?: string;
  supplierId?: string;
  materialId?: string;
  userId?: string;
  userRole?: string;
  recentActions?: string[];
}

/**
 * Hook pentru utilizarea serviciului AI
 * @returns Funcții pentru interacțiunea cu AI
 */
export const useAIService = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AIContext>({});
  const [history, setHistory] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Funcție pentru a actualiza contextul
  const updateContext = useCallback((newContext: Partial<AIContext>) => {
    setContext((prevContext) => ({
      ...prevContext,
      ...newContext,
    }));
  }, []);

  // Funcție pentru a genera un răspuns de la AI
  const generateResponse = useCallback(
    async (
      message: string,
      conversationHistory: Message[] = []
    ): Promise<string> => {
      setIsLoading(true);

      try {
        // Verificăm dacă avem un răspuns în cache
        const cacheKey = `ai_response_${message.toLowerCase().trim()}`;
        const cachedResponse = cacheService.get<string>(cacheKey, {
          namespace: "ai_responses",
        });

        if (cachedResponse) {
          return cachedResponse;
        }

        // Construim contextul pentru AI
        const aiContext = {
          ...context,
          userId: user?.id,
          userRole: user?.role || "user",
          timestamp: new Date().toISOString(),
          language: localStorage.getItem("i18nextLng") || "ro",
          conversationHistory: conversationHistory
            .slice(-10)
            .map((msg) => ({ role: msg.role, content: msg.content })),
        };

        // Verificăm dacă mesajul este legat de inventar
        if (
          message.toLowerCase().includes("inventar") ||
          message.toLowerCase().includes("stoc") ||
          message.toLowerCase().includes("materiale") ||
          context.page?.includes("inventory")
        ) {
          const inventoryResponse =
            await inventoryAssistantService.processMessage(message);

          if (inventoryResponse.data) {
            // Salvăm răspunsul în cache
            cacheService.set(cacheKey, inventoryResponse.data.response, {
              namespace: "ai_responses",
              expireIn: 30 * 60 * 1000, // 30 minute
            });

            return inventoryResponse.data.response;
          }
        }

        // Implementăm logica pentru diferite tipuri de întrebări
        const lowerMessage = message.toLowerCase();

        // Întrebări despre proiecte
        if (
          lowerMessage.includes("proiect") ||
          lowerMessage.includes("proiecte") ||
          context.page?.includes("project")
        ) {
          try {
            // Obținem date despre proiecte din Supabase
            const { data: projects, error } = await supabase
              .from("projects")
              .select("id, name, status, start_date, end_date")
              .limit(5);

            if (error) throw error;

            const response = `Iată informații despre proiectele recente: ${projects
              .map(
                (p) =>
                  `${p.name} (${p.status}) - de la ${new Date(
                    p.start_date
                  ).toLocaleDateString()} până la ${new Date(
                    p.end_date
                  ).toLocaleDateString()}`
              )
              .join(", ")}. Cu ce te pot ajuta în legătură cu aceste proiecte?`;

            // Salvăm răspunsul în cache
            cacheService.set(cacheKey, response, {
              namespace: "ai_responses",
              expireIn: 5 * 60 * 1000, // 5 minute
            });

            return response;
          } catch (error) {
            console.error("Error fetching projects:", error);
          }
        }

        // Întrebări despre furnizori
        if (
          lowerMessage.includes("furnizor") ||
          lowerMessage.includes("furnizori") ||
          context.page?.includes("supplier")
        ) {
          try {
            // Obținem date despre furnizori din Supabase
            const { data: suppliers, error } = await supabase
              .from("suppliers")
              .select("id, name, status, category")
              .limit(5);

            if (error) throw error;

            const response = `Iată informații despre furnizorii recenți: ${suppliers
              .map((s) => `${s.name} (${s.category}) - ${s.status}`)
              .join(
                ", "
              )}. Cu ce te pot ajuta în legătură cu acești furnizori?`;

            // Salvăm răspunsul în cache
            cacheService.set(cacheKey, response, {
              namespace: "ai_responses",
              expireIn: 5 * 60 * 1000, // 5 minute
            });

            return response;
          } catch (error) {
            console.error("Error fetching suppliers:", error);
          }
        }

        // Întrebări despre utilizarea platformei
        if (
          lowerMessage.includes("ajutor") ||
          lowerMessage.includes("cum") ||
          lowerMessage.includes("folosesc") ||
          lowerMessage.includes("tutorial")
        ) {
          const response = `Platforma noastră oferă funcționalități pentru gestionarea inventarului, proiectelor și materialelor. Poți naviga folosind meniul din stânga. Pentru acțiuni specifice pe fiecare pagină, caută butoanele de acțiune din partea de sus a paginii. Ai nevoie de ajutor cu o funcționalitate anume?`;

          // Salvăm răspunsul în cache
          cacheService.set(cacheKey, response, {
            namespace: "ai_responses",
            expireIn: 24 * 60 * 60 * 1000, // 24 ore
          });

          return response;
        }

        // Întrebări despre rapoarte
        if (
          lowerMessage.includes("raport") ||
          lowerMessage.includes("rapoarte") ||
          lowerMessage.includes("statistici") ||
          context.page?.includes("report")
        ) {
          const response = `Poți genera diverse rapoarte din secțiunea Rapoarte. Avem rapoarte pentru inventar, proiecte, furnizori și comenzi. Poți filtra datele după diverse criterii și exporta rezultatele în format Excel sau PDF. Ce tip de raport dorești să generezi?`;

          // Salvăm răspunsul în cache
          cacheService.set(cacheKey, response, {
            namespace: "ai_responses",
            expireIn: 24 * 60 * 60 * 1000, // 24 ore
          });

          return response;
        }

        // Răspuns implicit cu sugestii
        const defaultResponse = `Sunt asistentul tău AI! Pot să te ajut cu informații despre inventar, proiecte, materiale, furnizori, rapoarte sau utilizarea platformei. Ce întrebare ai?`;

        // Salvăm răspunsul în cache
        cacheService.set(cacheKey, defaultResponse, {
          namespace: "ai_responses",
          expireIn: 24 * 60 * 60 * 1000, // 24 ore
        });

        return defaultResponse;
      } catch (error) {
        console.error("Error generating AI response:", error);
        return t(
          "ai.error",
          "Îmi pare rău, am întâmpinat o problemă în procesarea cererii dumneavoastră. Vă rugăm să încercați din nou."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [context, supabase, t, user]
  );

  // Funcție pentru a genera sugestii bazate pe context
  const generateSuggestions = useCallback(async (): Promise<string[]> => {
    try {
      // Generăm sugestii bazate pe pagina curentă
      if (context.page?.includes("inventory")) {
        return [
          "Câte materiale avem în stoc?",
          "Care sunt materialele cu stoc scăzut?",
          "Cum adaug un material nou?",
        ];
      }

      if (context.page?.includes("project")) {
        return [
          "Arată-mi proiectele active",
          "Cum creez un proiect nou?",
          "Care sunt materialele alocate proiectului curent?",
        ];
      }

      if (context.page?.includes("supplier")) {
        return [
          "Arată-mi furnizorii activi",
          "Cum adaug un furnizor nou?",
          "Care sunt comenzile recente?",
        ];
      }

      // Sugestii implicite
      return [
        "Cum folosesc această platformă?",
        "Arată-mi inventarul",
        "Generează un raport",
      ];
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return [];
    }
  }, [context]);

  // Actualizăm sugestiile când se schimbă contextul
  useEffect(() => {
    const updateSuggestions = async () => {
      const newSuggestions = await generateSuggestions();
      setSuggestions(newSuggestions);
    };

    updateSuggestions();
  }, [context, generateSuggestions]);

  // Funcție pentru a salva conversația în istoric
  const saveConversation = useCallback(
    async (messages: Message[]) => {
      if (!user) return;

      try {
        // Salvăm conversația în Supabase
        await supabase.from("ai_conversations").insert({
          user_id: user.id,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          context: context,
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error saving conversation:", error);
      }
    },
    [context, supabase, user]
  );

  // Funcție pentru a analiza sentimentul mesajului
  const analyzeSentiment = useCallback(
    async (message: string): Promise<"positive" | "negative" | "neutral"> => {
      // Implementare simplificată pentru demonstrație
      const lowerMessage = message.toLowerCase();

      // Cuvinte pozitive
      const positiveWords = [
        "mulțumesc",
        "bun",
        "excelent",
        "perfect",
        "minunat",
        "super",
        "grozav",
        "ajutor",
        "util",
      ];

      // Cuvinte negative
      const negativeWords = [
        "prost",
        "rău",
        "greșit",
        "eroare",
        "problemă",
        "nu funcționează",
        "bug",
        "defect",
      ];

      // Numărăm cuvintele pozitive și negative
      const positiveCount = positiveWords.filter((word) =>
        lowerMessage.includes(word)
      ).length;
      const negativeCount = negativeWords.filter((word) =>
        lowerMessage.includes(word)
      ).length;

      // Determinăm sentimentul
      if (positiveCount > negativeCount) {
        return "positive";
      } else if (negativeCount > positiveCount) {
        return "negative";
      } else {
        return "neutral";
      }
    },
    []
  );

  return {
    generateResponse,
    updateContext,
    context,
    isLoading,
    suggestions,
    saveConversation,
    analyzeSentiment,
  };
};
