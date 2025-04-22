import { renderHook, act } from '@testing-library/react-hooks';
import { useInventory } from '../../hooks/useInventory';
import { inventoryService } from '../../lib/inventory-service';

// Mock the inventory service
jest.mock('../../lib/inventory-service', () => ({
  inventoryService: {
    getItems: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    confirmSuplimentar: jest.fn(),
    generateReorderList: jest.fn(),
    exportInventory: jest.fn(),
  },
}));

// Mock the toast notifications
jest.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('useInventory', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the getItems function to return sample data
    inventoryService.getItems.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Material 1',
          quantity: 10,
          unit: 'pcs',
          category: 'Category A',
          location: 'Warehouse A',
          cost_per_unit: 100,
          min_stock_level: 5,
          max_stock_level: 20,
        },
        {
          id: '2',
          name: 'Material 2',
          quantity: 3,
          unit: 'kg',
          category: 'Category B',
          location: 'Warehouse B',
          cost_per_unit: 50,
          min_stock_level: 5,
          max_stock_level: 15,
          suplimentar: 2,
        },
        {
          id: '3',
          name: 'Material 3',
          quantity: 20,
          unit: 'm',
          category: 'Category A',
          location: 'Warehouse C',
          cost_per_unit: 75,
        },
      ],
      error: null,
    });
  });

  test('loads materials on initialization', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Initially, loading should be true and materials should be empty
    expect(result.current.loading).toBe(true);
    expect(result.current.materials).toEqual([]);
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // After loading, loading should be false and materials should be populated
    expect(result.current.loading).toBe(false);
    expect(result.current.materials.length).toBe(3);
    expect(result.current.categories).toEqual(['Category A', 'Category B']);
  });

  test('handles filter changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Change the search filter
    act(() => {
      result.current.handleFilterChange('search', 'Material 1');
    });
    
    // Check if the filter was updated
    expect(result.current.filters.search).toBe('Material 1');
    
    // Check if the paginated materials were filtered
    expect(result.current.paginatedMaterials.length).toBe(1);
    expect(result.current.paginatedMaterials[0].name).toBe('Material 1');
    
    // Change the category filter
    act(() => {
      result.current.handleFilterChange('category', 'Category A');
    });
    
    // Check if the filter was updated
    expect(result.current.filters.category).toBe('Category A');
    
    // Check if the paginated materials were filtered
    expect(result.current.paginatedMaterials.length).toBe(1);
    expect(result.current.paginatedMaterials[0].name).toBe('Material 1');
    
    // Clear the search filter
    act(() => {
      result.current.handleFilterChange('search', '');
    });
    
    // Check if the paginated materials were filtered by category only
    expect(result.current.paginatedMaterials.length).toBe(2);
    expect(result.current.paginatedMaterials[0].category).toBe('Category A');
    expect(result.current.paginatedMaterials[1].category).toBe('Category A');
  });

  test('handles sorting', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Sort by name ascending (default)
    expect(result.current.sort.field).toBe('name');
    expect(result.current.sort.direction).toBe('asc');
    expect(result.current.paginatedMaterials[0].name).toBe('Material 1');
    expect(result.current.paginatedMaterials[1].name).toBe('Material 2');
    expect(result.current.paginatedMaterials[2].name).toBe('Material 3');
    
    // Sort by name descending
    act(() => {
      result.current.handleSort('name');
    });
    
    // Check if the sort was updated
    expect(result.current.sort.field).toBe('name');
    expect(result.current.sort.direction).toBe('desc');
    expect(result.current.paginatedMaterials[0].name).toBe('Material 3');
    expect(result.current.paginatedMaterials[1].name).toBe('Material 2');
    expect(result.current.paginatedMaterials[2].name).toBe('Material 1');
    
    // Sort by quantity ascending
    act(() => {
      result.current.handleSort('quantity');
    });
    
    // Check if the sort was updated
    expect(result.current.sort.field).toBe('quantity');
    expect(result.current.sort.direction).toBe('asc');
    expect(result.current.paginatedMaterials[0].quantity).toBe(3);
    expect(result.current.paginatedMaterials[1].quantity).toBe(10);
    expect(result.current.paginatedMaterials[2].quantity).toBe(20);
  });

  test('handles pagination', async () => {
    // Mock the getItems function to return more data
    inventoryService.getItems.mockResolvedValue({
      data: Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Material ${i + 1}`,
        quantity: 10,
        unit: 'pcs',
        category: i % 2 === 0 ? 'Category A' : 'Category B',
      })),
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Check initial pagination
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.limit).toBe(10);
    expect(result.current.pagination.total).toBe(25);
    expect(result.current.paginatedMaterials.length).toBe(10);
    expect(result.current.paginatedMaterials[0].name).toBe('Material 1');
    
    // Change to page 2
    act(() => {
      result.current.handlePageChange(2);
    });
    
    // Check if the pagination was updated
    expect(result.current.pagination.page).toBe(2);
    expect(result.current.paginatedMaterials.length).toBe(10);
    expect(result.current.paginatedMaterials[0].name).toBe('Material 11');
    
    // Change to page 3
    act(() => {
      result.current.handlePageChange(3);
    });
    
    // Check if the pagination was updated
    expect(result.current.pagination.page).toBe(3);
    expect(result.current.paginatedMaterials.length).toBe(5);
    expect(result.current.paginatedMaterials[0].name).toBe('Material 21');
  });

  test('creates a new material', async () => {
    // Mock the createItem function to return success
    inventoryService.createItem.mockResolvedValue({
      data: {
        id: '4',
        name: 'New Material',
        quantity: 5,
        unit: 'pcs',
        category: 'Category C',
      },
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Create a new material
    const newMaterial = {
      name: 'New Material',
      quantity: 5,
      unit: 'pcs',
      category: 'Category C',
    };
    
    let createResult;
    await act(async () => {
      createResult = await result.current.createMaterial(newMaterial);
    });
    
    // Check if the createItem function was called with the correct data
    expect(inventoryService.createItem).toHaveBeenCalledWith(newMaterial);
    
    // Check if the function returned success
    expect(createResult.success).toBe(true);
    
    // Check if the materials were reloaded
    expect(inventoryService.getItems).toHaveBeenCalledTimes(2);
  });

  test('updates an existing material', async () => {
    // Mock the updateItem function to return success
    inventoryService.updateItem.mockResolvedValue({
      data: {
        id: '1',
        name: 'Updated Material',
        quantity: 15,
        unit: 'pcs',
        category: 'Category A',
      },
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Update an existing material
    const updatedMaterial = {
      name: 'Updated Material',
      quantity: 15,
    };
    
    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateMaterial('1', updatedMaterial);
    });
    
    // Check if the updateItem function was called with the correct data
    expect(inventoryService.updateItem).toHaveBeenCalledWith('1', updatedMaterial);
    
    // Check if the function returned success
    expect(updateResult.success).toBe(true);
    
    // Check if the materials were reloaded
    expect(inventoryService.getItems).toHaveBeenCalledTimes(2);
  });

  test('deletes a material', async () => {
    // Mock the deleteItem function to return success
    inventoryService.deleteItem.mockResolvedValue({
      data: null,
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Delete a material
    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteMaterial('1');
    });
    
    // Check if the deleteItem function was called with the correct ID
    expect(inventoryService.deleteItem).toHaveBeenCalledWith('1');
    
    // Check if the function returned success
    expect(deleteResult.success).toBe(true);
    
    // Check if the materials were reloaded
    expect(inventoryService.getItems).toHaveBeenCalledTimes(2);
  });

  test('confirms supplementary quantity', async () => {
    // Mock the confirmSuplimentar function to return success
    inventoryService.confirmSuplimentar.mockResolvedValue({
      data: null,
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Confirm supplementary quantity
    let confirmResult;
    await act(async () => {
      confirmResult = await result.current.confirmSuplimentar('2');
    });
    
    // Check if the confirmSuplimentar function was called with the correct ID
    expect(inventoryService.confirmSuplimentar).toHaveBeenCalledWith('2');
    
    // Check if the function returned success
    expect(confirmResult.success).toBe(true);
    
    // Check if the materials were reloaded
    expect(inventoryService.getItems).toHaveBeenCalledTimes(2);
  });

  test('generates reorder list', async () => {
    // Mock the generateReorderList function to return success
    inventoryService.generateReorderList.mockResolvedValue({
      data: [
        {
          id: '2',
          name: 'Material 2',
          quantity: 3,
          unit: 'kg',
          min_stock_level: 5,
          max_stock_level: 15,
        },
      ],
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Generate reorder list
    let reorderResult;
    await act(async () => {
      reorderResult = await result.current.generateReorderList();
    });
    
    // Check if the generateReorderList function was called
    expect(inventoryService.generateReorderList).toHaveBeenCalled();
    
    // Check if the function returned success and data
    expect(reorderResult.success).toBe(true);
    expect(reorderResult.data.length).toBe(1);
    expect(reorderResult.data[0].name).toBe('Material 2');
  });

  test('exports inventory', async () => {
    // Mock the exportInventory function to return success
    inventoryService.exportInventory.mockResolvedValue({
      data: { url: '{process.env.EXAMPLE_COM_EXPORT}' },
      error: null,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Export inventory
    let exportResult;
    await act(async () => {
      exportResult = await result.current.exportInventory('csv');
    });
    
    // Check if the exportInventory function was called with the correct format
    expect(inventoryService.exportInventory).toHaveBeenCalledWith('csv');
    
    // Check if the function returned success
    expect(exportResult.success).toBe(true);
  });

  test('handles errors', async () => {
    // Mock the getItems function to return an error
    inventoryService.getItems.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to load materials' },
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useInventory());
    
    // Wait for the materials to load
    await waitForNextUpdate();
    
    // Check if the error was set
    expect(result.current.error).toBe('Failed to load materials');
    expect(result.current.materials).toEqual([]);
  });
});
