// React is imported globally in jest.setup.js
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import MaterialsTable from '../../components/inventory/MaterialsTable';
import { Material } from '../../types';

// Sample materials data
const materials: Material[] = [
  {
    id: '1',
    name: 'Material 1',
    category: 'Category A',
    quantity: 10,
    unit: 'buc',
    price: 100,
    supplier: 'Supplier A',
    threshold: 5,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Material 2',
    category: 'Category B',
    quantity: 3,
    unit: 'kg',
    price: 200,
    supplier: 'Supplier B',
    threshold: 5,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Material 3',
    category: 'Category A',
    quantity: 20,
    unit: 'l',
    price: 150,
    supplier: 'Supplier A',
    threshold: 10,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Mock functions
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnConfirmSuplimentar = jest.fn();

// Test component wrapper
const TestComponent = () => (
  <I18nextProvider i18n={i18n}>
    <MaterialsTable
      materials={materials}
      onEdit={mockOnEdit}
      onDelete={mockOnDelete}
      onConfirmSuplimentar={mockOnConfirmSuplimentar}
    />
  </I18nextProvider>
);

describe('MaterialsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the table with materials', () => {
    render(<TestComponent />);
    
    // Check if the table headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('inventory.table.name')).toBeInTheDocument();
    expect(screen.getByText('inventory.table.category')).toBeInTheDocument();
    expect(screen.getByText('inventory.table.quantity')).toBeInTheDocument();
    expect(screen.getByText('inventory.table.price')).toBeInTheDocument();
    
    // Check if the materials are rendered
    expect(screen.getByText('Material 1')).toBeInTheDocument();
    expect(screen.getByText('Material 2')).toBeInTheDocument();
    expect(screen.getByText('Material 3')).toBeInTheDocument();
    
    // Check if the categories are rendered
    expect(screen.getByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<TestComponent />);
    
    // Find all edit buttons
    const editButtons = screen.getAllByRole('button', { name: '' });
    
    // Click the first edit button
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with the correct material
    expect(mockOnEdit).toHaveBeenCalledWith(materials[0]);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TestComponent />);
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    
    // Click the first delete button
    fireEvent.click(deleteButtons[1]);
    
    // Check if onDelete was called with the correct material
    expect(mockOnDelete).toHaveBeenCalledWith(materials[0]);
  });

  test('highlights materials with low stock', () => {
    render(<TestComponent />);
    
    // Material 2 has quantity 3, which is below its threshold of 5
    const lowStockRows = screen.getAllByRole('row');
    
    // Check if the low stock row has the correct class
    expect(lowStockRows[2]).toHaveClass('bg-red-50');
  });
});
