/**
 * Serviciu pentru materiale
 * Acest fișier conține funcții pentru interacțiunea cu materialele
 */

import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logging';
import { createError, ErrorSource, ErrorType, ErrorSeverity } from '@/lib/error-handling';
import { Material, CreateMaterialInput, UpdateMaterialInput, MaterialFilter, MaterialSort, MaterialPagination } from '@/models/material.model';

/**
 * Serviciu pentru materiale
 */
export const materialService = {
  /**
   * Obține toate materialele
   * @param filter Filtrul pentru materiale
   * @param sort Sortarea pentru materiale
   * @param pagination Paginarea pentru materiale
   * @returns Lista de materiale
   */
  async getMaterials(
    filter?: MaterialFilter,
    sort?: MaterialSort,
    pagination?: MaterialPagination
  ) {
    try {
      // Construim query-ul
      let query = supabase.from('materials').select('*');
      
      // Aplicăm filtrele
      if (filter) {
        if (filter.search) {
          query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,category.ilike.%${filter.search}%`);
        }
        
        if (filter.category) {
          if (Array.isArray(filter.category)) {
            query = query.in('category', filter.category);
          } else {
            query = query.eq('category', filter.category);
          }
        }
        
        if (filter.status) {
          if (Array.isArray(filter.status)) {
            query = query.in('status', filter.status);
          } else {
            query = query.eq('status', filter.status);
          }
        }
        
        if (filter.project_id) {
          if (Array.isArray(filter.project_id)) {
            query = query.in('project_id', filter.project_id);
          } else {
            query = query.eq('project_id', filter.project_id);
          }
        }
        
        if (filter.supplier_id) {
          if (Array.isArray(filter.supplier_id)) {
            query = query.in('supplier_id', filter.supplier_id);
          } else {
            query = query.eq('supplier_id', filter.supplier_id);
          }
        }
        
        if (filter.minPrice !== undefined) {
          query = query.gte('price', filter.minPrice);
        }
        
        if (filter.maxPrice !== undefined) {
          query = query.lte('price', filter.maxPrice);
        }
        
        if (filter.minQuantity !== undefined) {
          query = query.gte('quantity', filter.minQuantity);
        }
        
        if (filter.maxQuantity !== undefined) {
          query = query.lte('quantity', filter.maxQuantity);
        }
        
        if (filter.tags && filter.tags.length > 0) {
          query = query.contains('tags', filter.tags);
        }
      }
      
      // Aplicăm sortarea
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Aplicăm paginarea
      if (pagination) {
        const { page, limit } = pagination;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        query = query.range(from, to);
      }
      
      // Executăm query-ul
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Calculăm numărul total de pagini
      const totalPages = pagination
        ? Math.ceil((count || 0) / pagination.limit)
        : 1;
      
      return {
        data,
        total: count || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || data?.length || 0,
        totalPages,
        error: null,
      };
    } catch (error: any) {
      apiLogger.error('Error getting materials:', error);
      
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: createError(error.message || 'Error getting materials', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Obține un material după ID
   * @param id ID-ul materialului
   * @returns Materialul
   */
  async getMaterialById(id: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error getting material with ID ${id}:`, error);
      
      return {
        data: null,
        error: createError(error.message || `Error getting material with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Creează un material
   * @param material Datele materialului
   * @returns Materialul creat
   */
  async createMaterial(material: CreateMaterialInput) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          ...material,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error creating material:', error);
      
      return {
        data: null,
        error: createError(error.message || 'Error creating material', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Actualizează un material
   * @param id ID-ul materialului
   * @param material Datele materialului
   * @returns Materialul actualizat
   */
  async updateMaterial(id: string, material: UpdateMaterialInput) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({
          ...material,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error updating material with ID ${id}:`, error);
      
      return {
        data: null,
        error: createError(error.message || `Error updating material with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Șterge un material
   * @param id ID-ul materialului
   * @returns Rezultatul ștergerii
   */
  async deleteMaterial(id: string) {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error(`Error deleting material with ID ${id}:`, error);
      
      return {
        error: createError(error.message || `Error deleting material with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Obține materialele pentru un proiect
   * @param projectId ID-ul proiectului
   * @returns Lista de materiale
   */
  async getMaterialsByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error getting materials for project with ID ${projectId}:`, error);
      
      return {
        data: [],
        error: createError(error.message || `Error getting materials for project with ID ${projectId}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Obține materialele pentru un furnizor
   * @param supplierId ID-ul furnizorului
   * @returns Lista de materiale
   */
  async getMaterialsBySupplier(supplierId: string) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error getting materials for supplier with ID ${supplierId}:`, error);
      
      return {
        data: [],
        error: createError(error.message || `Error getting materials for supplier with ID ${supplierId}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
};

// Exportăm serviciul
export default materialService;
