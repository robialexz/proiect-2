import { inventoryService } from './inventory-service';
import { enhancedSupabaseService } from './enhanced-supabase-service';
import { errorHandler } from './error-handler';
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
 * Serviciu pentru asistentul de inventar bazat pe AI
 * Procesează întrebări în limbaj natural și le transformă în acțiuni pe baza de date
 */
export const inventoryAssistantService = {
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
      errorHandler.handleError(error, false);
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
    // În implementarea reală, aici am folosi un model de limbaj (OpenAI API)
    // pentru a analiza mesajul și a extrage intenția și parametrii
    
    // Pentru demo, vom folosi o implementare simplificată bazată pe regex
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
        // În implementarea reală, aici am folosi un model de limbaj (OpenAI API)
        // pentru a genera un răspuns pentru întrebări necunoscute
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
    
    try {
      // Căutăm materialul în baza de date
      const { data: materials } = await inventoryService.getItems({
        searchTerm: materialName
      });
      
      if (!materials || materials.length === 0) {
        return {
          response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
          action: {
            type: 'query',
            result: null
          }
        };
      }
      
      // Verificăm dacă avem o potrivire exactă
      const exactMatch = materials.find(m => 
        m.name.toLowerCase() === materialName.toLowerCase()
      );
      
      if (exactMatch) {
        // Avem o potrivire exactă
        return {
          response: `În prezent avem ${exactMatch.quantity} ${exactMatch.unit || 'bucăți'} de ${exactMatch.name} în stoc.${
            exactMatch.min_stock_level 
              ? ` Nivelul minim de stoc este setat la ${exactMatch.min_stock_level} ${exactMatch.unit || 'bucăți'}.` 
              : ''
          }${
            exactMatch.location 
              ? ` Materialul se află în locația: ${exactMatch.location}.` 
              : ''
          }`,
          action: {
            type: 'query',
            result: exactMatch
          }
        };
      } else if (materials.length === 1) {
        // Avem o singură potrivire, dar nu exactă
        const material = materials[0];
        return {
          response: `Am găsit ${material.name} în stoc. Avem ${material.quantity} ${material.unit || 'bucăți'} disponibile.${
            material.min_stock_level 
              ? ` Nivelul minim de stoc este setat la ${material.min_stock_level} ${material.unit || 'bucăți'}.` 
              : ''
          }${
            material.location 
              ? ` Materialul se află în locația: ${material.location}.` 
              : ''
          }`,
          action: {
            type: 'query',
            result: material
          }
        };
      } else {
        // Avem mai multe potriviri
        const materialsList = materials.slice(0, 5).map(m => 
          `- ${m.name}: ${m.quantity} ${m.unit || 'bucăți'}`
        ).join('\n');
        
        return {
          response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}${
            materials.length > 5 ? '\n\n...și alte ' + (materials.length - 5) + ' materiale.' : ''
          }\n\nPoți să specifici exact numele materialului pentru care dorești informații?`,
          action: {
            type: 'query',
            result: materials
          }
        };
      }
    } catch (error) {
      console.error('Error getting stock:', error);
      return {
        response: `A apărut o eroare în timpul verificării stocului. Te rog să încerci din nou mai târziu.`,
        action: {
          type: 'none'
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
    
    try {
      // Căutăm materialul în baza de date
      const { data: materials } = await inventoryService.getItems({
        searchTerm: materialName
      });
      
      if (!materials || materials.length === 0) {
        return {
          response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
          action: {
            type: 'query',
            result: null
          }
        };
      }
      
      // Verificăm dacă avem o potrivire exactă
      const exactMatch = materials.find(m => 
        m.name.toLowerCase() === materialName.toLowerCase()
      );
      
      let materialToUpdate: Material;
      
      if (exactMatch) {
        materialToUpdate = exactMatch;
      } else if (materials.length === 1) {
        materialToUpdate = materials[0];
      } else {
        // Avem mai multe potriviri
        const materialsList = materials.slice(0, 5).map(m => 
          `- ${m.name}`
        ).join('\n');
        
        return {
          response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}${
            materials.length > 5 ? '\n\n...și alte ' + (materials.length - 5) + ' materiale.' : ''
          }\n\nPoți să specifici exact numele materialului pentru care dorești să setezi nivelul minim de stoc?`,
          action: {
            type: 'query',
            result: materials
          }
        };
      }
      
      // Actualizăm nivelul minim de stoc
      const { data: updatedMaterial, error } = await inventoryService.updateItem(
        materialToUpdate.id,
        { min_stock_level: level }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        response: `Am setat nivelul minim de stoc pentru ${materialToUpdate.name} la ${level} ${materialToUpdate.unit || 'bucăți'}.${
          materialToUpdate.quantity < level
            ? ` Atenție: stocul actual (${materialToUpdate.quantity} ${materialToUpdate.unit || 'bucăți'}) este sub nivelul minim setat!`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { min_stock_level: level },
          filters: { id: materialToUpdate.id },
          result: updatedMaterial
        }
      };
    } catch (error) {
      console.error('Error setting min stock level:', error);
      return {
        response: `A apărut o eroare în timpul setării nivelului minim de stoc. Te rog să încerci din nou mai târziu.`,
        action: {
          type: 'none'
        }
      };
    }
  },

  /**
   * Gestionează generarea listei de reaprovizionare
   * @returns Răspunsul asistentului
   */
  async handleGenerateReorderList(): Promise<AssistantResponse> {
    try {
      // Obținem materialele cu stoc scăzut
      const { data: lowStockItems, error } = await inventoryService.getLowStockItems();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!lowStockItems || lowStockItems.length === 0) {
        return {
          response: `Nu am găsit materiale cu stoc sub nivelul minim. Toate stocurile sunt la niveluri adecvate.`,
          action: {
            type: 'query',
            result: []
          }
        };
      }
      
      // Construim lista de reaprovizionare
      const reorderList = lowStockItems.map(item => {
        const deficit = (item.min_stock_level || 0) - item.quantity;
        return {
          ...item,
          deficit: deficit > 0 ? deficit : 0,
          reorderQuantity: deficit > 0 ? Math.ceil(deficit * 1.2) : 0 // Adăugăm 20% marjă
        };
      }).filter(item => item.deficit > 0);
      
      if (reorderList.length === 0) {
        return {
          response: `Nu am găsit materiale care necesită reaprovizionare. Toate stocurile sunt la niveluri adecvate.`,
          action: {
            type: 'query',
            result: []
          }
        };
      }
      
      // Sortăm lista după deficit (descrescător)
      reorderList.sort((a, b) => b.deficit - a.deficit);
      
      // Construim răspunsul
      const itemsList = reorderList.slice(0, 10).map(item => 
        `- ${item.name}: stoc actual ${item.quantity} ${item.unit || 'buc'}, minim ${item.min_stock_level} ${item.unit || 'buc'}, deficit ${item.deficit} ${item.unit || 'buc'}, cantitate recomandată de comandat: ${item.reorderQuantity} ${item.unit || 'buc'}`
      ).join('\n');
      
      return {
        response: `Am generat lista de reaprovizionare. Iată materialele care necesită reaprovizionare:\n\n${itemsList}${
          reorderList.length > 10 ? '\n\n...și alte ' + (reorderList.length - 10) + ' materiale.' : ''
        }\n\nDorești să export această listă în format CSV?`,
        action: {
          type: 'query',
          result: reorderList
        }
      };
    } catch (error) {
      console.error('Error generating reorder list:', error);
      return {
        response: `A apărut o eroare în timpul generării listei de reaprovizionare. Te rog să încerci din nou mai târziu.`,
        action: {
          type: 'none'
        }
      };
    }
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
    
    try {
      // Căutăm materialul în baza de date
      const { data: materials } = await inventoryService.getItems({
        searchTerm: materialName
      });
      
      if (!materials || materials.length === 0) {
        return {
          response: `Nu am găsit niciun material care să conțină "${materialName}" în nume. Te rog să verifici numele și să încerci din nou.`,
          action: {
            type: 'query',
            result: null
          }
        };
      }
      
      // Verificăm dacă avem o potrivire exactă
      const exactMatch = materials.find(m => 
        m.name.toLowerCase() === materialName.toLowerCase()
      );
      
      let materialToUpdate: Material;
      
      if (exactMatch) {
        materialToUpdate = exactMatch;
      } else if (materials.length === 1) {
        materialToUpdate = materials[0];
      } else {
        // Avem mai multe potriviri
        const materialsList = materials.slice(0, 5).map(m => 
          `- ${m.name}`
        ).join('\n');
        
        return {
          response: `Am găsit mai multe materiale care conțin "${materialName}":\n\n${materialsList}${
            materials.length > 5 ? '\n\n...și alte ' + (materials.length - 5) + ' materiale.' : ''
          }\n\nPoți să specifici exact numele materialului pentru care dorești să adaugi stoc?`,
          action: {
            type: 'query',
            result: materials
          }
        };
      }
      
      // Calculăm noua cantitate
      const newQuantity = (materialToUpdate.quantity || 0) + quantity;
      
      // Actualizăm stocul
      const { data: updatedMaterial, error } = await inventoryService.updateItem(
        materialToUpdate.id,
        { quantity: newQuantity }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        response: `Am adăugat ${quantity} ${materialToUpdate.unit || 'bucăți'} de ${materialToUpdate.name} în stoc. Noul stoc este de ${newQuantity} ${materialToUpdate.unit || 'bucăți'}.${
          materialToUpdate.min_stock_level && newQuantity < materialToUpdate.min_stock_level
            ? ` Atenție: stocul este încă sub nivelul minim de ${materialToUpdate.min_stock_level} ${materialToUpdate.unit || 'bucăți'}!`
            : materialToUpdate.min_stock_level && newQuantity >= materialToUpdate.min_stock_level && materialToUpdate.quantity < materialToUpdate.min_stock_level
            ? ` Stocul este acum peste nivelul minim de ${materialToUpdate.min_stock_level} ${materialToUpdate.unit || 'bucăți'}.`
            : ''
        }`,
        action: {
          type: 'update',
          table: 'materials',
          data: { quantity: newQuantity },
          filters: { id: materialToUpdate.id },
          result: updatedMaterial
        }
      };
    } catch (error) {
      console.error('Error adding stock:', error);
      return {
        response: `A apărut o eroare în timpul adăugării stocului. Te rog să încerci din nou mai târziu.`,
        action: {
          type: 'none'
        }
      };
    }
  }
};

export default inventoryAssistantService;
