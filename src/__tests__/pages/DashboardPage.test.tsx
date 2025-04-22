import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import DashboardPage from '../../pages/DashboardPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { RoleProvider } from '../../contexts/RoleContext';
import { AdvancedRoleProvider } from '../../contexts/AdvancedRoleContext';
import { OfflineProvider } from '../../contexts/OfflineContext';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({ data: [], error: null })),
  },
}));

// Mock the useNotifications hook
jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    markAsRead: jest.fn(),
    clearAll: jest.fn(),
    loading: false,
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
        <AuthProvider>
          <RoleProvider>
            <AdvancedRoleProvider>
              <OfflineProvider>
                <DashboardPage />
              </OfflineProvider>
            </AdvancedRoleProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

describe('DashboardPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the dashboard page', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Panou de Control/i)).toBeInTheDocument();
    });
    
    // Check if the main dashboard components are rendered
    expect(screen.getByText(/Bun venit/i)).toBeInTheDocument();
    expect(screen.getByText(/Proiecte Recente/i)).toBeInTheDocument();
    expect(screen.getByText(/Activitate Recentă/i)).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    render(<TestComponent />);
    
    // Check if loading indicators are displayed
    const loadingElements = screen.getAllByText(/Se încarcă/i);
    expect(loadingElements.length).toBeGreaterThan(0);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Panou de Control/i)).toBeInTheDocument();
    });
  });

  test('displays empty state when no data is available', async () => {
    // Mock the supabase client to return empty data
    const { supabase } = require('../../lib/supabase');
    supabase.then.mockImplementation(callback => callback({ data: [], error: null }));
    
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Panou de Control/i)).toBeInTheDocument();
    });
    
    // Check if empty state messages are displayed
    expect(screen.getByText(/Nu există proiecte recente/i)).toBeInTheDocument();
    expect(screen.getByText(/Nu există activitate recentă/i)).toBeInTheDocument();
  });

  test('displays error state when data fetching fails', async () => {
    // Mock the supabase client to return an error
    const { supabase } = require('../../lib/supabase');
    supabase.then.mockImplementation(callback => callback({ data: null, error: { message: 'Failed to fetch data' } }));
    
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Panou de Control/i)).toBeInTheDocument();
    });
    
    // Check if error messages are displayed
    expect(screen.getByText(/Eroare la încărcarea datelor/i)).toBeInTheDocument();
  });

  test('renders dashboard widgets', async () => {
    render(<TestComponent />);
    
    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText(/Panou de Control/i)).toBeInTheDocument();
    });
    
    // Check if dashboard widgets are rendered
    expect(screen.getByText(/Calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificări/i)).toBeInTheDocument();
    expect(screen.getByText(/Acțiuni Rapide/i)).toBeInTheDocument();
  });
});
