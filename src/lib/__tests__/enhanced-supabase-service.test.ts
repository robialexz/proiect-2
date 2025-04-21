import { enhancedSupabaseService } from '../enhanced-supabase-service';
import { supabase } from '../supabase';
import { dataLoader } from '../data-loader';
import { errorHandler } from '../error-handler';

// Mock dependencies
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({
      unsubscribe: jest.fn()
    }),
    rpc: jest.fn().mockReturnThis(),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn()
      })
    },
    auth: {
      getSession: jest.fn(),
      refreshSession: jest.fn()
    }
  }
}));

jest.mock('../data-loader', () => ({
  dataLoader: {
    invalidateCache: jest.fn(),
    loadData: jest.fn(),
    generateTestData: jest.fn()
  }
}));

jest.mock('../error-handler', () => ({
  errorHandler: {
    handleError: jest.fn()
  }
}));

describe('Enhanced Supabase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    it('should upsert data successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: { id: '123', name: 'Test' },
        error: null
      };
      
      // Setup the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.upsert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await enhancedSupabaseService.upsert('materials', { name: 'Test' });
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('materials');
      expect(supabase.upsert).toHaveBeenCalledWith({ name: 'Test' }, { onConflict: 'id', returning: 'representation' });
      expect(dataLoader.invalidateCache).toHaveBeenCalledWith('materials');
      expect(result).toEqual({
        data: { id: '123', name: 'Test' },
        error: null,
        status: 'success'
      });
    });

    it('should handle errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await enhancedSupabaseService.upsert('materials', { name: 'Test' });
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

  describe('paginate', () => {
    it('should paginate data successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [{ id: '123', name: 'Test' }],
        error: null,
        count: 10
      };
      
      // Setup the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue(mockResponse);

      // Call the method
      try {
      const result = await enhancedSupabaseService.paginate('materials', '*', 1, 10, {
      } catch (error) {
        // Handle error appropriately
      }
        order: { column: 'name', ascending: true }
      });

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('materials');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.range).toHaveBeenCalledWith(0, 9);
      expect(supabase.order).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toEqual({
        data: [{ id: '123', name: 'Test' }],
        total: 10,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        error: null,
        status: 'success'
      });
    });

    it('should handle pagination errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await enhancedSupabaseService.paginate('materials', '*', 1, 10);
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(result).toEqual({
        data: null,
        total: null,
        page: 1,
        pageSize: 10,
        totalPages: null,
        error: {
          message: 'Test error',
          details: expect.any(String),
          code: 'client_error'
        },
        status: 'error'
      });
    });
  });

  describe('subscribe', () => {
    it('should create a subscription successfully', () => {
      // Mock the callback
      const mockCallback = jest.fn();
      
      // Setup the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.on as jest.Mock).mockReturnThis();
      (supabase.subscribe as jest.Mock).mockReturnValue({
        unsubscribe: jest.fn()
      });

      // Call the method
      const subscription = enhancedSupabaseService.subscribe('materials', 'INSERT', mockCallback);

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('materials');
      expect(supabase.on).toHaveBeenCalledWith('INSERT', expect.any(Function));
      expect(supabase.subscribe).toHaveBeenCalled();
      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should handle subscription errors', () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Mock the callback
      const mockCallback = jest.fn();

      // Call the method
      const subscription = enhancedSupabaseService.subscribe('materials', 'INSERT', mockCallback);

      // Assertions
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError, false);
      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });
  });

  describe('export', () => {
    it('should export data as CSV successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test 1' },
          { id: '456', name: 'Test 2' }
        ],
        error: null
      };
      
      // Setup the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue(mockResponse);

      // Mock Blob constructor
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      })) as any;

      // Call the method
      try {
      const result = await enhancedSupabaseService.export('materials', 'csv');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('materials');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should export data as JSON successfully', async () => {
      // Mock the response
      const mockResponse = {
        data: [
          { id: '123', name: 'Test 1' },
          { id: '456', name: 'Test 2' }
        ],
        error: null
      };
      
      // Setup the mock
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockResolvedValue(mockResponse);

      // Mock Blob constructor
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      })) as any;

      // Call the method
      try {
      const result = await enhancedSupabaseService.export('materials', 'json');
      } catch (error) {
        // Handle error appropriately
      }

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('materials');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle export errors', async () => {
      // Mock the error
      const mockError = new Error('Test error');
      
      // Setup the mock to throw an error
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Call the method
      try {
      const result = await enhancedSupabaseService.export('materials', 'csv');
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
});
