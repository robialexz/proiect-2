import { supabase } from './supabase';
import { 
  Material, 
  MaterialWithProject, 
  MaterialMovement, 
  InventoryFilters, 
  InventorySort, 
  InventoryPagination,
  ReorderItem,
  InventoryImportResult,
  InventoryExportOptions
} from '@/models/inventory';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

class InventoryService {
  /**
   * Obține toate materialele
   */
  async getAllMaterials(
    filters?: InventoryFilters,
    sort?: InventorySort,
    pagination?: InventoryPagination
  ): Promise<{ data: MaterialWithProject[], pagination: InventoryPagination }> {
    try {
      // Construim query-ul de bază
      let query = supabase
        .from('materials')
        .select(`
          *,
          projects:project_id (
            id,
            name
          )
        `);
      
      // Aplicăm filtrele
      if (filters) {
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,dimension.ilike.%${filters.search}%,category.ilike.%${filters.search}%,manufacturer.ilike.%${filters.search}%,location.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
        }
        
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.project) {
          query = query.eq('project_id', filters.project);
        }
        
        if (filters.manufacturer) {
          query = query.eq('manufacturer', filters.manufacturer);
        }
        
        if (filters.location) {
          query = query.eq('location', filters.location);
        }
        
        if (filters.minQuantity !== undefined) {
          query = query.gte('quantity', filters.minQuantity);
        }
        
        if (filters.maxQuantity !== undefined) {
          query = query.lte('quantity', filters.maxQuantity);
        }
        
        if (filters.lowStock) {
          query = query.lt('quantity', supabase.raw('min_stock_level'));
        }
      }
      
      // Obținem numărul total de înregistrări pentru paginare
      const { count, error: countError } = await supabase
        .from('materials')
        .select('id', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Aplicăm sortarea
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('name', { ascending: true });
      }
      
