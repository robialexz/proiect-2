// React is imported globally in jest.setup.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import InventoryAssistant from '../../components/inventory/InventoryAssistant';
import { Material } from '../../types';

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
const mockOnAddMaterial = jest.fn();
const mockOnGenerateReorderList = jest.fn().mockResolvedValue({
  success: true,
  data: [
    {
      id: '2',
      name: 'Material 2',
      quantity: 3,
      unit: 'kg',
      min_stock_level: 5,
      max_stock_level: 15,
    },
  ],
});

// Default props
const defaultProps = {
  materials: sampleMaterials,
  onAddMaterial: mockOnAddMaterial,
  onGenerateReorderList: mockOnGenerateReorderList,
};

// Setup test component with i18n provider
const TestComponent = (props = defaultProps) => (
  <I18nextProvider i18n={i18n}>
    <InventoryAssistant {...props} />
  </I18nextProvider>
);

describe('InventoryAssistant', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore setTimeout
    jest.useRealTimers();
  });

  test('renders the assistant button initially', () => {
    render(<TestComponent />);

    // Check if the assistant button is rendered
    const assistantButton = screen.getByRole('button');
    expect(assistantButton).toBeInTheDocument();
  });









  test('renders the assistant button initially', () => {
    render(<TestComponent />);

    // Check if the assistant button is rendered
    const assistantButton = screen.getByRole('button');
    expect(assistantButton).toBeInTheDocument();
  });

  test('opens the assistant when button is clicked', () => {
    render(<TestComponent />);

    // Click the assistant button
    const assistantButton = screen.getByRole('button');
    fireEvent.click(assistantButton);

    // Check if the assistant dialog is opened
    expect(screen.getByText('inventory.assistant.title')).toBeInTheDocument();
    expect(screen.getByText('inventory.assistant.poweredBy')).toBeInTheDocument();

    // Check if the welcome message is displayed
    expect(screen.getByText('inventory.assistant.welcome')).toBeInTheDocument();
  });




});
