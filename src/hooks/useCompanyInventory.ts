import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/lib/inventory-service';
import { 
  MaterialWithProject, 
  InventoryFilters, 
  InventorySort, 
  InventoryPagination 
} from '@/models/inventory';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export function useCompanyInventory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState<MaterialWithProject[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithProject | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [sort, setSort] = useState<InventorySort>({ field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState<InventoryPagination>({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Încărcăm materialele
  const loadMaterials = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [filters, sort, pagination, t, toast]);
  
  // Încărcăm materialele la inițializare și când se schimbă filtrele, sortarea sau paginarea
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);
  
  // Obținem un material după ID
  const getMaterialById = useCallback(async (materialId: string) => {
    setLoading(true);
    
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
      setLoading(false);
    }
  }, [t, toast]);
  
  // Creăm un material nou
  const createMaterial = useCallback(async (material: Partial<MaterialWithProject>) => {
    setLoading(true);
    
    try {
      const newMaterial = await inventoryService.createMaterial(material);
      
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
      setLoading(false);
    }
  }, [loadMaterials, t, toast]);
  
  // Actualizăm un material
  const updateMaterial = useCallback(async (materialId: string, material: Partial<MaterialWithProject>) => {
    setLoading(true);
    
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
      setLoading(false);
    }
  }, [loadMaterials, selectedMaterial, t, toast]);
  
  // Ștergem un material
  const deleteMaterial = useCallback(async (materialId: string) => {
    setLoading(true);
    
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
      setLoading(false);
    }
  }, [loadMaterials, selectedMaterial, t, toast]);
  
  // Exportăm inventarul
  const exportInventory = useCallback(async () => {
    setLoading(true);
    
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
      link.setAttribute('download', `company-inventory-${new Date().toISOString().split('T')[0]}.csv`);
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
      setLoading(false);
    }
  }, [filters, t, toast]);
  
  // Obținem materialele cu stoc scăzut
  const getLowStockMaterials = useCallback(async () => {
    setLoading(true);
    
    try {
      const lowStockMaterials = await inventoryService.getLowStockMaterials();
      
      return lowStockMaterials;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('inventory.errors.getLowStockFailed', 'Failed to get low stock materials'),
        description: err instanceof Error ? err.message : String(err)
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [t, toast]);
  
  // Înregistrăm o mișcare de material
  const recordMaterialMovement = useCallback(async (materialId: string, quantity: number, type: 'receipt' | 'issue' | 'return' | 'adjustment' | 'transfer', notes?: string) => {
    setLoading(true);
    
    try {
      await inventoryService.recordMaterialMovement({
        material_id: materialId,
        quantity,
        movement_type: type,
        notes,
        created_by: 'current_user' // Ar trebui înlocuit cu ID-ul utilizatorului curent
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
      setLoading(false);
    }
  }, [loadMaterials, t, toast]);
  
  return {
    materials,
    selectedMaterial,
    filters,
    sort,
    pagination,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    exportInventory,
    getLowStockMaterials,
    recordMaterialMovement,
    setSelectedMaterial
  };
}
