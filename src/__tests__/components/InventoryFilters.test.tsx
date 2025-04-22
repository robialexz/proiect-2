// React is imported globally in jest.setup.js
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import InventoryFilters from '../../components/inventory/InventoryFilters';

// Mock functions
const mockOnFilterChange = jest.fn();

// Sample categories
const categories = ['Category A', 'Category B', 'Category C'];

// Sample suppliers
const suppliers = ['Supplier A', 'Supplier B', 'Supplier C'];

// Test component wrapper
const TestComponent = () => (
  <I18nextProvider i18n={i18n}>
    <InventoryFilters
      categories={categories}
      suppliers={suppliers}
      onFilterChange={mockOnFilterChange}
    />
  </I18nextProvider>
);

describe('InventoryFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the filter components', () => {
    render(<TestComponent />);
    
    // Check if the filter title is rendered
    expect(screen.getByText('inventory.filters.title')).toBeInTheDocument();
    
    // Check if the search input is rendered
    expect(screen.getByPlaceholderText('inventory.filters.searchPlaceholder')).toBeInTheDocument();
    
    // Check if the category filter is rendered
    expect(screen.getByText('inventory.filters.category')).toBeInTheDocument();
    
    // Check if the supplier filter is rendered
    expect(screen.getByText('inventory.filters.supplier')).toBeInTheDocument();
    
    // Check if the stock filter is rendered
    expect(screen.getByText('inventory.filters.stock')).toBeInTheDocument();
  });

  test('calls onFilterChange when search input changes', () => {
    render(<TestComponent />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('inventory.filters.searchPlaceholder');
    
    // Change the search input value
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Check if onFilterChange was called with the correct filter
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      search: 'test',
    }));
  });

  test('calls onFilterChange when category filter changes', () => {
    render(<TestComponent />);
    
    // Get the category select
    const categorySelect = screen.getByLabelText('inventory.filters.category');
    
    // Change the category select value
    fireEvent.change(categorySelect, { target: { value: 'Category A' } });
    
    // Check if onFilterChange was called with the correct filter
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      category: 'Category A',
    }));
  });

  test('calls onFilterChange when supplier filter changes', () => {
    render(<TestComponent />);
    
    // Get the supplier select
    const supplierSelect = screen.getByLabelText('inventory.filters.supplier');
    
    // Change the supplier select value
    fireEvent.change(supplierSelect, { target: { value: 'Supplier B' } });
    
    // Check if onFilterChange was called with the correct filter
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      supplier: 'Supplier B',
    }));
  });

  test('calls onFilterChange when stock filter changes', () => {
    render(<TestComponent />);
    
    // Get the stock select
    const stockSelect = screen.getByLabelText('inventory.filters.stock');
    
    // Change the stock select value
    fireEvent.change(stockSelect, { target: { value: 'low' } });
    
    // Check if onFilterChange was called with the correct filter
    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
      stock: 'low',
    }));
  });

  test('resets filters when reset button is clicked', () => {
    render(<TestComponent />);
    
    // Get the reset button
    const resetButton = screen.getByText('inventory.filters.reset');
    
    // Click the reset button
    fireEvent.click(resetButton);
    
    // Check if onFilterChange was called with empty filters
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: '',
      category: '',
      supplier: '',
      stock: 'all',
    });
  });
});
