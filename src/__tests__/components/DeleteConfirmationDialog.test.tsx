// React is imported globally in jest.setup.js
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import DeleteConfirmationDialog from '../../components/inventory/DeleteConfirmationDialog';
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
const mockOnConfirm = jest.fn().mockResolvedValue({ success: true });
const mockOnClose = jest.fn();

// Test component wrapper
const TestComponent = () => (
  <I18nextProvider i18n={i18n}>
    <DeleteConfirmationDialog
      isOpen={true}
      material={material}
      onConfirm={mockOnConfirm}
      onClose={mockOnClose}
    />
  </I18nextProvider>
);

describe('DeleteConfirmationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the dialog with material name', () => {
    render(<TestComponent />);

    // Check if the dialog title is rendered
    expect(screen.getByText('inventory.delete.title')).toBeInTheDocument();

    // Check if the material name is displayed in the confirmation message
    expect(screen.getByText(/Test Material/i)).toBeInTheDocument();

    // Check if the buttons are rendered
    expect(screen.getByText('inventory.delete.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', async () => {
    render(<TestComponent />);

    // Click the confirm button
    fireEvent.click(screen.getByText('inventory.delete.confirm'));

    // Check if onConfirm was called with the correct material id
    expect(mockOnConfirm).toHaveBeenCalledWith(material.id);
  });

  test('calls onClose when cancel button is clicked', () => {
    render(<TestComponent />);

    // Click the cancel button
    fireEvent.click(screen.getByText('common.cancel'));

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('does not render when isOpen is false', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DeleteConfirmationDialog
          isOpen={false}
          material={material}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      </I18nextProvider>
    );

    // Check if the dialog is not rendered
    expect(screen.queryByText('inventory.delete.title')).not.toBeInTheDocument();
  });
});
