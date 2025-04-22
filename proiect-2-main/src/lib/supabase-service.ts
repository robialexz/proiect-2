import { supabase } from './supabase';
import { Resource, ResourceAllocation, ResourceMaintenance } from '@/types/supabase';
import { SupabaseTables } from '@/types/supabase-tables';
import { measureAsyncPerformance } from './performance-optimizer';

/**
 * Serviciu pentru interacțiunea cu Supabase
 */
class SupabaseService {
  /**
   * Obține toate resursele
   * @returns Lista de resurse
   */
  async getResources(): Promise<Resource[]> {
    return measureAsyncPerformance(
      'get-resources',
      async () => {
        try {
          // Folosim tabela materials în loc de resources (care nu există)
          const { data, error } = await supabase
            .from(SupabaseTables.MATERIALS)
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transformăm datele în formatul așteptat pentru Resource
          const resources: Resource[] = (data || []).map(material => ({
            id: material.id,
            name: material.name,
            description: material.description,
            type: material.type || 'material',
            status: this.mapMaterialStatusToResourceStatus(material.status),
            quantity: material.quantity,
            location: material.location,
            cost: material.price,
            supplier_id: material.supplier_id,
            created_at: material.created_at,
            updated_at: material.updated_at,
            created_by: material.created_by,
          }));

          return resources;
        } catch (error) {
          console.error('Error fetching resources:', error);
          throw error;
        }
      },
      'api',
      { endpoint: 'getResources' }
    );
  }

  /**
   * Mapează statusul materialului la statusul resursei
   * @param materialStatus Statusul materialului
   * @returns Statusul resursei
   */
  private mapMaterialStatusToResourceStatus(materialStatus?: string): Resource['status'] {
    switch (materialStatus) {
      case 'in_stock':
        return 'available';
      case 'allocated':
        return 'in_use';
      case 'out_of_stock':
        return 'retired';
      default:
        return 'available';
    }
  }

  /**
   * Creează o nouă resursă
   * @param resource Resursa de creat
   * @returns Resursa creată
   */
  async createResource(resource: Omit<Resource, 'id' | 'created_at'>): Promise<Resource> {
    return measureAsyncPerformance(
      'create-resource',
      async () => {
        try {
          // Transformăm resursa în formatul pentru materials
          const material = {
            name: resource.name,
            description: resource.description,
            type: resource.type,
            status: this.mapResourceStatusToMaterialStatus(resource.status),
            quantity: resource.quantity,
            location: resource.location,
            price: resource.cost,
            supplier_id: resource.supplier_id,
            created_by: resource.created_by,
          };

          // Inserăm materialul în tabela materials
          const { data, error } = await supabase
            .from(SupabaseTables.MATERIALS)
            .insert([material])
            .select();

          if (error) throw error;

          if (!data || data.length === 0) {
            throw new Error('Failed to create resource');
          }

          // Transformăm materialul creat în formatul pentru Resource
          const createdResource: Resource = {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            type: data[0].type || 'material',
            status: this.mapMaterialStatusToResourceStatus(data[0].status),
            quantity: data[0].quantity,
            location: data[0].location,
            cost: data[0].price,
            supplier_id: data[0].supplier_id,
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
            created_by: data[0].created_by,
          };

          return createdResource;
        } catch (error) {
          console.error('Error creating resource:', error);
          throw error;
        }
      },
      'api',
      { endpoint: 'createResource' }
    );
  }

  /**
   * Mapează statusul resursei la statusul materialului
   * @param resourceStatus Statusul resursei
   * @returns Statusul materialului
   */
  private mapResourceStatusToMaterialStatus(resourceStatus: Resource['status']): string {
    switch (resourceStatus) {
      case 'available':
        return 'in_stock';
      case 'in_use':
        return 'allocated';
      case 'retired':
        return 'out_of_stock';
      case 'maintenance':
        return 'in_stock';
      default:
        return 'in_stock';
    }
  }

  /**
   * Actualizează o resursă existentă
   * @param id ID-ul resursei
   * @param resource Datele de actualizat
   * @returns Resursa actualizată
   */
  async updateResource(id: string, resource: Partial<Resource>): Promise<Resource> {
    return measureAsyncPerformance(
      'update-resource',
      async () => {
        try {
          // Transformăm resursa în formatul pentru materials
          const material: any = {};
          
          if (resource.name) material.name = resource.name;
          if (resource.description !== undefined) material.description = resource.description;
          if (resource.type) material.type = resource.type;
          if (resource.status) material.status = this.mapResourceStatusToMaterialStatus(resource.status);
          if (resource.quantity !== undefined) material.quantity = resource.quantity;
          if (resource.location !== undefined) material.location = resource.location;
          if (resource.cost !== undefined) material.price = resource.cost;
          if (resource.supplier_id !== undefined) material.supplier_id = resource.supplier_id;

          // Actualizăm materialul în tabela materials
          const { data, error } = await supabase
            .from(SupabaseTables.MATERIALS)
            .update(material)
            .eq('id', id)
            .select();

          if (error) throw error;

          if (!data || data.length === 0) {
            throw new Error('Failed to update resource');
          }

          // Transformăm materialul actualizat în formatul pentru Resource
          const updatedResource: Resource = {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            type: data[0].type || 'material',
            status: this.mapMaterialStatusToResourceStatus(data[0].status),
            quantity: data[0].quantity,
            location: data[0].location,
            cost: data[0].price,
            supplier_id: data[0].supplier_id,
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
            created_by: data[0].created_by,
          };

          return updatedResource;
        } catch (error) {
          console.error('Error updating resource:', error);
          throw error;
        }
      },
      'api',
      { endpoint: 'updateResource' }
    );
  }

  /**
   * Șterge o resursă
   * @param id ID-ul resursei
   * @returns Rezultatul operațiunii
   */
  async deleteResource(id: string): Promise<{ success: boolean }> {
    return measureAsyncPerformance(
      'delete-resource',
      async () => {
        try {
          // Ștergem materialul din tabela materials
          const { error } = await supabase
            .from(SupabaseTables.MATERIALS)
            .delete()
            .eq('id', id);

          if (error) throw error;

          return { success: true };
        } catch (error) {
          console.error('Error deleting resource:', error);
          throw error;
        }
      },
      'api',
      { endpoint: 'deleteResource' }
    );
  }
}

// Exportăm o instanță a serviciului
const supabaseService = new SupabaseService();
export default supabaseService;
