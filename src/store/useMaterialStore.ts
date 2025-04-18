import { create } from 'zustand';
import { Material, LowStockItem, MaterialWithProject } from '@/models';
import { materialService } from '@/services';

// Definim tipurile pentru starea materialelor
interface MaterialState {
  // Stare
  materials: Material[];
  projectMaterials: Record<string, Material[]>; // Materiale grupate pe proiecte
  lowStockMaterials: LowStockItem[];
  materialsWithProjects: MaterialWithProject[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  
  // Acțiuni
  fetchMaterials: () => Promise<void>;
  fetchProjectMaterials: (projectId: string) => Promise<void>;
  fetchLowStockMaterials: () => Promise<void>;
  fetchMaterialsWithProjects: () => Promise<void>;
  fetchMaterial: (materialId: string) => Promise<void>;
  createMaterial: (material: Partial<Material>) => Promise<Material | null>;
  updateMaterial: (materialId: string, material: Partial<Material>) => Promise<Material | null>;
  deleteMaterial: (materialId: string) => Promise<boolean>;
  updateMaterialQuantity: (materialId: string, quantity: number) => Promise<boolean>;
  transferMaterial: (materialId: string, fromProjectId: string, toProjectId: string, quantity: number) => Promise<boolean>;
  searchMaterials: (query: string) => Promise<Material[]>;
  addProjectMaterial: (projectId: string, material: Partial<Material>) => Promise<Material | null>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Creăm store-ul pentru materiale
export const useMaterialStore = create<MaterialState>((set, get) => ({
  // Stare inițială
  materials: [],
  projectMaterials: {},
  lowStockMaterials: [],
  materialsWithProjects: [],
  currentMaterial: null,
  isLoading: false,
  error: null,
  
  // Acțiuni
  fetchMaterials: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.getAll();
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea materialelor' 
        });
        return;
      }
      
      set({ 
        materials: data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea materialelor' 
      });
    }
  },
  
  fetchProjectMaterials: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.getProjectMaterials(projectId);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea materialelor proiectului' 
        });
        return;
      }
      
      // Actualizăm materialele proiectului
      set(state => ({ 
        projectMaterials: {
          ...state.projectMaterials,
          [projectId]: data
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea materialelor proiectului' 
      });
    }
  },
  
  fetchLowStockMaterials: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.getLowStockMaterials();
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea materialelor cu stoc scăzut' 
        });
        return;
      }
      
      set({ 
        lowStockMaterials: data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea materialelor cu stoc scăzut' 
      });
    }
  },
  
  fetchMaterialsWithProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.getMaterialsWithProjects();
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea materialelor cu proiecte' 
        });
        return;
      }
      
      set({ 
        materialsWithProjects: data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea materialelor cu proiecte' 
      });
    }
  },
  
  fetchMaterial: async (materialId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.getById(materialId);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea materialului' 
        });
        return;
      }
      
      set({ 
        currentMaterial: data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea materialului' 
      });
    }
  },
  
  createMaterial: async (material: Partial<Material>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.create(material);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la crearea materialului' 
        });
        return null;
      }
      
      // Actualizăm lista de materiale
      set(state => ({ 
        materials: [...state.materials, data],
        currentMaterial: data,
        isLoading: false
      }));
      
      // Dacă materialul aparține unui proiect, actualizăm și lista de materiale a proiectului
      if (data.project_id) {
        set(state => {
          const projectMaterials = state.projectMaterials[data.project_id] || [];
          return {
            projectMaterials: {
              ...state.projectMaterials,
              [data.project_id]: [...projectMaterials, data]
            }
          };
        });
      }
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la crearea materialului' 
      });
      return null;
    }
  },
  
  updateMaterial: async (materialId: string, material: Partial<Material>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.update(materialId, material);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la actualizarea materialului' 
        });
        return null;
      }
      
      // Actualizăm materialul în toate listele
      set(state => {
        // Actualizăm lista generală de materiale
        const updatedMaterials = state.materials.map(m => m.id === materialId ? data : m);
        
        // Actualizăm materialul curent dacă este cel modificat
        const updatedCurrentMaterial = state.currentMaterial?.id === materialId ? data : state.currentMaterial;
        
        // Actualizăm lista de materiale cu stoc scăzut
        const updatedLowStockMaterials = state.lowStockMaterials.map(m => m.id === materialId ? {
          ...data,
          deficit: (data.min_stock_level || 0) - data.quantity,
          reorder_quantity: data.max_stock_level ? data.max_stock_level - data.quantity : (data.min_stock_level || 0)
        } : m);
        
        // Actualizăm lista de materiale cu proiecte
        const updatedMaterialsWithProjects = state.materialsWithProjects.map(m => m.id === materialId ? {
          ...data,
          project_name: m.project_name,
          project_status: m.project_status
        } : m);
        
        // Actualizăm materialele proiectului
        const updatedProjectMaterials = { ...state.projectMaterials };
        if (data.project_id && updatedProjectMaterials[data.project_id]) {
          updatedProjectMaterials[data.project_id] = updatedProjectMaterials[data.project_id].map(m => 
            m.id === materialId ? data : m
          );
        }
        
        return {
          materials: updatedMaterials,
          currentMaterial: updatedCurrentMaterial,
          lowStockMaterials: updatedLowStockMaterials,
          materialsWithProjects: updatedMaterialsWithProjects,
          projectMaterials: updatedProjectMaterials,
          isLoading: false
        };
      });
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la actualizarea materialului' 
      });
      return null;
    }
  },
  
  deleteMaterial: async (materialId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Salvăm proiectul materialului înainte de ștergere
      const material = get().materials.find(m => m.id === materialId);
      const projectId = material?.project_id;
      
      const { error } = await materialService.delete(materialId);
      
      if (error) {
        set({ 
          isLoading: false, 
          error: error.message || 'Eroare la ștergerea materialului' 
        });
        return false;
      }
      
      // Eliminăm materialul din toate listele
      set(state => {
        // Eliminăm din lista generală de materiale
        const updatedMaterials = state.materials.filter(m => m.id !== materialId);
        
        // Resetăm materialul curent dacă este cel șters
        const updatedCurrentMaterial = state.currentMaterial?.id === materialId ? null : state.currentMaterial;
        
        // Eliminăm din lista de materiale cu stoc scăzut
        const updatedLowStockMaterials = state.lowStockMaterials.filter(m => m.id !== materialId);
        
        // Eliminăm din lista de materiale cu proiecte
        const updatedMaterialsWithProjects = state.materialsWithProjects.filter(m => m.id !== materialId);
        
        // Eliminăm din materialele proiectului
        const updatedProjectMaterials = { ...state.projectMaterials };
        if (projectId && updatedProjectMaterials[projectId]) {
          updatedProjectMaterials[projectId] = updatedProjectMaterials[projectId].filter(m => m.id !== materialId);
        }
        
        return {
          materials: updatedMaterials,
          currentMaterial: updatedCurrentMaterial,
          lowStockMaterials: updatedLowStockMaterials,
          materialsWithProjects: updatedMaterialsWithProjects,
          projectMaterials: updatedProjectMaterials,
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la ștergerea materialului' 
      });
      return false;
    }
  },
  
  updateMaterialQuantity: async (materialId: string, quantity: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.updateMaterialQuantity(materialId, quantity);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la actualizarea cantității materialului' 
        });
        return false;
      }
      
      // Actualizăm materialul în toate listele
      await get().updateMaterial(materialId, data);
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la actualizarea cantității materialului' 
      });
      return false;
    }
  },
  
  transferMaterial: async (materialId: string, fromProjectId: string, toProjectId: string, quantity: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.transferMaterial(materialId, fromProjectId, toProjectId, quantity);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la transferul materialului' 
        });
        return false;
      }
      
      // Reîncărcăm materialele pentru ambele proiecte
      await get().fetchProjectMaterials(fromProjectId);
      await get().fetchProjectMaterials(toProjectId);
      
      // Reîncărcăm și lista generală de materiale
      await get().fetchMaterials();
      
      set({ isLoading: false });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la transferul materialului' 
      });
      return false;
    }
  },
  
  searchMaterials: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.searchMaterials(query);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la căutarea materialelor' 
        });
        return [];
      }
      
      set({ isLoading: false });
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la căutarea materialelor' 
      });
      return [];
    }
  },
  
  addProjectMaterial: async (projectId: string, material: Partial<Material>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await materialService.addProjectMaterial(projectId, material);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la adăugarea materialului în proiect' 
        });
        return null;
      }
      
      // Actualizăm lista de materiale
      set(state => {
        // Actualizăm lista generală de materiale
        const updatedMaterials = [...state.materials, data];
        
        // Actualizăm materialele proiectului
        const projectMaterials = state.projectMaterials[projectId] || [];
        const updatedProjectMaterials = {
          ...state.projectMaterials,
          [projectId]: [...projectMaterials, data]
        };
        
        return {
          materials: updatedMaterials,
          projectMaterials: updatedProjectMaterials,
          currentMaterial: data,
          isLoading: false
        };
      });
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la adăugarea materialului în proiect' 
      });
      return null;
    }
  },
  
  clearError: () => set({ error: null }),
  
  setLoading: (isLoading: boolean) => set({ isLoading })
}));

export default useMaterialStore;
