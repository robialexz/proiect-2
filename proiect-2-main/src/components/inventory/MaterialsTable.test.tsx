import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MaterialsTable from './MaterialsTable';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

// Mock data
const mockMaterials = [
  {
    id: '1',
    name: 'Test Material 1',
    description: 'This is a test material',
    quantity: 10,
    unit: 'kg',
    category: 'raw',
    location: 'Warehouse A',
    cost_per_unit: 25.5,
    min_stock_level: 5,
    suplimentar: 0
  },
  {
    id: '2',
    name: 'Test Material 2',
    description: 'Another test material',
    quantity: 5,
    unit: 'pcs',
    category: 'finished',
    location: 'Warehouse B',
    cost_per_unit: 100,
    min_stock_level: 2,
    suplimentar: 3
  }
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2
};

const mockSort = {
  field: 'name',
  direction: 'asc' as const
};

// Mock handlers
const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onSort: jest.fn(),
  onPageChange: jest.fn(),
  onConfirmSuplimentar: jest.fn()
};

// Test wrapper with i18n provider
const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {ui}
    </I18nextProvider>
  );
};

describe('MaterialsTable Component', () => {
  it('renders loading skeleton when loading is true', () => {
    renderWithI18n(
      <MaterialsTable
        materials={[]}
        loading={true}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Check if skeletons are rendered
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no materials are provided', () => {
    renderWithI18n(
      <MaterialsTable
        materials={[]}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Check for empty state message
    expect(screen.getByText(/Nu există materiale în inventar/i)).toBeInTheDocument();
  });

  it('renders materials correctly', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Check if materials are rendered
    expect(screen.getByText('Test Material 1')).toBeInTheDocument();
    expect(screen.getByText('Test Material 2')).toBeInTheDocument();
    expect(screen.getByText('10 kg')).toBeInTheDocument();
    expect(screen.getByText('5 pcs')).toBeInTheDocument();
    expect(screen.getByText('Warehouse A')).toBeInTheDocument();
    expect(screen.getByText('Warehouse B')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Find all edit buttons
    const editButtons = screen.getAllByTitle(/Editează/i);
    
    // Click the first edit button
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with the correct material
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockMaterials[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByTitle(/Șterge/i);
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Check if onDelete was called with the correct material
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockMaterials[0]);
  });

  it('calls onSort when a sortable header is clicked', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Find the name header and click it
    const nameHeader = screen.getByText('Nume');
    fireEvent.click(nameHeader);
    
    // Check if onSort was called with the correct field
    expect(mockHandlers.onSort).toHaveBeenCalledWith('name');
  });

  it('renders pagination correctly when there are multiple pages', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={{
          page: 1,
          limit: 10,
          total: 25 // This will create multiple pages
        }}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Check if pagination is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onPageChange when a pagination link is clicked', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={{
          page: 1,
          limit: 10,
          total: 25 // This will create multiple pages
        }}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Find page 2 link and click it
    const page2Link = screen.getByText('2');
    fireEvent.click(page2Link);
    
    // Check if onPageChange was called with the correct page
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(2);
  });

  it('displays supplementary quantity badge when suplimentar > 0', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Check if supplementary badge is rendered for the second material
    expect(screen.getByText('+3 pcs')).toBeInTheDocument();
  });

  it('calls onConfirmSuplimentar when confirm button is clicked', () => {
    renderWithI18n(
      <MaterialsTable
        materials={mockMaterials}
        loading={false}
        pagination={mockPagination}
        sort={mockSort}
        {...mockHandlers}
      />
    );
    
    // Find confirm button and click it
    const confirmButtons = screen.getAllByTitle(/Confirmă cantitatea suplimentară/i);
    fireEvent.click(confirmButtons[0]);
    
    // Check if onConfirmSuplimentar was called with the correct id
    expect(mockHandlers.onConfirmSuplimentar).toHaveBeenCalledWith(mockMaterials[1].id);
  });
});
