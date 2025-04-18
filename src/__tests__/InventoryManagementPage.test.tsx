import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import InventoryManagementPage from '../pages/InventoryManagementPage';
import { AuthProvider } from '../contexts/AuthContext';
import { RoleProvider } from '../contexts/RoleContext';
import { AdvancedRoleProvider } from '../contexts/AdvancedRoleContext';
import { OfflineProvider } from '../contexts/OfflineContext';

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({ data: [], error: null })),
  },
}));

// Mock the inventory service
jest.mock('../lib/inventory-service', () => ({
  inventoryService: {
    getItems: jest.fn().mockResolvedValue({ data: [], error: null }),
    createItem: jest.fn().mockResolvedValue({ data: { id: '1', name: 'Test Material' }, error: null }),
    updateItem: jest.fn().mockResolvedValue({ data: { id: '1', name: 'Updated Material' }, error: null }),
    deleteItem: jest.fn().mockResolvedValue({ data: null, error: null }),
    confirmSuplimentar: jest.fn().mockResolvedValue({ data: null, error: null }),
    generateReorderList: jest.fn().mockResolvedValue({ data: [], error: null }),
    exportInventory: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock the useToast hook
jest.mock('../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Setup test component with all required providers
const TestComponent = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RoleProvider>
          <AdvancedRoleProvider>
            <OfflineProvider>
              <InventoryManagementPage />
            </OfflineProvider>
          </AdvancedRoleProvider>
        </RoleProvider>
      </AuthProvider>
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
    expect(screen.getByText(/Selectează proiect/i)).toBeInTheDocument();
    expect(screen.getByText(/Materiale/i)).toBeInTheDocument();
    expect(screen.getByText(/Statistici/i)).toBeInTheDocument();
  });

  test('displays empty state when no materials are available', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Inventar/i)).toBeInTheDocument();
    });
    
    // Check if the empty state message is displayed
    expect(screen.getByText(/Nu există materiale în inventar/i)).toBeInTheDocument();
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
});
