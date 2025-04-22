/**
 * Slice pentru starea inventarului
 * Acest slice gestionează starea inventarului și a materialelor
 */

import { StateCreator } from 'zustand';
import { RootState } from '../store';
import { supabase } from '@/lib/supabase';

// Tipul pentru material
export interface Material {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  price?: number;
  quantity?: number;
  project_id?: string;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered';
  location?: string;
  barcode?: string;
  tags?: string[];
}

// Tipul pentru filtrul de materiale
export interface MaterialFilter {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipul pentru starea inventarului
export interface InventoryState {
  // Starea materialelor
  materials: Material[];
  filteredMaterials: Material[];
  selectedMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  filter: MaterialFilter;
  
  // Acțiuni
  fetchMaterials: (projectId?: string) => Promise<void>;
  fetchMaterial: (id: string) => Promise<void>;
  createMaterial: (material: Omit<Material, 'id'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateMaterial: (id: string, material: Partial<Material>) => Promise<{ success: boolean; error?: string }>;
  deleteMaterial: (id: string) => Promise<{ success: boolean; error?: string }>;
  setFilter: (filter: Partial<MaterialFilter>) => void;
  clearFilter: () => void;
  selectMaterial: (material: Material | null) => void;
  clearError: () => void;
}

// Creăm slice-ul pentru starea inventarului
export const createInventorySlice: StateCreator<
  RootState,
  [],
  [],
  InventoryState
> = (set, get) => ({
  // Starea inițială
  materials: [],
  filteredMaterials: [],
  selectedMaterial: null,
  isLoading: false,
  error: null,
  filter: {},
  
  // Acțiuni
  fetchMaterials: async (projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      let query = supabase
        .from('materials')
        .select('*');
      
      // Filtrăm după proiect dacă este specificat
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({ 
        materials: data as Material[],
        filteredMaterials: data as Material[],
        isLoading: false,
      });
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la încărcarea materialelor',
        isLoading: false,
      });
    }
  },
  
  fetchMaterial: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      set({ 
        selectedMaterial: data as Material,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la încărcarea materialului',
        isLoading: false,
      });
    }
  },
  
  createMaterial: async (material) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([material])
        .select();
      
      if (error) throw error;
      
      // Actualizăm lista de materiale
      set((state) => ({ 
        materials: [...state.materials, data[0] as Material],
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true, id: data[0].id };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la crearea materialului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  updateMaterial: async (id, material) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('materials')
        .update({
          ...material,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizăm lista de materiale
      set((state) => ({ 
        materials: state.materials.map((m) => 
          m.id === id ? { ...m, ...material, updated_at: new Date().toISOString() } : m
        ),
        selectedMaterial: state.selectedMaterial?.id === id 
          ? { ...state.selectedMaterial, ...material, updated_at: new Date().toISOString() } 
          : state.selectedMaterial,
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la actualizarea materialului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  deleteMaterial: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizăm lista de materiale
      set((state) => ({ 
        materials: state.materials.filter((m) => m.id !== id),
        selectedMaterial: state.selectedMaterial?.id === id ? null : state.selectedMaterial,
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la ștergerea materialului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  setFilter: (filter) => {
    // Actualizăm filtrul
    const newFilter = { ...get().filter, ...filter };
    
    // Filtrăm materialele
    const { materials } = get();
    let filtered = [...materials];
    
    // Aplicăm filtrele
    if (newFilter.search) {
      const search = newFilter.search.toLowerCase();
      filtered = filtered.filter((m) => 
        m.name.toLowerCase().includes(search) || 
        m.description?.toLowerCase().includes(search) ||
        m.category?.toLowerCase().includes(search)
      );
    }
    
    if (newFilter.category) {
      filtered = filtered.filter((m) => m.category === newFilter.category);
    }
    
    if (newFilter.status) {
      filtered = filtered.filter((m) => m.status === newFilter.status);
    }
    
    if (newFilter.minPrice !== undefined) {
      filtered = filtered.filter((m) => (m.price || 0) >= (newFilter.minPrice || 0));
    }
    
    if (newFilter.maxPrice !== undefined) {
      filtered = filtered.filter((m) => (m.price || 0) <= (newFilter.maxPrice || 0));
    }
    
    // Sortăm materialele
    if (newFilter.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[newFilter.sortBy as keyof Material];
        const bValue = b[newFilter.sortBy as keyof Material];
        
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return newFilter.sortOrder === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        return newFilter.sortOrder === 'desc'
          ? Number(bValue) - Number(aValue)
          : Number(aValue) - Number(bValue);
      });
    }
    
    set({ 
      filter: newFilter,
      filteredMaterials: filtered,
    });
  },
  
  clearFilter: () => {
    set((state) => ({ 
      filter: {},
      filteredMaterials: state.materials,
    }));
  },
  
  selectMaterial: (material) => {
    set({ selectedMaterial: material });
  },
  
  clearError: () => set({ error: null }),
});
