import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/lib/inventory-service';
import { 
  MaterialWithProject, 
  InventoryFilters, 
  InventorySort, 
  InventoryPagination 
} from '@/models/inventory';
import { Project } from '@/models/project';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/lib/project-service';

export function useProjectInventory(projectId?: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState<MaterialWithProject[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>(projectId ? { project: projectId } : {});
  const [sort, setSort] = useState<InventorySort>({ field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState<InventoryPagination>({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState({
    materials: false,
    projects: false,
    material: false,
    operation: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Încărcăm proiectele
  const loadProjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    
    try {
      const projectsData = await projectService.getAllProjects();
      setProjects(projectsData);
      
      // Dacă avem un ID de proiect și nu avem un proiect selectat, îl selectăm
      if (projectId && !selectedProject) {
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
        }
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.loadProjectsFailed', 'Failed to load projects'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, [projectId, selectedProject, t, toast]);
  
  // Încărcăm materialele
  const loadMaterials = useCallback(async () => {
    setLoading(prev => ({ ...prev, materials: true }));
    setError(null);
    
    try {
      const { data, pagination: newPagination } = await inventoryService.getAllMaterials(
        filters,
        sort,
        pagination
      );
      
      setMaterials(data);
      setPagination(newPagination);
    } catch (err) {
      setError(t('inventory.errors.loadFailed', 'Failed to load inventory data'));
      toast({
        variant: 'destructive',
        title: t('inventory.errors.loadFailed', 'Failed to load inventory data'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, materials: false }));
    }
  }, [filters, sort, pagination, t, toast]);
  
  // Încărcăm materialele și proiectele la inițializare
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  // Încărcăm materialele când se schimbă filtrele, sortarea sau paginarea
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);
  
  // Actualizăm filtrele când se schimbă proiectul selectat
  useEffect(() => {
    if (selectedProject) {
      setFilters(prev => ({ ...prev, project: selectedProject.id }));
    } else if (projectId) {
      setFilters(prev => ({ ...prev, project: projectId }));
    }
  }, [selectedProject, projectId]);
  
  // Obținem un material după ID
  const getMaterialById = useCallback(async (materialId: string) => {
    setLoading(prev => ({ ...prev, material: true }));
    
    try {
      const material = await inventoryService.getMaterialById(materialId);
      setSelectedMaterial(material);
      return material;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.getMaterialFailed', 'Failed to get material details'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, material: false }));
    }
  }, [t, toast]);
  
  // Creăm un material nou
  const createMaterial = useCallback(async (material: Partial<MaterialWithProject>) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      // Adăugăm ID-ul proiectului dacă avem un proiect selectat
      const materialWithProject = selectedProject 
        ? { ...material, project_id: selectedProject.id }
        : material;
      
      const newMaterial = await inventoryService.createMaterial(materialWithProject);
      
      toast({
        title: t('inventory.success.materialCreated', 'Material created'),
        description: t('inventory.success.materialCreatedDesc', 'The material has been successfully created')
      });
      
      // Reîncărcăm materialele
      await loadMaterials();
      
      return newMaterial;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.createMaterialFailed', 'Failed to create material'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [loadMaterials, selectedProject, t, toast]);
  
  // Actualizăm un material
  const updateMaterial = useCallback(async (materialId: string, material: Partial<MaterialWithProject>) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      const updatedMaterial = await inventoryService.updateMaterial(materialId, material);
      
      toast({
        title: t('inventory.success.materialUpdated', 'Material updated'),
        description: t('inventory.success.materialUpdatedDesc', 'The material has been successfully updated')
      });
      
      // Reîncărcăm materialele
      await loadMaterials();
      
      // Actualizăm materialul selectat dacă este cazul
      if (selectedMaterial && selectedMaterial.id === materialId) {
        setSelectedMaterial(updatedMaterial as MaterialWithProject);
      }
      
      return updatedMaterial;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.updateMaterialFailed', 'Failed to update material'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [loadMaterials, selectedMaterial, t, toast]);
  
  // Ștergem un material
  const deleteMaterial = useCallback(async (materialId: string) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await inventoryService.deleteMaterial(materialId);
      
      toast({
        title: t('inventory.success.materialDeleted', 'Material deleted'),
        description: t('inventory.success.materialDeletedDesc', 'The material has been successfully deleted')
      });
      
      // Reîncărcăm materialele
      await loadMaterials();
      
      // Resetăm materialul selectat dacă este cazul
      if (selectedMaterial && selectedMaterial.id === materialId) {
        setSelectedMaterial(null);
      }
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.deleteMaterialFailed', 'Failed to delete material'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [loadMaterials, selectedMaterial, t, toast]);
  
  // Transferăm un material între proiecte
  const transferMaterial = useCallback(async (
    materialId: string, 
    fromProjectId: string | null, 
    toProjectId: string | null,
    quantity: number,
    notes?: string
  ) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await inventoryService.recordMaterialMovement({
        material_id: materialId,
        from_project_id: fromProjectId,
        to_project_id: toProjectId,
        quantity,
        movement_type: 'transfer',
        notes,
        created_by: 'current_user' // Ar trebui înlocuit cu ID-ul utilizatorului curent
      });
      
      toast({
        title: t('inventory.success.materialTransferred', 'Material transferred'),
        description: t('inventory.success.materialTransferredDesc', 'The material has been successfully transferred')
      });
      
      // Reîncărcăm materialele
      await loadMaterials();
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.transferMaterialFailed', 'Failed to transfer material'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [loadMaterials, t, toast]);
  
  // Înregistrăm o mișcare de material
  const recordMaterialMovement = useCallback(async (
    materialId: string, 
    quantity: number, 
    type: 'receipt' | 'issue' | 'return' | 'adjustment' | 'transfer', 
    notes?: string
  ) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await inventoryService.recordMaterialMovement({
        material_id: materialId,
        quantity,
        movement_type: type,
        notes,
        created_by: 'current_user', // Ar trebui înlocuit cu ID-ul utilizatorului curent
        to_project_id: selectedProject?.id
      });
      
      toast({
        title: t('inventory.success.movementRecorded', 'Movement recorded'),
        description: t('inventory.success.movementRecordedDesc', 'The material movement has been successfully recorded')
      });
      
      // Reîncărcăm materialele
      await loadMaterials();
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.recordMovementFailed', 'Failed to record material movement'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [loadMaterials, selectedProject, t, toast]);
  
  // Exportăm inventarul
  const exportInventory = useCallback(async () => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      const data = await inventoryService.generateInventoryReport(filters);
      
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
      
      // Creăm un blob și descărcăm fișierul
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-inventory-${selectedProject?.name || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t('inventory.success.exportComplete', 'Export complete'),
        description: t('inventory.success.exportCompleteDesc', 'The inventory has been successfully exported')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.exportFailed', 'Failed to export inventory'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [filters, selectedProject, t, toast]);
  
  return {
    materials,
    selectedMaterial,
    selectedProject,
    projects,
    filters,
    sort,
    pagination,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    setSelectedProject,
    loadProjects,
    loadMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    transferMaterial,
    recordMaterialMovement,
    exportInventory,
    setSelectedMaterial
  };
}
