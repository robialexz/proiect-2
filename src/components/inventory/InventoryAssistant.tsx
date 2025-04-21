import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Sparkles, X } from 'lucide-react';
import { Material } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InventoryAssistantProps {
  materials: Material[];
  onAddMaterial: () => void;
  onGenerateReorderList: () => Promise<{ success: boolean; data?: Material[] }>;
}

// Simulăm un API de AI
const simulateAIResponse = async (
  query: string,
  materials: Material[],
  t: (key: string, defaultValue: string) => string
): Promise<string> => {
  // Simulăm un timp de răspuns
  try {
  await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    // Handle error appropriately
  }

  // Răspunsuri predefinite bazate pe cuvinte cheie
  const lowStockItems = materials.filter(
    m => m.min_stock_level !== undefined &&
         m.min_stock_level !== null &&
         m.quantity < m.min_stock_level
  );

  if (query.toLowerCase().includes('stoc') && query.toLowerCase().includes('scăzut')) {
    if (lowStockItems.length === 0) {
      return t('inventory.assistant.responses.noLowStock', 'Nu există materiale cu stoc scăzut în acest moment.');
    }

    return `Am identificat ${lowStockItems.length} materiale cu stoc scăzut:\n\n${
      lowStockItems.map(item => `- ${item.name}: ${item.quantity} ${item.unit} (minim: ${item.min_stock_level} ${item.unit})`).join('\n')
    }`;
  }

  if (query.toLowerCase().includes('recomandă') || query.toLowerCase().includes('sugerează')) {
    if (lowStockItems.length === 0) {
      return t('inventory.assistant.responses.noRecommendations', 'Nu am recomandări în acest moment, toate stocurile sunt la niveluri optime.');
    }

    return `Recomand să reaprovizionați următoarele materiale:\n\n${
      lowStockItems.map(item => {
        const reorderAmount = (item.max_stock_level || item.min_stock_level! * 2) - item.quantity;
        return `- ${item.name}: comandați ${reorderAmount} ${item.unit} pentru a ajunge la nivelul optim`;
      }).join('\n')
    }`;
  }

  if (query.toLowerCase().includes('statistici') || query.toLowerCase().includes('raport')) {
    const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)));
    const totalValue = materials.reduce((sum, item) => {
      return sum + (item.quantity * (item.cost_per_unit || 0));
    }, 0);

    return `Statistici inventar:\n\n` +
           `- Total materiale: ${materials.length}\n` +
           `- Categorii: ${categories.length}\n` +
           `- Materiale cu stoc scăzut: ${lowStockItems.length}\n` +
           `- Valoare totală inventar: ${new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalValue)}`;
  }

  if (query.toLowerCase().includes('caută') || query.toLowerCase().includes('găsește')) {
    const searchTerm = query.toLowerCase().split(/caută|găsește/)[1].trim();
    const results = materials.filter(m =>
      m.name.toLowerCase().includes(searchTerm) ||
      (m.category && m.category.toLowerCase().includes(searchTerm)) ||
      (m.description && m.description.toLowerCase().includes(searchTerm))
    );

    if (results.length === 0) {
      return t('inventory.assistant.responses.noResults', 'Nu am găsit materiale care să conțină "{search}".').replace('{search}', searchTerm);
    }

    return `Am găsit ${results.length} materiale pentru "${searchTerm}":\n\n${
      results.slice(0, 5).map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')
    }${results.length > 5 ? `\n\n...și încă ${results.length - 5} materiale.` : ''}`;
  }

  // Răspuns implicit
  return t('inventory.assistant.responses.default', 'Pot să te ajut cu informații despre inventar, să caut materiale, să verific stocurile scăzute sau să îți ofer recomandări de reaprovizionare. Ce dorești să afli?');
};

const InventoryAssistant: React.FC<InventoryAssistantProps> = ({
  materials,
  onAddMaterial,
  onGenerateReorderList
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('inventory.assistant.welcome', 'Bună! Sunt asistentul tău pentru inventar. Cum te pot ajuta astăzi?'),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funcție pentru a derula la ultimul mesaj
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Derulăm la ultimul mesaj când se adaugă un mesaj nou
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Funcție pentru a trimite un mesaj
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Adăugăm mesajul utilizatorului
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Procesăm comenzi speciale
      if (input.toLowerCase().includes('/adaugă')) {
        onAddMaterial();

        // Adăugăm răspunsul asistentului
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('inventory.assistant.responses.addMaterial', 'Am deschis dialogul pentru adăugarea unui material nou.'),
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
      else if (input.toLowerCase().includes('/reaprovizionare')) {
        try {
        const result = await onGenerateReorderList();
        } catch (error) {
          // Handle error appropriately
        }

        let responseContent = t('inventory.assistant.responses.error', 'Nu am putut genera lista de reaprovizionare.');

        if (result.success && result.data) {
          if (result.data.length === 0) {
            responseContent = t('inventory.assistant.responses.noReorderNeeded', 'Nu există materiale care necesită reaprovizionare în acest moment.');
          } else {
            responseContent = `Am generat lista de reaprovizionare cu ${result.data.length} materiale:\n\n${
              result.data.slice(0, 5).map(item => {
                const reorderAmount = (item.max_stock_level || item.min_stock_level! * 2) - item.quantity;
                return `- ${item.name}: ${reorderAmount} ${item.unit}`;
              }).join('\n')
            }${result.data.length > 5 ? `\n\n...și încă ${result.data.length - 5} materiale.` : ''}`;
          }
        }

        // Adăugăm răspunsul asistentului
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
      else {
        // Obținem răspunsul de la AI
        try {
        const aiResponse = await simulateAIResponse(input, materials, t);
        } catch (error) {
          // Handle error appropriately
        }

        // Adăugăm răspunsul asistentului
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      // Removed console statement

      // Adăugăm un mesaj de eroare
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('inventory.assistant.responses.error', 'Îmi pare rău, am întâmpinat o eroare în procesarea cererii tale. Te rog să încerci din nou.'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Funcție pentru a gestiona apăsarea tastei Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-assistant.png" alt="AI" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{t('inventory.assistant.title', 'Asistent Inventar')}</CardTitle>
              <CardDescription className="text-xs">{t('inventory.assistant.poweredBy', 'Powered by AI')}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-4">
          <div className="space-y-4 pt-2 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage src="/ai-assistant.png" alt="AI" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage src="/user-avatar.png" alt="User" />
                      <AvatarFallback className="bg-muted">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="/ai-assistant.png" alt="AI" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 text-sm bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('inventory.assistant.thinking', 'Se gândește...')}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 pt-0">
        <div className="relative w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inventory.assistant.placeholder', 'Întreabă ceva despre inventar...')}
            className="min-h-10 resize-none pr-10"
            rows={1}
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1 text-xs">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput('Arată materialele cu stoc scăzut')}>
            {t('inventory.assistant.suggestions.lowStock', 'Stoc scăzut')}
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput('Recomandă reaprovizionare')}>
            {t('inventory.assistant.suggestions.recommendations', 'Recomandări')}
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput('Statistici inventar')}>
            {t('inventory.assistant.suggestions.statistics', 'Statistici')}
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput('/adaugă')}>
            {t('inventory.assistant.suggestions.addMaterial', 'Adaugă material')}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default InventoryAssistant;
