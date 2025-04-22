import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import SettingsPage from '../../pages/SettingsPage';
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
          theme: 'light',
          language: 'ro',
          notifications_enabled: true,
          email_notifications: true,
          push_notifications: false,
          auto_save: true,
        },
      ],
      error: null,
    })),
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

// Mock the theme context
jest.mock('../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../contexts/ThemeContext');
  return {
    ...originalModule,
    useTheme: () => ({
      theme: 'light',
      setTheme: jest.fn(),
    }),
  };
});

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
            <SettingsPage />
          </AdvancedRoleProvider>
        </RoleProvider>
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

describe('SettingsPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the settings page', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Check if the settings sections are displayed
    expect(screen.getByText(/Profil/i)).toBeInTheDocument();
    expect(screen.getByText(/Aspect/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificări/i)).toBeInTheDocument();
    expect(screen.getByText(/Avansat/i)).toBeInTheDocument();
  });

  test('allows changing appearance settings', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Click on the Appearance tab
    const appearanceTab = screen.getByText(/Aspect/i);
    fireEvent.click(appearanceTab);
    
    // Check if appearance settings are displayed
    expect(screen.getByText(/Temă/i)).toBeInTheDocument();
    expect(screen.getByText(/Limbă/i)).toBeInTheDocument();
    
    // Change theme
    const darkThemeOption = screen.getByLabelText(/Întunecat/i);
    fireEvent.click(darkThemeOption);
    
    // Change language
    const languageSelect = screen.getByLabelText(/Selectează o limbă/i);
    fireEvent.change(languageSelect, { target: { value: 'en' } });
    
    // Save changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the update function was called with the correct data
    const { supabase } = require('../../lib/supabase');
    await waitFor(() => {
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        theme: 'dark',
        language: 'en',
      }));
    });
  });

  test('allows changing notification settings', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Click on the Notifications tab
    const notificationsTab = screen.getByText(/Notificări/i);
    fireEvent.click(notificationsTab);
    
    // Check if notification settings are displayed
    expect(screen.getByText(/Activează Notificările/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificări Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificări Push/i)).toBeInTheDocument();
    
    // Toggle notification settings
    const enableNotificationsSwitch = screen.getByLabelText(/Activează Notificările/i);
    fireEvent.click(enableNotificationsSwitch);
    
    const emailNotificationsSwitch = screen.getByLabelText(/Notificări Email/i);
    fireEvent.click(emailNotificationsSwitch);
    
    const pushNotificationsSwitch = screen.getByLabelText(/Notificări Push/i);
    fireEvent.click(pushNotificationsSwitch);
    
    // Save changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the update function was called with the correct data
    const { supabase } = require('../../lib/supabase');
    await waitFor(() => {
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        notifications_enabled: false,
        email_notifications: false,
        push_notifications: true,
      }));
    });
  });

  test('allows changing advanced settings', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Click on the Advanced tab
    const advancedTab = screen.getByText(/Avansat/i);
    fireEvent.click(advancedTab);
    
    // Check if advanced settings are displayed
    expect(screen.getByText(/Salvare automată/i)).toBeInTheDocument();
    expect(screen.getByText(/Zonă Periculoasă/i)).toBeInTheDocument();
    
    // Toggle auto-save setting
    const autoSaveSwitch = screen.getByLabelText(/Salvare automată/i);
    fireEvent.click(autoSaveSwitch);
    
    // Save changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the update function was called with the correct data
    const { supabase } = require('../../lib/supabase');
    await waitFor(() => {
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        auto_save: false,
      }));
    });
  });

  test('displays success message after saving settings', async () => {
    const { useToast } = require('../../components/ui/use-toast');
    const mockToast = useToast().toast;
    
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Click on the Appearance tab
    const appearanceTab = screen.getByText(/Aspect/i);
    fireEvent.click(appearanceTab);
    
    // Save changes without making any changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the success toast was displayed
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: expect.stringContaining('Salvat'),
        description: expect.any(String),
        variant: 'default',
      });
    });
  });

  test('displays error message on settings update failure', async () => {
    // Mock the supabase client to return an error
    const { supabase } = require('../../lib/supabase');
    supabase.update.mockReturnValueOnce({
      then: jest.fn().mockImplementation(callback => callback({
        data: null,
        error: { message: 'Failed to update settings' },
      })),
    });
    
    const { useToast } = require('../../components/ui/use-toast');
    const mockToast = useToast().toast;
    
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Setări/i)).toBeInTheDocument();
    });
    
    // Click on the Appearance tab
    const appearanceTab = screen.getByText(/Aspect/i);
    fireEvent.click(appearanceTab);
    
    // Save changes without making any changes
    const saveButton = screen.getByText(/Salvează/i);
    fireEvent.click(saveButton);
    
    // Check if the error toast was displayed
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: expect.stringContaining('Eroare'),
        description: expect.stringContaining('Failed to update settings'),
        variant: 'destructive',
      });
    });
  });
});
