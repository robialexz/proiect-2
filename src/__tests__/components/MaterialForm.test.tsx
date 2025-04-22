// React is imported globally in jest.setup.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import MaterialForm from '../../components/inventory/MaterialForm';
import { Material } from '../../types';

// Sample material data
const material: Material = {
  id: '1',
  name: 'Test Material',
  category: 'Test Category',
  quantity: 10,
  unit: 'buc',
  price: 100,
  supplier: 'Test Supplier',
  threshold: 5,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

// Mock functions
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

// Test component wrapper for adding a new material
const AddMaterialComponent = () => (
  <I18nextProvider i18n={i18n}>
    <MaterialForm onSave={mockOnSave} onCancel={mockOnCancel} />
  </I18nextProvider>
);

// Test component wrapper for editing an existing material
const EditMaterialComponent = () => (
  <I18nextProvider i18n={i18n}>
    <MaterialForm material={material} onSave={mockOnSave} onCancel={mockOnCancel} />
  </I18nextProvider>
);

describe('MaterialForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form for adding a new material', () => {
    render(<AddMaterialComponent />);
    
    // Check if the form title is rendered
    expect(screen.getByText('inventory.form.addMaterial')).toBeInTheDocument();
    
    // Check if the form fields are rendered
    expect(screen.getByLabelText('inventory.form.name')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.category')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.quantity')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.unit')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.price')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.supplier')).toBeInTheDocument();
    expect(screen.getByLabelText('inventory.form.threshold')).toBeInTheDocument();
    
    // Check if the buttons are rendered
    expect(screen.getByText('inventory.form.save')).toBeInTheDocument();
    expect(screen.getByText('inventory.form.cancel')).toBeInTheDocument();
  });

  test('renders the form for editing an existing material', () => {
    render(<EditMaterialComponent />);
    
    // Check if the form title is rendered
    expect(screen.getByText('inventory.form.editMaterial')).toBeInTheDocument();
    
    // Check if the form fields are filled with the material data
    expect(screen.getByLabelText('inventory.form.name')).toHaveValue('Test Material');
    expect(screen.getByLabelText('inventory.form.category')).toHaveValue('Test Category');
    expect(screen.getByLabelText('inventory.form.quantity')).toHaveValue(10);
    expect(screen.getByLabelText('inventory.form.unit')).toHaveValue('buc');
    expect(screen.getByLabelText('inventory.form.price')).toHaveValue(100);
    expect(screen.getByLabelText('inventory.form.supplier')).toHaveValue('Test Supplier');
    expect(screen.getByLabelText('inventory.form.threshold')).toHaveValue(5);
  });

  test('calls onSave when the form is submitted', async () => {
    render(<AddMaterialComponent />);
    
    // Fill the form fields
    fireEvent.change(screen.getByLabelText('inventory.form.name'), { target: { value: 'New Material' } });
    fireEvent.change(screen.getByLabelText('inventory.form.category'), { target: { value: 'New Category' } });
    fireEvent.change(screen.getByLabelText('inventory.form.quantity'), { target: { value: 20 } });
    fireEvent.change(screen.getByLabelText('inventory.form.unit'), { target: { value: 'kg' } });
    fireEvent.change(screen.getByLabelText('inventory.form.price'), { target: { value: 200 } });
    fireEvent.change(screen.getByLabelText('inventory.form.supplier'), { target: { value: 'New Supplier' } });
    fireEvent.change(screen.getByLabelText('inventory.form.threshold'), { target: { value: 10 } });
    
    // Submit the form
    fireEvent.click(screen.getByText('inventory.form.save'));
    
    // Check if onSave was called with the correct data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'New Material',
        category: 'New Category',
        quantity: 20,
        unit: 'kg',
        price: 200,
        supplier: 'New Supplier',
        threshold: 10,
      });
    });
  });

  test('calls onCancel when the cancel button is clicked', () => {
    render(<AddMaterialComponent />);
    
    // Click the cancel button
    fireEvent.click(screen.getByText('inventory.form.cancel'));
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    render(<AddMaterialComponent />);
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByText('inventory.form.save'));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('inventory.form.errors.required')).toBeInTheDocument();
    });
    
    // Check if onSave was not called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
