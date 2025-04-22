import { inventoryService } from '../inventory-service';
import { enhancedSupabaseService } from '../enhanced-supabase-service';
import { errorHandler } from '../error-handler';

// Mock dependencies
jest.mock('../enhanced-supabase-service', () => ({
  enhancedSupabaseService: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    custom: jest.fn(),
    export: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    paginate: jest.fn()
  }
}));

jest.mock('../error-handler', () => ({
  errorHandler: {
    handleError: jest.fn()
  }
}));

describe('Inventory Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItems', () => {
    it('should get all items successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test 1', quantity: 10 },
          { id: '456', name: 'Test 2', quantity: 20 }
        ],
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.select as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getItems();
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.select).toHaveBeenCalledWith(
        'materials',
        '*',
        {
          filters: {},
          order: undefined
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should filter items by project ID', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test 1', quantity: 10, project_id: 'project1' }
        ],
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.select as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getItems({ projectId: 'project1' });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.select).toHaveBeenCalledWith(
        'materials',
        '*',
        {
          filters: { project_id: 'project1' },
          order: undefined
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should search items by term', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test Search', quantity: 10 }
        ],
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.custom as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getItems({ searchTerm: 'search' });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.custom).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should paginate items', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test 1', quantity: 10 },
          { id: '456', name: 'Test 2', quantity: 20 }
        ],
        total: 10,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.paginate as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getItems({ page: 1, pageSize: 10 });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.paginate).toHaveBeenCalledWith(
        'materials',
        '*',
        1,
        10,
        {
          filters: {},
          order: undefined
        }
      );
      expect(result).toEqual({
        data: mockResponse.data,
        error: mockResponse.error,
        status: mockResponse.status
      });
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.select as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.getItems();
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('getItemById', () => {
    it('should get an item by ID successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: { id: '123', name: 'Test', quantity: 10 },
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.select as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getItemById('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.select).toHaveBeenCalledWith(
        'materials',
        '*',
        {
          filters: { id: '123' },
          single: true
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.select as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.getItemById('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('createItem', () => {
    it('should create an item successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: { id: '123', name: 'New Item', quantity: 10 },
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.insert as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.createItem({ name: 'New Item', quantity: 10 });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.insert).toHaveBeenCalledWith(
        'materials',
        { name: 'New Item', quantity: 10 }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.insert as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.createItem({ name: 'New Item', quantity: 10 });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('updateItem', () => {
    it('should update an item successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: { id: '123', name: 'Updated Item', quantity: 20 },
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.update as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.updateItem('123', { name: 'Updated Item', quantity: 20 });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.update).toHaveBeenCalledWith(
        'materials',
        { name: 'Updated Item', quantity: 20 },
        { id: '123' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.update as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.updateItem('123', { name: 'Updated Item' });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('deleteItem', () => {
    it('should delete an item successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: { id: '123', name: 'Deleted Item' },
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.delete as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.deleteItem('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.delete).toHaveBeenCalledWith(
        'materials',
        { id: '123' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.delete as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.deleteItem('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('getLowStockItems', () => {
    it('should get low stock items with threshold successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Low Stock Item', quantity: 5 }
        ],
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.custom as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getLowStockItems(10);
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.custom).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should get low stock items using min_stock_level successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Low Stock Item', quantity: 5, min_stock_level: 10 }
        ],
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.custom as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.getLowStockItems();
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.custom).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.custom as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.getLowStockItems();
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('confirmSuplimentar', () => {
    it('should confirm supplementary quantity successfully', async () => {
      // Mock the getItemById response
      const mockGetItemResponse = {
        data: { id: '123', name: 'Test', quantity: 10, suplimentar: 5 },
        error: null,
        status: 'success'
      };
      
      // Mock the update response
      const mockUpdateResponse = {
        data: { id: '123', name: 'Test', quantity: 15, suplimentar: 0 },
        error: null,
        status: 'success'
      };
      
      // Setup the mocks
      (enhancedSupabaseService.select as jest.Mock).mockResolvedValue(mockGetItemResponse);
      (enhancedSupabaseService.update as jest.Mock).mockResolvedValue(mockUpdateResponse);

      // Call the method
      try {
      const result = await inventoryService.confirmSuplimentar('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.select).toHaveBeenCalled();
      expect(enhancedSupabaseService.update).toHaveBeenCalledWith(
        'materials',
        { quantity: 15, suplimentar: 0 },
        { id: '123' }
      );
      expect(result).toEqual(mockUpdateResponse);
    });

    it('should handle errors when getting item', async () => {
      // Mock the error
      const mockError = {
        data: null,
        error: { message: 'Item not found' },
        status: 'error'
      };
      
      // Setup the mock
      (enhancedSupabaseService.select as jest.Mock).mockResolvedValue(mockError);

      // Call the method
      try {
      const result = await inventoryService.confirmSuplimentar('123');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.select).toHaveBeenCalled();
      expect(enhancedSupabaseService.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Item not found',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('exportInventory', () => {
    it('should export inventory as CSV successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: new Blob(),
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.export as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.exportInventory('csv');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(enhancedSupabaseService.export).toHaveBeenCalledWith(
        'materials',
        'csv',
        expect.objectContaining({
          filters: {},
          columns: expect.any(Array),
          fileName: expect.stringContaining('inventory-export-')
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should export inventory with filters successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: new Blob(),
        error: null,
        status: 'success'
      };
      
      // Setup the mock
      (enhancedSupabaseService.export as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await inventoryService.exportInventory('csv', {
      } catch (error) {
        // Handle error appropriately
      }
        projectId: 'project1',
        category: 'category1'
      });

      // Assertions
      expect(enhancedSupabaseService.export).toHaveBeenCalledWith(
        'materials',
        'csv',
        expect.objectContaining({
          filters: {
            project_id: 'project1',
            category: 'category1'
          },
          columns: expect.any(Array),
          fileName: expect.stringContaining('inventory-export-')
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.export as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await inventoryService.exportInventory('csv');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('subscribeToInventoryChanges', () => {
    it('should subscribe to inventory changes successfully', () => {
      // Mock the callback
      const mockCallback = jest.fn();
      
      // Mock the subscription
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      
      // Setup the mock
      (enhancedSupabaseService.subscribe as jest.Mock).mockReturnValue(mockSubscription);

      // Call the method
      const subscription = inventoryService.subscribeToInventoryChanges(mockCallback);

      // Assertions
      expect(enhancedSupabaseService.subscribe).toHaveBeenCalledWith(
        'materials',
        '*',
        mockCallback,
        {}
      );
      expect(subscription).toBe(mockSubscription);
    });

    it('should subscribe with filters successfully', () => {
      // Mock the callback
      const mockCallback = jest.fn();
      
      // Mock the subscription
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      
      // Setup the mock
      (enhancedSupabaseService.subscribe as jest.Mock).mockReturnValue(mockSubscription);

      // Call the method
      const subscription = inventoryService.subscribeToInventoryChanges(mockCallback, {
        projectId: 'project1',
        event: 'UPDATE'
      });

      // Assertions
      expect(enhancedSupabaseService.subscribe).toHaveBeenCalledWith(
        'materials',
        'UPDATE',
        mockCallback,
        { project_id: 'project1' }
      );
      expect(subscription).toBe(mockSubscription);
    });

    it('should handle subscription errors', () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (enhancedSupabaseService.subscribe as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Mock the callback
      const mockCallback = jest.fn();

      // Call the method
      const subscription = inventoryService.subscribeToInventoryChanges(mockCallback);

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });
  });

  describe('unsubscribeFromInventoryChanges', () => {
    it('should unsubscribe from inventory changes successfully', () => {
      // Mock the subscription
      const mockSubscription = {
        unsubscribe: jest.fn()
      };
      
      // Call the method
      inventoryService.unsubscribeFromInventoryChanges(mockSubscription);

      // Assertions
      expect(enhancedSupabaseService.unsubscribe).toHaveBeenCalledWith(mockSubscription);
    });
  });
});
