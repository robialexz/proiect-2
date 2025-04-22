// Mock for inventory service
export const inventoryService = {
  getItems: jest.fn().mockResolvedValue({ data: [], error: null }),
  createItem: jest.fn().mockResolvedValue({ data: { id: '1', name: 'Test Material' }, error: null }),
  updateItem: jest.fn().mockResolvedValue({ data: { id: '1', name: 'Updated Material' }, error: null }),
  deleteItem: jest.fn().mockResolvedValue({ data: null, error: null }),
  confirmSuplimentar: jest.fn().mockResolvedValue({ data: null, error: null }),
  generateReorderList: jest.fn().mockResolvedValue({ data: [], error: null }),
  exportInventory: jest.fn().mockResolvedValue({ data: null, error: null }),
};
