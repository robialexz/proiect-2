// React is imported globally in jest.setup.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__mocks__/i18n';
import ImportDialog from '../../components/inventory/ImportDialog';

// Mock functions
const mockOnImport = jest.fn();
const mockOnCancel = jest.fn();

// Test component wrapper
const TestComponent = () => (
  <I18nextProvider i18n={i18n}>
    <ImportDialog
      isOpen={true}
      onImport={mockOnImport}
      onCancel={mockOnCancel}
    />
  </I18nextProvider>
);

describe('ImportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the dialog', () => {
    render(<TestComponent />);
    
    // Check if the dialog title is rendered
    expect(screen.getByText('inventory.importDialog.title')).toBeInTheDocument();
    
    // Check if the file input is rendered
    expect(screen.getByText('inventory.importDialog.selectFile')).toBeInTheDocument();
    
    // Check if the buttons are rendered
    expect(screen.getByText('inventory.importDialog.import')).toBeInTheDocument();
    expect(screen.getByText('inventory.importDialog.cancel')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<TestComponent />);
    
    // Get the cancel button
    const cancelButton = screen.getByText('inventory.importDialog.cancel');
    
    // Click the cancel button
    fireEvent.click(cancelButton);
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('shows error when no file is selected', async () => {
    render(<TestComponent />);
    
    // Get the import button
    const importButton = screen.getByText('inventory.importDialog.import');
    
    // Click the import button without selecting a file
    fireEvent.click(importButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('inventory.importDialog.errors.noFile')).toBeInTheDocument();
    });
    
    // Check if onImport was not called
    expect(mockOnImport).not.toHaveBeenCalled();
  });

  test('shows preview when file is selected', async () => {
    render(<TestComponent />);
    
    // Create a mock file
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Get the file input
    const fileInput = screen.getByLabelText('inventory.importDialog.selectFile');
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check if preview is displayed
    await waitFor(() => {
      expect(screen.getByText('inventory.importDialog.preview')).toBeInTheDocument();
    });
  });

  test('calls onImport when import button is clicked with a file', async () => {
    render(<TestComponent />);
    
    // Create a mock file
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Get the file input
    const fileInput = screen.getByLabelText('inventory.importDialog.selectFile');
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Get the import button
    const importButton = screen.getByText('inventory.importDialog.import');
    
    // Click the import button
    fireEvent.click(importButton);
    
    // Check if onImport was called with the file
    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  test('does not render when isOpen is false', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ImportDialog
          isOpen={false}
          onImport={mockOnImport}
          onCancel={mockOnCancel}
        />
      </I18nextProvider>
    );
    
    // Check if the dialog is not rendered
    expect(screen.queryByText('inventory.importDialog.title')).not.toBeInTheDocument();
  });
});
