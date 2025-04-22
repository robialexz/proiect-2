import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import ProfilePage from '../../pages/ProfilePage';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { RoleProvider } from '../../contexts/RoleContext';
import { AdvancedRoleProvider } from '../../contexts/AdvancedRoleContext';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({
      data: [
        {
          id: '1',
          user_id: 'user123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          role: 'manager',
          department: 'Engineering',
          avatar_url: null,
        },
      ],
      error: null,
    })),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'avatars/user123.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '{process.env.EXAMPLE_COM_AVATARS_USER123}' } }),
      }),
    },
  },
}));

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 'user123',
      email: 'john.doe@example.com',
    },
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock the toast notifications
jest.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the Helmet component
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <div data-testid="helmet">{children}</div>,
}));

// Setup test component with all required providers
const TestComponent = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RoleProvider>
          <AdvancedRoleProvider>
            <ProfilePage />
          </AdvancedRoleProvider>
        </RoleProvider>
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the profile page', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    });
    
    // Check if the profile information is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
  });

  test('allows editing profile information', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getByText(/Editează Profil/i);
    fireEvent.click(editButton);
    
    // Check if the edit form is displayed
    expect(screen.getByLabelText(/Prenume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument();
    
    // Fill in the form
    const firstNameInput = screen.getByLabelText(/Prenume/i);
    const lastNameInput = screen.getByLabelText(/Nume/i);
    const phoneInput = screen.getByLabelText(/Telefon/i);
    
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    
    // Submit the form
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the update function was called with the correct data
    const { supabase } = require('../../lib/supabase');
    await waitFor(() => {
      expect(supabase.update).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '9876543210',
      });
    });
  });

  test('displays loading state during profile fetch', async () => {
    // Mock the supabase client to delay the response
    const { supabase } = require('../../lib/supabase');
    supabase.then.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({
      data: [
        {
          id: '1',
          user_id: 'user123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          role: 'manager',
          department: 'Engineering',
          avatar_url: null,
        },
      ],
      error: null,
    }), 100)));
    
    render(<TestComponent />);
    
    // Check if loading state is displayed
    expect(screen.getByText(/Se încarcă/i)).toBeInTheDocument();
    
    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  test('handles avatar upload', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getByText(/Editează Profil/i);
    fireEvent.click(editButton);
    
    // Create a mock file
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    
    // Get the file input and simulate file selection
    const fileInput = screen.getByLabelText(/Încarcă Imagine/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit the form
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the upload function was called with the correct file
    const { supabase } = require('../../lib/supabase');
    await waitFor(() => {
      expect(supabase.storage.from().upload).toHaveBeenCalledWith(
        expect.stringContaining('user123'),
        file,
        { upsert: true }
      );
    });
  });

  test('displays error message on profile update failure', async () => {
    // Mock the supabase client to return an error
    const { supabase } = require('../../lib/supabase');
    supabase.update.mockReturnValueOnce({
      then: jest.fn().mockImplementation(callback => callback({
        data: null,
        error: { message: 'Failed to update profile' },
      })),
    });
    
    const { useToast } = require('../../components/ui/use-toast');
    const mockToast = useToast().toast;
    
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getByText(/Editează Profil/i);
    fireEvent.click(editButton);
    
    // Submit the form without changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the error toast was displayed
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: expect.any(String),
        description: expect.stringContaining('Failed to update profile'),
        variant: 'destructive',
      });
    });
  });
});
