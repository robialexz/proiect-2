import { useState, useEffect, useCallback, useReducer } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { inventoryService } from '@/lib/inventory-service';
import { Material, SortConfig, FilterConfig, PaginationConfig } from '@/types';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

// Schema de validare pentru material
export const materialSchema = z.object({
  name: z.string().min(1, 'Numele este obligatoriu'),
  quantity: z.number().min(0, 'Cantitatea nu poate fi negativă'),
  unit: z.string().min(1, 'Unitatea de măsură este obligatorie'),
  dimension: z.string().optional(),
  manufacturer: z.string().optional(),
  cost_per_unit: z.number().min(0, 'Costul nu poate fi negativ').optional(),
  supplier_id: z.string().optional(),
  project_id: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  min_stock_level: z.number().min(0, 'Nivelul minim nu poate fi negativ').optional(),
  max_stock_level: z.number().min(0, 'Nivelul maxim nu poate fi negativ').optional(),
  notes: z.string().optional(),
  image_url: z.string().optional(),
});

// Tipuri pentru reducer
type InventoryState = {
  materials: Material[];
  filteredMaterials: Material[];
  loading: boolean;
  error: string | null;
  selectedMaterial: Material | null;
  pagination: PaginationConfig;
  sort: SortConfig;
  filters: Record<string, any>;
  categories: string[];
  suppliers: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  subscription: any;
};

type InventoryAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Material[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_SELECTED_MATERIAL'; payload: Material | null }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationConfig> }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_SUPPLIERS'; payload: { id: string; name: string }[] }
  | { type: 'SET_PROJECTS'; payload: { id: string; name: string }[] }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'DELETE_MATERIAL'; payload: string }
  | { type: 'SET_SUBSCRIPTION'; payload: any }
  | { type: 'APPLY_FILTERS' };

// Reducer pentru gestionarea stării
const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        materials: action.payload,
        filteredMaterials: action.payload,
        error: null,
        pagination: {
          ...state.pagination,
          total: action.payload.length
        }
      };
    
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'SET_SELECTED_MATERIAL':
      return { ...state, selectedMaterial: action.payload };
    
    case 'SET_PAGINATION':
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload } 
      };
    
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_MATERIAL': {
      const updatedMaterials = [...state.materials, action.payload];
      return { 
        ...state, 
        materials: updatedMaterials,
        filteredMaterials: applyFilters(updatedMaterials, state.filters),
        pagination: {
          ...state.pagination,
          total: updatedMaterials.length
        }
      };
    }
    
    case 'UPDATE_MATERIAL': {
      const updatedMaterials = state.materials.map(material => 
        material.id === action.payload.id ? action.payload : material
      );
      return { 
        ...state, 
        materials: updatedMaterials,
        filteredMaterials: applyFilters(updatedMaterials, state.filters),
        selectedMaterial: null
      };
    }
    
    case 'DELETE_MATERIAL': {
      const updatedMaterials = state.materials.filter(material => 
        material.id !== action.payload
      );
      return { 
        ...state, 
        materials: updatedMaterials,
        filteredMaterials: applyFilters(updatedMaterials, state.filters),
        pagination: {
          ...state.pagination,
          total: updatedMaterials.length
        }
      };
    }
    
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    
    case 'APPLY_FILTERS':
      return { 
        ...state, 
        filteredMaterials: applyFilters(state.materials, state.filters),
        pagination: {
          ...state.pagination,
          page: 1,
          total: applyFilters(state.materials, state.filters).length
        }
      };
    
    default:
      return state;
  }
};

// Funcție pentru aplicarea filtrelor
const applyFilters = (materials: Material[], filters: Record<string, any>): Material[] => {
  return materials.filter(material => {
    // Filtrare după categorie
    if (filters.category && material.category !== filters.category) {
      return false;
    }
    
    // Filtrare după proiect
    if (filters.projectId && material.project_id !== filters.projectId) {
      return false;
    }
    
    // Filtrare după furnizor
    if (filters.supplierId && material.supplier_id !== filters.supplierId) {
      return false;
    }
    
    // Filtrare după termen de căutare
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const nameMatch = material.name.toLowerCase().includes(searchTerm);
      const categoryMatch = material.category?.toLowerCase().includes(searchTerm) || false;
      const notesMatch = material.notes?.toLowerCase().includes(searchTerm) || false;
      const manufacturerMatch = material.manufacturer?.toLowerCase().includes(searchTerm) || false;
      
      if (!(nameMatch || categoryMatch || notesMatch || manufacturerMatch)) {
        return false;
      }
    }
    
    // Filtrare după stoc scăzut
    if (filters.lowStock && material.min_stock_level) {
      return material.quantity < material.min_stock_level;
    }
    
    return true;
  });
};

