import DataService from './data-service';
import { Material, LowStockItem, MaterialWithProject } from '@/models';
import { enhancedSupabaseService, SupabaseResponse } from '../api/enhanced-supabase-service';
import { authService } from '../auth/auth-service';

/**
 * Serviciu pentru gestionarea materialelor
 */
class MaterialService extends DataService<Material> {
  constructor() {
    super('materials');
  }
  
  /**
   * Obține materialele unui proiect
   * @param projectId ID-ul proiectului
   * @returns Materialele proiectului sau eroarea
   */
  async getProjectMaterials(projectId: string): Promise<SupabaseResponse<Material[]>> {
    return this.getAll({
      filters: { project_id: projectId },
      sort: { field: 'name', direction: 'asc' }
    });
  }
  
  /**
   * Obține materialele cu stoc scăzut
   * @returns Materialele cu stoc scăzut sau eroarea
   */
  async getLowStockMaterials(): Promise<SupabaseResponse<LowStockItem[]>> {
    try {
      // Obținem toate materialele
      const { data: materials, error } = await this.getAll();
      
      if (error || !materials) {
        throw new Error(error?.message || 'Failed to get materials');
      }
      
      // Filtrăm materialele cu stoc scăzut
      const lowStockItems = materials
        .filter(material => {
          const minStock = material.min_stock_level || 0;
          return material.quantity < minStock;
        })
        .map(material => {
          const minStock = material.min_stock_level || 0;
          return {
            ...material,
            deficit: minStock - material.quantity,
            reorder_quantity: material.max_stock_level ? material.max_stock_level - material.quantity : minStock
          };
        });
      
      return {
        data: lowStockItems,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get low stock materials',
          code: 'low_stock_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Obține materialele cu informații despre proiect
   * @returns Materialele cu informații despre proiect sau eroarea
   */
  async getMaterialsWithProjects(): Promise<SupabaseResponse<MaterialWithProject[]>> {
    try {
      // Folosim join pentru a obține informații despre proiecte
      return enhancedSupabaseService.joinTables<MaterialWithProject[]>(
        'materials',
        [
          {
            table: 'projects',
            on: { mainTableColumn: 'project_id', joinTableColumn: 'id' },
            columns: ['name', 'status'],
            type: 'left'
          }
        ],
        ['*'],
        {}
      );
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get materials with projects',
          code: 'materials_projects_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Adaugă un material la un proiect
   * @param projectId ID-ul proiectului
   * @param material Datele materialului
   * @returns Materialul creat sau eroarea
   */
  async addProjectMaterial(projectId: string, material: Partial<Material>): Promise<SupabaseResponse<Material>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Adăugăm proiectul și data creării
      const materialData: Partial<Material> = {
        ...material,
        project_id: projectId,
        created_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Creăm materialul
      return this.create(materialData);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to add project material',
          code: 'project_material_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Actualizează cantitatea unui material
   * @param materialId ID-ul materialului
   * @param quantity Noua cantitate
   * @returns Materialul actualizat sau eroarea
   */
  async updateMaterialQuantity(materialId: string, quantity: number): Promise<SupabaseResponse<Material>> {
    // Validăm cantitatea
    const validQuantity = Math.max(0, quantity);
    
    // Actualizăm materialul
    return this.update(materialId, { quantity: validQuantity });
  }
  
  /**
   * Transferă un material între proiecte
   * @param materialId ID-ul materialului
   * @param fromProjectId ID-ul proiectului sursă
   * @param toProjectId ID-ul proiectului destinație
   * @param quantity Cantitatea de transferat
   * @returns Materialul actualizat sau eroarea
   */
  async transferMaterial(
    materialId: string,
    fromProjectId: string,
    toProjectId: string,
    quantity: number
  ): Promise<SupabaseResponse<Material>> {
    try {
      // Obținem materialul
      const { data: material, error } = await this.getById(materialId);
      
      if (error || !material) {
        throw new Error(error?.message || 'Material not found');
      }
      
      // Verificăm dacă materialul aparține proiectului sursă
      if (material.project_id !== fromProjectId) {
        throw new Error('Material does not belong to the source project');
      }
      
      // Verificăm dacă cantitatea este validă
      if (quantity <= 0 || quantity > material.quantity) {
        throw new Error('Invalid quantity');
      }
      
      // Creăm o copie a materialului pentru proiectul destinație
      const newMaterial: Partial<Material> = {
        name: material.name,
        description: material.description,
        quantity,
        unit: material.unit,
        dimension: material.dimension,
        manufacturer: material.manufacturer,
        cost_per_unit: material.cost_per_unit,
        supplier_id: material.supplier_id,
        project_id: toProjectId,
        category: material.category,
        location: material.location,
        min_stock_level: material.min_stock_level,
        max_stock_level: material.max_stock_level,
        notes: material.notes,
        image_url: material.image_url,
        created_at: new Date().toISOString()
      };
      
      // Creăm materialul în proiectul destinație
      const { data: newMaterialData, error: createError } = await this.create(newMaterial);
      
      if (createError || !newMaterialData) {
        throw new Error(createError?.message || 'Failed to create material in destination project');
      }
      
      // Actualizăm cantitatea materialului în proiectul sursă
      const { data: updatedMaterial, error: updateError } = await this.update(materialId, {
        quantity: material.quantity - quantity
      });
      
      if (updateError || !updatedMaterial) {
        throw new Error(updateError?.message || 'Failed to update material in source project');
      }
      
      return {
        data: newMaterialData,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to transfer material',
          code: 'material_transfer_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Caută materiale după nume sau descriere
   * @param query Textul de căutat
   * @returns Materialele găsite sau eroarea
   */
  async searchMaterials(query: string): Promise<SupabaseResponse<Material[]>> {
    try {
      // Folosim căutarea full-text
      return enhancedSupabaseService.textSearch<Material[]>(
        'materials',
        'name',
        query,
        {
          columns: ['*'],
          limit: 20,
          order: { column: 'name', ascending: true }
        }
      );
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to search materials',
          code: 'material_search_error'
        },
        status: 'error'
      };
    }
  }
}

export const materialService = new MaterialService();
export default materialService;