      // Aplicăm paginarea
      if (pagination) {
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);
      }
      
      // Executăm query-ul
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformăm datele pentru a include numele proiectului
      const materialsWithProject = (data || []).map(item => {
        const { projects, ...material } = item;
        return {
          ...material,
          project_name: projects?.name
        } as MaterialWithProject;
      });
      
      return {
        data: materialsWithProject,
        pagination: {
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || (data?.length || 0),
          total: count || (data?.length || 0)
        }
      };
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all materials',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține un material după ID
   */
  async getMaterialById(materialId: string): Promise<MaterialWithProject | null> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          projects:project_id (
            id,
            name
          )
        `)
        .eq('id', materialId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Transformăm datele pentru a include numele proiectului
      const { projects, ...material } = data;
      return {
        ...material,
        project_name: projects?.name
      } as MaterialWithProject;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get material by ID: ${materialId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Creează un material nou
   */
  async createMaterial(material: Partial<MaterialWithProject>): Promise<MaterialWithProject> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...material,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create material');
      
      // Obținem numele proiectului dacă există
      let projectName = null;
      if (data.project_id) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('name')
          .eq('id', data.project_id)
          .single();
        
        if (!projectError && project) {
          projectName = project.name;
        }
      }
      
      return {
        ...data,
        project_name: projectName
      } as MaterialWithProject;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to create material',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează un material existent
   */
  async updateMaterial(materialId: string, material: Partial<MaterialWithProject>): Promise<MaterialWithProject> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({
          ...material,
          updated_at: new Date().toISOString()
        })
        .eq('id', materialId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to update material');
      
      // Obținem numele proiectului dacă există
      let projectName = null;
      if (data.project_id) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('name')
          .eq('id', data.project_id)
          .single();
        
        if (!projectError && project) {
          projectName = project.name;
        }
      }
      
      return {
        ...data,
        project_name: projectName
      } as MaterialWithProject;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update material: ${materialId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Șterge un material
   */
  async deleteMaterial(materialId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to delete material: ${materialId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Înregistrează o mișcare de material
   */
  async recordMaterialMovement(movement: Partial<MaterialMovement>): Promise<MaterialMovement> {
    try {
      // Obținem materialul curent
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', movement.material_id)
        .single();
      
      if (materialError) throw materialError;
      if (!material) throw new Error('Material not found');
      
      // Calculăm noua cantitate
      let newQuantity = material.quantity;
      
      switch (movement.movement_type) {
        case 'receipt':
          newQuantity += movement.quantity || 0;
          break;
        case 'issue':
          newQuantity -= movement.quantity || 0;
          break;
        case 'return':
          newQuantity += movement.quantity || 0;
          break;
        case 'adjustment':
          newQuantity = movement.quantity || 0;
          break;
        case 'transfer':
          // Pentru transfer, nu modificăm cantitatea aici
          break;
      }
      
      // Actualizăm cantitatea materialului
      if (movement.movement_type !== 'transfer') {
        const { error: updateError } = await supabase
          .from('materials')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', movement.material_id);
        
        if (updateError) throw updateError;
      } else if (movement.movement_type === 'transfer') {
        // Pentru transfer, actualizăm proiectul materialului
        const { error: transferError } = await supabase
          .from('materials')
          .update({
            project_id: movement.to_project_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', movement.material_id);
        
        if (transferError) throw transferError;
      }
      
      // Înregistrăm mișcarea
      const { data, error } = await supabase
        .from('material_movements')
        .insert({
          ...movement,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to record material movement');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to record material movement',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține mișcările unui material
   */
  async getMaterialMovements(materialId: string): Promise<MaterialMovement[]> {
    try {
      const { data, error } = await supabase
        .from('material_movements')
        .select('*')
        .eq('material_id', materialId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get material movements: ${materialId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Generează un cod QR pentru un material
   */
  async generateQRCode(materialId: string): Promise<string> {
    try {
      // Obținem materialul
      const material = await this.getMaterialById(materialId);
      if (!material) throw new Error('Material not found');
      
      // Creăm datele pentru codul QR
      const qrData = {
        id: material.id,
        name: material.name,
        dimension: material.dimension,
        unit: material.unit,
        category: material.category,
        project_id: material.project_id,
        project_name: material.project_name,
        timestamp: new Date().toISOString()
      };
      
      // Convertim datele în JSON
      const qrCodeData = JSON.stringify(qrData);
      
      // Înregistrăm codul QR în baza de date
      const { data, error } = await supabase
        .from('material_qr_codes')
        .insert({
          material_id: materialId,
          qr_code_data: qrCodeData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return qrCodeData;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to generate QR code: ${materialId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține materialele cu stoc scăzut
   */
  async getLowStockMaterials(): Promise<MaterialWithProject[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          projects:project_id (
            id,
            name
          )
        `)
        .lt('quantity', supabase.raw('min_stock_level'))
        .order('quantity');
      
      if (error) throw error;
      
      // Transformăm datele pentru a include numele proiectului
      const materialsWithProject = (data || []).map(item => {
        const { projects, ...material } = item;
        return {
          ...material,
          project_name: projects?.name
        } as MaterialWithProject;
      });
      
      return materialsWithProject;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get low stock materials',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Generează lista de reaprovizionare
   */
  async generateReorderList(): Promise<ReorderItem[]> {
    try {
      // Obținem materialele cu stoc scăzut
      const lowStockMaterials = await this.getLowStockMaterials();
      
      // Transformăm materialele în elemente de reaprovizionare
      const reorderItems = lowStockMaterials.map(material => {
        // Calculăm cantitatea recomandată pentru comandă
        const recommendedQuantity = material.min_stock_level 
          ? Math.max(material.min_stock_level - material.quantity, 0) 
          : 0;
        
        return {
          id: material.id,
          name: material.name,
          dimension: material.dimension,
          unit: material.unit,
          quantity: material.quantity,
          min_stock_level: material.min_stock_level || 0,
          category: material.category,
          project_name: material.project_name,
          cost_per_unit: material.cost_per_unit,
          recommended_order_quantity: recommendedQuantity
        } as ReorderItem;
      });
      
      return reorderItems;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to generate reorder list',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Generează un raport de inventar
   */
  async generateInventoryReport(filters?: InventoryFilters): Promise<MaterialWithProject[]> {
    try {
      // Obținem toate materialele cu filtrele specificate
      const { data } = await this.getAllMaterials(filters);
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to generate inventory report',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Importă materiale din CSV sau Excel
   */
  async importMaterials(file: File): Promise<InventoryImportResult> {
    try {
      // Creăm un FormData pentru a trimite fișierul
      const formData = new FormData();
      formData.append('file', file);
      
      // Trimitem fișierul către o funcție edge
      const { data, error } = await supabase.functions.invoke('import-inventory', {
        body: formData
      });
      
      if (error) throw error;
      
      return data as InventoryImportResult;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to import materials',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Exportă inventarul
   */
  async exportInventory(options?: InventoryExportOptions): Promise<Blob> {
    try {
      // Obținem toate materialele
      const { data } = await this.getAllMaterials();
      
      // Convertim datele în CSV
      const headers = [
        'Name',
        'Dimension',
        'Unit',
        'Quantity',
        'Manufacturer',
        'Category',
        'Project',
        'Cost Per Unit',
        'Location',
        'Min Stock Level',
        'Max Stock Level',
        'Notes'
      ];
      
      const csvContent = [
        headers.join(','),
        ...data.map(item => [
          `"${item.name || ''}"`,
          `"${item.dimension || ''}"`,
          `"${item.unit || ''}"`,
          item.quantity || 0,
          `"${item.manufacturer || ''}"`,
          `"${item.category || ''}"`,
          `"${item.project_name || ''}"`,
          item.cost_per_unit || 0,
          `"${item.location || ''}"`,
          item.min_stock_level || 0,
          item.max_stock_level || 0,
          `"${item.notes || ''}"`
        ].join(','))
      ].join('\n');
      
      // Creăm un blob cu datele CSV
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to export inventory',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține categoriile unice de materiale
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      // Extragem categoriile unice
      const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
      
      return categories;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get categories',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține locațiile unice de materiale
   */
  async getLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('location')
        .not('location', 'is', null);
      
      if (error) throw error;
      
      // Extragem locațiile unice
      const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
      
      return locations;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get locations',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține producătorii unici de materiale
   */
  async getManufacturers(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('manufacturer')
        .not('manufacturer', 'is', null);
      
      if (error) throw error;
      
      // Extragem producătorii unici
      const manufacturers = [...new Set(data.map(item => item.manufacturer).filter(Boolean))];
      
      return manufacturers;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get manufacturers',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
