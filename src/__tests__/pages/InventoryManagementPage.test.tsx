import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import InventoryManagementPage from '../../pages/InventoryManagementPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { RoleProvider } from '../../contexts/RoleContext';
import { AdvancedRoleProvider } from '../../contexts/AdvancedRoleContext';
import { OfflineProvider } from '../../contexts/OfflineContext';

// Import mocks
import { inventoryService } from '../../__mocks__/lib/inventory-service';

// Mock the useInventory hook
jest.mock('../../hooks/useInventory', () => ({
  useInventory: () => ({
    materials: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, total: 0 },
    sort: { field: 'name', direction: 'asc' },
    filters: { search: '', category: '', project: '' },
    categories: [],
    paginatedMaterials: [],
    loadMaterials: jest.fn(),
    createMaterial: jest.fn().mockResolvedValue({ success: true }),
    updateMaterial: jest.fn().mockResolvedValue({ success: true }),
    deleteMaterial: jest.fn().mockResolvedValue({ success: true }),
    confirmSuplimentar: jest.fn().mockResolvedValue({ success: true }),
    exportInventory: jest.fn().mockResolvedValue({ success: true }),
    generateReorderList: jest.fn().mockResolvedValue({ success: true, data: [] }),
    handleFilterChange: jest.fn(),
    handleSort: jest.fn(),
    handlePageChange: jest.fn(),
  }),
}));

// Mock the toast notifications
jest.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the Helmet component
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));

// Setup test component with all required providers
const TestComponent = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <RoleProvider>
            <AdvancedRoleProvider>
              <OfflineProvider>
                <InventoryManagementPage />
              </OfflineProvider>
            </AdvancedRoleProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

describe('InventoryManagementPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the inventory management page', async () => {
    render(<TestComponent />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });

    // Check if the main components are rendered
    expect(screen.getByText(/Gestionează materialele și stocurile/i)).toBeInTheDocument();
    expect(screen.getByText(/Materiale/i)).toBeInTheDocument();
    expect(screen.getByText(/Statistici/i)).toBeInTheDocument();
  });

  test('opens the add material dialog when add button is clicked', async () => {
    render(<TestComponent />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });

    // Find and click the add material button
    const addButton = screen.getByText(/Adaugă Material/i);
    fireEvent.click(addButton);

    // Check if the dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/Adaugă Material Nou/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no materials are available', async () => {
    // Mock the useInventory hook to return empty materials
    jest.mock('../../hooks/useInventory', () => ({
      useInventory: () => ({
        materials: [],
        loading: false,
        error: null,
        pagination: { page: 1, limit: 10, total: 0 },
        sort: { field: 'name', direction: 'asc' },
        filters: { search: '', category: '', project: '' },
        categories: [],
        paginatedMaterials: [],
        loadMaterials: jest.fn(),
        createMaterial: jest.fn(),
        updateMaterial: jest.fn(),
        deleteMaterial: jest.fn(),
        confirmSuplimentar: jest.fn(),
        exportInventory: jest.fn(),
        generateReorderList: jest.fn(),
        handleFilterChange: jest.fn(),
        handleSort: jest.fn(),
        handlePageChange: jest.fn(),
      }),
    }));

    render(<TestComponent />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });

    // Check if the empty state message is displayed
    expect(screen.getByText(/Nu există materiale în inventar/i)).toBeInTheDocument();
  });

  test('displays statistics correctly', async () => {
    render(<TestComponent />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });

    // Check if statistics are displayed
    expect(screen.getByText(/Total materiale/i)).toBeInTheDocument();
    expect(screen.getByText(/Categorii/i)).toBeInTheDocument();
    expect(screen.getByText(/Stoc scăzut/i)).toBeInTheDocument();
    expect(screen.getByText(/Ultima actualizare/i)).toBeInTheDocument();
  });

  test('handles material deletion', async () => {
    // Mock the useInventory hook
    const { useInventory } = require('../../hooks/useInventory');
    const mockDeleteMaterial = jest.fn().mockResolvedValue({ success: true });
    useInventory.mockReturnValue({
      materials: [{ id: '1', name: 'Test Material', quantity: 10, unit: 'pcs' }],
      loading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 1 },
      sort: { field: 'name', direction: 'asc' },
      filters: { search: '', category: '', project: '' },
      categories: [],
      paginatedMaterials: [{ id: '1', name: 'Test Material', quantity: 10, unit: 'pcs' }],
      loadMaterials: jest.fn(),
      createMaterial: jest.fn(),
      updateMaterial: jest.fn(),
      deleteMaterial: mockDeleteMaterial,
      confirmSuplimentar: jest.fn(),
      exportInventory: jest.fn(),
      generateReorderList: jest.fn(),
      handleFilterChange: jest.fn(),
      handleSort: jest.fn(),
      handlePageChange: jest.fn(),
    });

    render(<TestComponent />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByTitle(/Șterge/i);
    fireEvent.click(deleteButton);

    // Check if the confirmation dialog is opened
    await waitFor(() => {
      expect(screen.getByText(/Sunteți sigur/i)).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByText(/Confirmă/i);
    fireEvent.click(confirmButton);

    // Check if the deleteMaterial function was called with the correct ID
    await waitFor(() => {
      expect(mockDeleteMaterial).toHaveBeenCalledWith('1');
    });
  });
});
