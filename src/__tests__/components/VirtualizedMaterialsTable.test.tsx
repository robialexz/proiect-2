import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import VirtualizedMaterialsTable from '../../components/inventory/VirtualizedMaterialsTable';
import { Material } from '../../types';

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 10); i++) {
      items.push(children({ index: i, style: {}, data: itemData }));
    }
    return <div data-testid="virtualized-list">{items}</div>;
  },
}));

// Sample materials data
const sampleMaterials: Material[] = [
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
];

// Mock functions
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnSort = jest.fn();
const mockOnPageChange = jest.fn();
const mockOnConfirmSuplimentar = jest.fn();

// Default props
const defaultProps = {
  materials: sampleMaterials,
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
  },
  sort: {
    field: 'name',
    direction: 'asc' as 'asc' | 'desc',
  },
  onEdit: mockOnEdit,
  onDelete: mockOnDelete,
  onSort: mockOnSort,
  onPageChange: mockOnPageChange,
  onConfirmSuplimentar: mockOnConfirmSuplimentar,
};

// Setup test component with i18n provider
const TestComponent = (props = defaultProps) => (
  <I18nextProvider i18n={i18n}>
    <VirtualizedMaterialsTable {...props} />
  </I18nextProvider>
);

describe('VirtualizedMaterialsTable', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the table with materials', () => {
    render(<TestComponent />);

    // Check if the table headers are rendered
    expect(screen.getByText(/ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Nume/i)).toBeInTheDocument();
    expect(screen.getByText(/Cantitate/i)).toBeInTheDocument();
    expect(screen.getByText(/Categorie/i)).toBeInTheDocument();
    expect(screen.getByText(/Locație/i)).toBeInTheDocument();
    expect(screen.getByText(/Preț/i)).toBeInTheDocument();
    expect(screen.getByText(/Acțiuni/i)).toBeInTheDocument();

    // Check if the materials are rendered
    expect(screen.getByText(/Material 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Material 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Material 3/i)).toBeInTheDocument();

    // Check if the virtualized list is rendered
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });

  test('displays loading skeleton when loading', () => {
    const props = { ...defaultProps, loading: true };
    render(<TestComponent {...props} />);

    // Check if loading skeletons are displayed
    const skeletons = screen.getAllByRole('cell');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('displays empty state when no materials are available', () => {
    const props = { ...defaultProps, materials: [] };
    render(<TestComponent {...props} />);

    // Check if the empty state message is displayed
    expect(screen.getByText(/Nu există materiale în inventar/i)).toBeInTheDocument();
    expect(screen.getByText(/Adaugă material/i)).toBeInTheDocument();
  });

  test('highlights materials with low stock', () => {
    render(<TestComponent />);

    // Material 2 has quantity (3) less than min_stock_level (5)
    const lowStockMaterial = screen.getByText(/3 kg/i);
    expect(lowStockMaterial).toHaveClass('text-destructive');

    // Check if the alert icon is displayed
    const alertIcons = screen.getAllByTestId('alert-triangle-icon');
    expect(alertIcons.length).toBeGreaterThan(0);
  });

  test('displays supplementary quantity badge', () => {
    render(<TestComponent />);

    // Material 2 has supplementary quantity
    const supplementaryBadge = screen.getByText(/\+2 kg/i);
    expect(supplementaryBadge).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<TestComponent />);

    // Find and click the edit button for Material 1
    const editButtons = screen.getAllByTitle(/Editează/i);
    fireEvent.click(editButtons[0]);

    // Check if onEdit was called with the correct material
    expect(mockOnEdit).toHaveBeenCalledWith(sampleMaterials[0]);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TestComponent />);

    // Find and click the delete button for Material 1
    const deleteButtons = screen.getAllByTitle(/Șterge/i);
    fireEvent.click(deleteButtons[0]);

    // Check if onDelete was called with the correct material
    expect(mockOnDelete).toHaveBeenCalledWith(sampleMaterials[0]);
  });

  test('calls onConfirmSuplimentar when confirm button is clicked', () => {
    render(<TestComponent />);

    // Find and click the confirm button for Material 2 (which has supplementary quantity)
    const confirmButtons = screen.getAllByTitle(/Confirmă cantitatea suplimentară/i);
    fireEvent.click(confirmButtons[0]);

    // Check if onConfirmSuplimentar was called with the correct material ID
    expect(mockOnConfirmSuplimentar).toHaveBeenCalledWith(sampleMaterials[1].id);
  });

  test('calls onSort when sort header is clicked', () => {
    render(<TestComponent />);

    // Find and click the name sort header
    const nameSortHeader = screen.getByText(/Nume/i).closest('button');
    fireEvent.click(nameSortHeader);

    // Check if onSort was called with the correct field
    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  test('renders pagination when there are multiple pages', () => {
    render(
      <TestComponent
        {...defaultProps}
        pagination={{
          page: 1,
          limit: 2,
          total: 5,
        }}
      />
    );

    // Check if pagination is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Click on page 2
    fireEvent.click(screen.getByText('2'));

    // Check if onPageChange was called with the correct page
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  test('does not render pagination when there is only one page', () => {
    render(
      <TestComponent
        {...defaultProps}
        pagination={{
          page: 1,
          limit: 10,
          total: 3,
        }}
      />
    );

    // Check if pagination is not rendered
    const paginationElement = screen.queryByRole('navigation');
    expect(paginationElement).not.toBeInTheDocument();
  });
});
