// React is imported globally in jest.setup.js
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import InventoryActions from '../../components/inventory/InventoryActions';

// Mock functions
const mockOnAddMaterial = jest.fn();
const mockOnImport = jest.fn();
const mockOnExport = jest.fn();
const mockOnReorderList = jest.fn();
const mockOnRefresh = jest.fn();

// Test component wrapper
const TestComponent = () => (
  <I18nextProvider i18n={i18n}>
    <InventoryActions
      onAddMaterial={mockOnAddMaterial}
      onImport={mockOnImport}
      onExport={mockOnExport}
      onReorderList={mockOnReorderList}
      onRefresh={mockOnRefresh}
    />
  </I18nextProvider>
);

describe('InventoryActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the action buttons', () => {
    render(<TestComponent />);

    // Check if the add material button is rendered
    expect(screen.getByText('inventory.actions.addMaterial')).toBeInTheDocument();

    // Check if the reorder list button is rendered
    expect(screen.getByText('inventory.actions.reorderList')).toBeInTheDocument();

    // Check if the refresh button is rendered
    expect(screen.getByText('inventory.actions.refresh')).toBeInTheDocument();

    // Check if the more button is rendered
    expect(screen.getByText('inventory.actions.more')).toBeInTheDocument();
  });

  test('calls onAddMaterial when add material button is clicked', () => {
    render(<TestComponent />);

    // Get the add material button
    const addButton = screen.getByText('inventory.actions.addMaterial');

    // Click the add material button
    fireEvent.click(addButton);

    // Check if onAddMaterial was called
    expect(mockOnAddMaterial).toHaveBeenCalled();
  });

  test('calls onRefresh when refresh button is clicked', () => {
    render(<TestComponent />);

    // Get the refresh button
    const refreshButton = screen.getByText('inventory.actions.refresh');

    // Click the refresh button
    fireEvent.click(refreshButton);

    // Check if onRefresh was called
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('calls onReorderList when reorder list button is clicked', () => {
    render(<TestComponent />);

    // Get the reorder list button
    const reorderButton = screen.getByText('inventory.actions.reorderList');

    // Click the reorder list button
    fireEvent.click(reorderButton);

    // Check if onReorderList was called
    expect(mockOnReorderList).toHaveBeenCalled();
  });
});
