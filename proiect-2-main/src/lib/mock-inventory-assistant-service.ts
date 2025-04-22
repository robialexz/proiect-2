import { inventoryService } from './inventory-service';
import { SupabaseResponse } from './supabase-service';
import { Material } from '@/types';

// Tipuri pentru răspunsurile asistentului
interface AssistantResponse {
  response: string;
  action?: {
    type: 'query' | 'update' | 'create' | 'delete' | 'export' | 'none';
    table?: string;
    data?: any;
    filters?: Record<string, any>;
    result?: any;
  };
}

/**
 * Serviciu mock pentru asistentul de inventar
 * Simulează răspunsurile asistentului pentru a demonstra funcționalitatea
 */
export const mockInventoryAssistantService = {
  /**
   * Procesează un mesaj de la utilizator și returnează un răspuns
   * @param message - Mesajul utilizatorului
   * @returns Răspunsul asistentului
   */
  async processMessage(message: string): Promise<SupabaseResponse<AssistantResponse>> {
    try {
      // Analizăm mesajul pentru a determina intenția utilizatorului
      const intent = await this.analyzeIntent(message);
      
      // Executăm acțiunea corespunzătoare intenției
      const result = await this.executeAction(intent);
      
      return {
        data: result,
        error: null,
        status: 'success'
      };
    } catch (error) {
      // Removed console statement
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack || '' : '',
          code: 'client_error'
        },
        status: 'error'
      };
    }
  },

  /**
   * Analizează intenția utilizatorului din mesaj
   * @param message - Mesajul utilizatorului
   * @returns Intenția și parametrii extrași
   */
  async analyzeIntent(message: string): Promise<{
    type: 'query' | 'update' | 'create' | 'delete' | 'export' | 'none';
    action: string;
    parameters: Record<string, any>;
    originalMessage: string;
  }> {
    // Implementare simplificată bazată pe cuvinte cheie
    const lowerMessage = message.toLowerCase();
    
    // Verificăm dacă este o întrebare despre stoc
    if (lowerMessage.includes('câte') || lowerMessage.includes('cate') || 
        lowerMessage.includes('stoc') || lowerMessage.includes('disponibil')) {
      
      // Extragem numele materialului
      const materialRegex = /(?:de|pentru|la)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:în|in|din|la|mai|avem|sunt|este|rămân|raman)|$)/i;
      const materialMatch = message.match(materialRegex);
      const material = materialMatch ? materialMatch[1].trim() : '';
      
      return {
        type: 'query',
        action: 'getStock',
        parameters: { material },
        originalMessage: message
      };
    }
    
    // Verificăm dacă este o cerere de setare nivel minim
    if (lowerMessage.includes('setează') || lowerMessage.includes('seteaza') || 
        lowerMessage.includes('nivel minim') || lowerMessage.includes('min_stock_level')) {
      
      // Extragem nivelul și materialul
      const levelRegex = /nivel(?:\s+minim)?\s+(?:de\s+)?(?:stoc\s+)?(?:la\s+)?(\d+)/i;
      const levelMatch = message.match(levelRegex);
      const level = levelMatch ? parseInt(levelMatch[1]) : 0;
      
      const materialRegex = /pentru\s+([a-zA-Z0-9\s]+?)(?:\s+|$)/i;
      const materialMatch = message.match(materialRegex);
      const material = materialMatch ? materialMatch[1].trim() : '';
      
      return {
        type: 'update',
        action: 'setMinStockLevel',
        parameters: { material, level },
        originalMessage: message
      };
    }
    
    // Verificăm dacă este o cerere de generare listă reaprovizionare
    if (lowerMessage.includes('generează') || lowerMessage.includes('genereaza') || 
        lowerMessage.includes('listă') || lowerMessage.includes('lista') || 
        lowerMessage.includes('reaprovizionare') || lowerMessage.includes('comandă') || 
        lowerMessage.includes('comanda')) {
      
      return {
        type: 'query',
        action: 'generateReorderList',
        parameters: {},
        originalMessage: message
      };
    }
    
    // Verificăm dacă este o cerere de adăugare stoc
    if (lowerMessage.includes('adaugă') || lowerMessage.includes('adauga') || 
        lowerMessage.includes('crește') || lowerMessage.includes('creste') || 
        lowerMessage.includes('mărește') || lowerMessage.includes('mareste')) {
      
      // Extragem cantitatea și materialul
      const quantityRegex = /(\d+)(?:\s+(?:de\s+)?(?:bucăți|bucati|buc|unități|unitati|kg|litri|l|metri|m|tone|t))?/i;
      const quantityMatch = message.match(quantityRegex);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 0;
      
      const materialRegex = /(?:de|pentru|la)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:în|in|din|la|stoc)|$)/i;
      const materialMatch = message.match(materialRegex);
      const material = materialMatch ? materialMatch[1].trim() : '';
      
      return {
        type: 'update',
        action: 'addStock',
        parameters: { material, quantity },
        originalMessage: message
      };
    }
    
    // Dacă nu am identificat o intenție clară
    return {
      type: 'none',
      action: 'unknown',
      parameters: {},
      originalMessage: message
    };
  },

  /**
   * Execută acțiunea corespunzătoare intenției
   * @param intent - Intenția și parametrii
   * @returns Răspunsul asistentului
   */
  async executeAction(intent: {
    type: 'query' | 'update' | 'create' | 'delete' | 'export' | 'none';
    action: string;
    parameters: Record<string, any>;
    originalMessage: string;
  }): Promise<AssistantResponse> {
    // Simulăm un delay pentru a face interacțiunea mai realistă
    try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Handle error appropriately
    }
    
    switch (intent.action) {
      case 'getStock':
        return this.handleGetStock(intent.parameters.material);
        
      case 'setMinStockLevel':
        return this.handleSetMinStockLevel(intent.parameters.material, intent.parameters.level);
        
      case 'generateReorderList':
        return this.handleGenerateReorderList();
        
      case 'addStock':
        return this.handleAddStock(intent.parameters.material, intent.parameters.quantity);
        
      default:
        // Răspuns generic pentru întrebări necunoscute
        return {
          response: `Nu am înțeles exact ce dorești să faci. Poți să reformulezi întrebarea sau să încerci una dintre comenzile sugerate?`,
          action: {
            type: 'none'
          }
        };
    }
  },

  /**
   * Gestionează întrebări despre stoc
   * @param materialName - Numele materialului
   * @returns Răspunsul asistentului
   */
  async handleGetStock(materialName: string): Promise<AssistantResponse> {
    if (!materialName) {
      return {
        response: `Nu am înțeles pentru ce material dorești să verifici stocul. Poți să specifici numele materialului?`,
        action: {
          type: 'none'
        }
      };
    }
    
    // Simulăm date pentru materiale
    const mockMaterials = [
      { id: '1', name: 'Ciment', quantity: 150, unit: 'kg', min_stock_level: 100, location: 'Depozit A' },
      { id: '2', name: 'Cărămizi', quantity: 500, unit: 'buc', min_stock_level: 200, location: 'Depozit B' },
      { id: '3', name: 'Parchet laminat', quantity: 75, unit: 'm²', min_stock_level: 50, location: 'Depozit C' },
      { id: '4', name: 'Vopsea lavabilă', quantity: 30, unit: 'l', min_stock_level: 20, location: 'Depozit A' },
      { id: '5', name: 'Gresie', quantity: 120, unit: 'm²', min_stock_level: 80, location: 'Depozit B' },
    ];
    
    // Căutăm materialul în datele mock
    const exactMatch = mockMaterials.find(m => 
      m.name.toLowerCase() === materialName.toLowerCase()
    );
    
    const partialMatches = mockMaterials.filter(m => 
      m.name.toLowerCase().includes(materialName.toLowerCase())
    );
    
    if (exactMatch) {
      // Avem o potrivire exactă
      return {
        response: `În prezent avem ${exactMatch.quantity} ${exactMatch.unit} de ${exactMatch.name} în stoc. Nivelul minim de stoc este setat la ${exactMatch.min_stock_level} ${exactMatch.unit}. Materialul se află în locația: ${exactMatch.location}.`,
        action: {
          type: 'query',
          result: exactMatch
        }
      };
    } else if (partialMatches.length === 1) {
      // Avem o singură potrivire, dar nu exactă
      const material = partialMatches[0];
      return {
        response: `Am găsit ${material.name} în stoc. Avem ${material.quantity} ${material.unit} disponibile. Nivelul minim de stoc este setat la ${material.min_stock_level} ${material.unit}. Materialul se află în locația: ${material.location}.`,
        action: {
          type: 'query',
          result: material
        }
      };
    } else if (partialMatches.length > 1) {
      // Avem mai multe potriviri
      const materialsList = partialMatches.map(m => 
        `- ${m.name}: ${m.quantity} ${m.unit}`
      ).join('\n');
      
      return {
        response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}\n\nPoți să specifici exact numele materialului pentru care dorești informații?`,
        action: {
          type: 'query',
          result: partialMatches
        }
      };
    } else {
      // Nu am găsit niciun material
      return {
        response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
        action: {
          type: 'query',
          result: null
        }
      };
    }
  },

  /**
   * Gestionează setarea nivelului minim de stoc
   * @param materialName - Numele materialului
   * @param level - Nivelul minim de stoc
   * @returns Răspunsul asistentului
   */
  async handleSetMinStockLevel(materialName: string, level: number): Promise<AssistantResponse> {
    if (!materialName) {
      return {
        response: `Nu am înțeles pentru ce material dorești să setezi nivelul minim de stoc. Poți să specifici numele materialului?`,
        action: {
          type: 'none'
        }
      };
    }
    
    if (!level || level < 0) {
      return {
        response: `Nu am înțeles la ce nivel dorești să setezi stocul minim. Te rog să specifici un număr valid.`,
        action: {
          type: 'none'
        }
      };
    }
    
    // Simulăm date pentru materiale
    const mockMaterials = [
      { id: '1', name: 'Ciment', quantity: 150, unit: 'kg', min_stock_level: 100, location: 'Depozit A' },
      { id: '2', name: 'Cărămizi', quantity: 500, unit: 'buc', min_stock_level: 200, location: 'Depozit B' },
      { id: '3', name: 'Parchet laminat', quantity: 75, unit: 'm²', min_stock_level: 50, location: 'Depozit C' },
      { id: '4', name: 'Vopsea lavabilă', quantity: 30, unit: 'l', min_stock_level: 20, location: 'Depozit A' },
      { id: '5', name: 'Gresie', quantity: 120, unit: 'm²', min_stock_level: 80, location: 'Depozit B' },
    ];
    
    // Căutăm materialul în datele mock
    const exactMatch = mockMaterials.find(m => 
      m.name.toLowerCase() === materialName.toLowerCase()
    );
    
    const partialMatches = mockMaterials.filter(m => 
      m.name.toLowerCase().includes(materialName.toLowerCase())
    );
    
    if (exactMatch) {
      // Simulăm actualizarea nivelului minim de stoc
      const updatedMaterial = { ...exactMatch, min_stock_level: level };
      
      return {
        response: `Am setat nivelul minim de stoc pentru ${updatedMaterial.name} la ${level} ${updatedMaterial.unit}.${
          updatedMaterial.quantity < level
            ? ` Atenție: stocul actual (${updatedMaterial.quantity} ${updatedMaterial.unit}) este sub nivelul minim setat!`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { min_stock_level: level },
          filters: { id: updatedMaterial.id },
          result: updatedMaterial
        }
      };
    } else if (partialMatches.length === 1) {
      // Simulăm actualizarea nivelului minim de stoc
      const material = partialMatches[0];
      const updatedMaterial = { ...material, min_stock_level: level };
      
      return {
        response: `Am setat nivelul minim de stoc pentru ${updatedMaterial.name} la ${level} ${updatedMaterial.unit}.${
          updatedMaterial.quantity < level
            ? ` Atenție: stocul actual (${updatedMaterial.quantity} ${updatedMaterial.unit}) este sub nivelul minim setat!`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { min_stock_level: level },
          filters: { id: updatedMaterial.id },
          result: updatedMaterial
        }
      };
    } else if (partialMatches.length > 1) {
      // Avem mai multe potriviri
      const materialsList = partialMatches.map(m => 
        `- ${m.name}`
      ).join('\n');
      
      return {
        response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}\n\nPoți să specifici exact numele materialului pentru care dorești să setezi nivelul minim de stoc?`,
        action: {
          type: 'query',
          result: partialMatches
        }
      };
    } else {
      // Nu am găsit niciun material
      return {
        response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
        action: {
          type: 'query',
          result: null
        }
      };
    }
  },

  /**
   * Gestionează generarea listei de reaprovizionare
   * @returns Răspunsul asistentului
   */
  async handleGenerateReorderList(): Promise<AssistantResponse> {
    // Simulăm date pentru materiale cu stoc scăzut
    const mockLowStockItems = [
      { id: '3', name: 'Parchet laminat', quantity: 45, unit: 'm²', min_stock_level: 50, deficit: 5, reorderQuantity: 10 },
      { id: '4', name: 'Vopsea lavabilă', quantity: 15, unit: 'l', min_stock_level: 20, deficit: 5, reorderQuantity: 10 },
      { id: '6', name: 'Cuie', quantity: 2, unit: 'kg', min_stock_level: 5, deficit: 3, reorderQuantity: 5 },
      { id: '7', name: 'Adeziv gresie', quantity: 10, unit: 'kg', min_stock_level: 25, deficit: 15, reorderQuantity: 20 },
      { id: '8', name: 'Cablu electric', quantity: 30, unit: 'm', min_stock_level: 50, deficit: 20, reorderQuantity: 25 },
    ];
    
    // Construim lista de reaprovizionare
    const itemsList = mockLowStockItems.map(item => 
      `- ${item.name}: stoc actual ${item.quantity} ${item.unit}, minim ${item.min_stock_level} ${item.unit}, deficit ${item.deficit} ${item.unit}, cantitate recomandată de comandat: ${item.reorderQuantity} ${item.unit}`
    ).join('\n');
    
    return {
      response: `Am generat lista de reaprovizionare. Iată materialele care necesită reaprovizionare:\n\n${itemsList}\n\nDorești să export această listă în format CSV?`,
      action: {
        type: 'query',
        result: mockLowStockItems
      }
    };
  },

  /**
   * Gestionează adăugarea de stoc
   * @param materialName - Numele materialului
   * @param quantity - Cantitatea de adăugat
   * @returns Răspunsul asistentului
   */
  async handleAddStock(materialName: string, quantity: number): Promise<AssistantResponse> {
    if (!materialName) {
      return {
        response: `Nu am înțeles pentru ce material dorești să adaugi stoc. Poți să specifici numele materialului?`,
        action: {
          type: 'none'
        }
      };
    }
    
    if (!quantity || quantity <= 0) {
      return {
        response: `Nu am înțeles ce cantitate dorești să adaugi. Te rog să specifici un număr valid.`,
        action: {
          type: 'none'
        }
      };
    }
    
    // Simulăm date pentru materiale
    const mockMaterials = [
      { id: '1', name: 'Ciment', quantity: 150, unit: 'kg', min_stock_level: 100, location: 'Depozit A' },
      { id: '2', name: 'Cărămizi', quantity: 500, unit: 'buc', min_stock_level: 200, location: 'Depozit B' },
      { id: '3', name: 'Parchet laminat', quantity: 75, unit: 'm²', min_stock_level: 50, location: 'Depozit C' },
      { id: '4', name: 'Vopsea lavabilă', quantity: 30, unit: 'l', min_stock_level: 20, location: 'Depozit A' },
      { id: '5', name: 'Gresie', quantity: 120, unit: 'm²', min_stock_level: 80, location: 'Depozit B' },
    ];
    
    // Căutăm materialul în datele mock
    const exactMatch = mockMaterials.find(m => 
      m.name.toLowerCase() === materialName.toLowerCase()
    );
    
    const partialMatches = mockMaterials.filter(m => 
      m.name.toLowerCase().includes(materialName.toLowerCase())
    );
    
    if (exactMatch) {
      // Simulăm adăugarea stocului
      const newQuantity = exactMatch.quantity + quantity;
      const updatedMaterial = { ...exactMatch, quantity: newQuantity };
      
      return {
        response: `Am adăugat ${quantity} ${updatedMaterial.unit} de ${updatedMaterial.name} în stoc. Noul stoc este de ${newQuantity} ${updatedMaterial.unit}.${
          updatedMaterial.min_stock_level && newQuantity < updatedMaterial.min_stock_level
            ? ` Atenție: stocul este încă sub nivelul minim de ${updatedMaterial.min_stock_level} ${updatedMaterial.unit}!`
            : updatedMaterial.min_stock_level && newQuantity >= updatedMaterial.min_stock_level && exactMatch.quantity < updatedMaterial.min_stock_level
            ? ` Stocul este acum peste nivelul minim de ${updatedMaterial.min_stock_level} ${updatedMaterial.unit}.`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { quantity: newQuantity },
          filters: { id: updatedMaterial.id },
          result: updatedMaterial
        }
      };
    } else if (partialMatches.length === 1) {
      // Simulăm adăugarea stocului
      const material = partialMatches[0];
      const newQuantity = material.quantity + quantity;
      const updatedMaterial = { ...material, quantity: newQuantity };
      
      return {
        response: `Am adăugat ${quantity} ${updatedMaterial.unit} de ${updatedMaterial.name} în stoc. Noul stoc este de ${newQuantity} ${updatedMaterial.unit}.${
          updatedMaterial.min_stock_level && newQuantity < updatedMaterial.min_stock_level
            ? ` Atenție: stocul este încă sub nivelul minim de ${updatedMaterial.min_stock_level} ${updatedMaterial.unit}!`
            : updatedMaterial.min_stock_level && newQuantity >= updatedMaterial.min_stock_level && material.quantity < updatedMaterial.min_stock_level
            ? ` Stocul este acum peste nivelul minim de ${updatedMaterial.min_stock_level} ${updatedMaterial.unit}.`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { quantity: newQuantity },
          filters: { id: updatedMaterial.id },
          result: updatedMaterial
        }
      };
    } else if (partialMatches.length > 1) {
      // Avem mai multe potriviri
      const materialsList = partialMatches.map(m => 
        `- ${m.name}`
      ).join('\n');
      
      return {
        response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}\n\nPoți să specifici exact numele materialului pentru care dorești să adaugi stoc?`,
        action: {
          type: 'query',
          result: partialMatches
        }
      };
    } else {
      // Nu am găsit niciun material
      return {
        response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
        action: {
          type: 'query',
          result: null
        }
      };
    }
  }
};

export default mockInventoryAssistantService;