// Starea inițială
const initialState: InventoryState = {
  materials: [],
  filteredMaterials: [],
  loading: false,
  error: null,
  selectedMaterial: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  sort: {
    field: 'name',
    direction: 'asc'
  },
  filters: {},
  categories: [],
  suppliers: [],
  projects: [],
  subscription: null
};

// Hook pentru gestionarea inventarului
export const useInventory = (projectId?: string) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Funcție pentru încărcarea materialelor
  const loadMaterials = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await inventoryService.getItems({ 
        projectId: projectId || state.filters.projectId,
        orderBy: { 
          column: state.sort.field, 
          ascending: state.sort.direction === 'asc' 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data || [] });
      
      // Extragem categoriile unice
      const categories = [...new Set(response.data?.map(item => item.category).filter(Boolean) as string[])];
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la încărcarea materialelor';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      
      toast({
        title: t('inventory.errors.loadFailed', 'Eroare la încărcarea inventarului'),
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [projectId, state.filters.projectId, state.sort.field, state.sort.direction, toast, t]);

  // Funcție pentru crearea unui material nou
  const createMaterial = useCallback(async (material: Omit<Material, 'id' | 'created_at'>) => {
    try {
      // Validăm materialul
      materialSchema.parse(material);
      
      const response = await inventoryService.createItem(material);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        dispatch({ type: 'ADD_MATERIAL', payload: response.data });
        
        toast({
          title: t('inventory.success.created', 'Material creat'),
          description: t('inventory.success.createdDescription', 'Materialul a fost creat cu succes'),
          variant: 'default'
        });
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Nu s-a putut crea materialul' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la crearea materialului';
      
      toast({
        title: t('inventory.errors.createFailed', 'Eroare la crearea materialului'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast, t]);

  // Funcție pentru actualizarea unui material
  const updateMaterial = useCallback(async (id: string, material: Partial<Material>) => {
    try {
      // Validăm materialul
      const currentMaterial = state.materials.find(m => m.id === id);
      if (!currentMaterial) {
        throw new Error('Materialul nu a fost găsit');
      }
      
      // Validăm doar câmpurile care sunt actualizate
      const fieldsToValidate: Record<string, any> = {};
      for (const key in material) {
        if (material[key as keyof Material] !== undefined) {
          fieldsToValidate[key] = material[key as keyof Material];
        }
      }
      
      // Validăm câmpurile actualizate
      materialSchema.partial().parse(fieldsToValidate);
      
      try {
      const response = await inventoryService.updateItem(id, material);
      } catch (error) {
        // Handle error appropriately
      }
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        dispatch({ type: 'UPDATE_MATERIAL', payload: response.data });
        
        toast({
          title: t('inventory.success.updated', 'Material actualizat'),
          description: t('inventory.success.updatedDescription', 'Materialul a fost actualizat cu succes'),
          variant: 'default'
        });
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Nu s-a putut actualiza materialul' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la actualizarea materialului';
      
      toast({
        title: t('inventory.errors.updateFailed', 'Eroare la actualizarea materialului'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [state.materials, toast, t]);

  // Funcție pentru ștergerea unui material
  const deleteMaterial = useCallback(async (id: string) => {
    try {
      const response = await inventoryService.deleteItem(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      dispatch({ type: 'DELETE_MATERIAL', payload: id });
      
      toast({
        title: t('inventory.success.deleted', 'Material șters'),
        description: t('inventory.success.deletedDescription', 'Materialul a fost șters cu succes'),
        variant: 'default'
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la ștergerea materialului';
      
      toast({
        title: t('inventory.errors.deleteFailed', 'Eroare la ștergerea materialului'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast, t]);

  // Funcție pentru actualizarea cantității suplimentare
  const updateSuplimentar = useCallback(async (id: string, quantity: number) => {
    try {
      const response = await inventoryService.updateSuplimentar(id, quantity);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        dispatch({ type: 'UPDATE_MATERIAL', payload: response.data });
        
        toast({
          title: t('inventory.success.updated', 'Cantitate actualizată'),
          description: t('inventory.success.updatedDescription', 'Cantitatea suplimentară a fost actualizată cu succes'),
          variant: 'default'
        });
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Nu s-a putut actualiza cantitatea suplimentară' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la actualizarea cantității suplimentare';
      
      toast({
        title: t('inventory.errors.updateFailed', 'Eroare la actualizare'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast, t]);

  // Funcție pentru confirmarea cantității suplimentare
  const confirmSuplimentar = useCallback(async (id: string) => {
    try {
      const response = await inventoryService.confirmSuplimentar(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        dispatch({ type: 'UPDATE_MATERIAL', payload: response.data });
        
        toast({
          title: t('inventory.success.confirmed', 'Cantitate confirmată'),
          description: t('inventory.success.confirmedDescription', 'Cantitatea suplimentară a fost adăugată la stoc'),
          variant: 'default'
        });
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Nu s-a putut confirma cantitatea suplimentară' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la confirmarea cantității suplimentare';
      
      toast({
        title: t('inventory.errors.confirmFailed', 'Eroare la confirmare'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast, t]);

  // Funcție pentru generarea listei de reaprovizionare
  const generateReorderList = useCallback(async () => {
    try {
      const response = await inventoryService.generateReorderList();
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return { success: true, data: response.data || [] };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la generarea listei de reaprovizionare';
      
      toast({
        title: t('inventory.errors.reorderFailed', 'Eroare la generarea listei'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [toast, t]);

  // Funcție pentru exportul inventarului
  const exportInventory = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await inventoryService.exportInventory(format, {
        projectId: projectId || state.filters.projectId,
        category: state.filters.category
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        // Creăm un URL pentru blob și descărcăm fișierul
        const url = URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: t('inventory.success.exported', 'Export reușit'),
          description: t('inventory.success.exportedDescription', 'Inventarul a fost exportat cu succes'),
          variant: 'default'
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Nu s-a putut exporta inventarul' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare la exportul inventarului';
      
      toast({
        title: t('inventory.errors.exportFailed', 'Eroare la export'),
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    }
  }, [projectId, state.filters.projectId, state.filters.category, toast, t]);

  // Funcție pentru setarea filtrelor
  const setFilters = useCallback((filters: Record<string, any>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    dispatch({ type: 'APPLY_FILTERS' });
  }, []);

  // Funcție pentru setarea sortării
  const setSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { field, direction } });
  }, []);

  // Funcție pentru setarea paginării
  const setPagination = useCallback((page: number, limit?: number) => {
    dispatch({ 
      type: 'SET_PAGINATION', 
      payload: { 
        page, 
        limit: limit || state.pagination.limit 
      } 
    });
  }, [state.pagination.limit]);

  // Funcție pentru selectarea unui material
  const selectMaterial = useCallback((material: Material | null) => {
    dispatch({ type: 'SET_SELECTED_MATERIAL', payload: material });
  }, []);

  // Efect pentru încărcarea materialelor la montare
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Efect pentru abonarea la schimbări în timp real
  useEffect(() => {
    // Funcție pentru gestionarea actualizărilor în timp real
    const handleRealtimeUpdate = (payload: { 
      new: Material | null; 
      old: Material | null; 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE' 
    }) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        dispatch({ type: 'ADD_MATERIAL', payload: payload.new });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        dispatch({ type: 'UPDATE_MATERIAL', payload: payload.new });
      } else if (payload.eventType === 'DELETE' && payload.old) {
        dispatch({ type: 'DELETE_MATERIAL', payload: payload.old.id });
      }
    };
    
    // Creăm abonamentul
    const subscription = inventoryService.subscribeToInventoryChanges(
      handleRealtimeUpdate,
      { projectId: projectId || state.filters.projectId }
    );
    
    dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
    
    // Curățăm abonamentul la demontare
    return () => {
      if (state.subscription) {
        inventoryService.unsubscribeFromInventoryChanges(state.subscription);
      }
    };
  }, [projectId, state.filters.projectId]);

  // Calculăm materialele pentru pagina curentă
  const paginatedMaterials = state.filteredMaterials.slice(
    (state.pagination.page - 1) * state.pagination.limit,
    state.pagination.page * state.pagination.limit
  );

  // Returnăm starea și funcțiile
  return {
    // Stare
    materials: state.materials,
    filteredMaterials: state.filteredMaterials,
    paginatedMaterials,
    loading: state.loading,
    error: state.error,
    selectedMaterial: state.selectedMaterial,
    pagination: state.pagination,
    sort: state.sort,
    filters: state.filters,
    categories: state.categories,
    
    // Funcții
    loadMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateSuplimentar,
    confirmSuplimentar,
    generateReorderList,
    exportInventory,
    setFilters,
    setSort,
    setPagination,
    selectMaterial
  };
};

export default useInventory;
