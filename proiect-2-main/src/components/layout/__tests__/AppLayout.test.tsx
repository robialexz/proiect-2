import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotification } from '@/components/ui/notification';

// Mock the hooks and components
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/RoleContext', () => ({
  useRole: jest.fn(),
}));

jest.mock('@/components/ui/notification', () => ({
  useNotification: jest.fn(),
}));

jest.mock('@/components/welcome/WelcomeOverlay', () => ({
  __esModule: true,
  default: jest.fn(({ onComplete }) => (
    <div data-testid="welcome-overlay">
      Welcome Overlay
      <button onClick={onComplete}>Close</button>
    </div>
  )),
}));

jest.mock('@/components/ui/connection-status', () => ({
  __esModule: true,
  default: () => <div data-testid="connection-status">Connection Status</div>,
}));

jest.mock('@/components/ui/offline-indicator', () => ({
  OfflineIndicator: () => <div data-testid="offline-indicator">Offline Indicator</div>,
}));

jest.mock('../Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('../Navbar', () => ({
  __esModule: true,
  default: ({ onMenuToggle }) => (
    <div data-testid="navbar">
      Navbar
      <button onClick={onMenuToggle}>Toggle Menu</button>
    </div>
  ),
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('AppLayout Component', () => {
  // Setup mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockGetWelcomeMessage = jest.fn().mockReturnValue('Welcome message');
  const mockAddNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    
    (useRole as jest.Mock).mockReturnValue({
      userRole: 'user',
      getWelcomeMessage: mockGetWelcomeMessage,
    });
    
    (useNotification as jest.Mock).mockReturnValue({
      addNotification: mockAddNotification,
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/*" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the layout with sidebar and navbar when user is authenticated', () => {
    renderWithRouter(<AppLayout />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
  });

  it('shows welcome overlay for new login', () => {
    // Mock new login detection
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'newLoginDetected') return 'true';
      if (key === 'welcomeMessageShown') return null;
      return null;
    });
    
    renderWithRouter(<AppLayout />);
    
    expect(screen.getByTestId('welcome-overlay')).toBeInTheDocument();
  });

  it('does not show welcome overlay if already shown', () => {
    // Mock already shown welcome message
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === 'welcomeMessageShown') return 'true';
      return null;
    });
    
    renderWithRouter(<AppLayout />);
    
    expect(screen.queryByTestId('welcome-overlay')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    // Override the mock to return null for user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });
    
    renderWithRouter(<AppLayout />);
    
    // Should not render the layout
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });

  it('shows loading indicator when auth is loading', () => {
    // Override the mock to indicate loading
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });
    
    renderWithRouter(<AppLayout />);
    
    expect(screen.getByText('Se încarcă...')).toBeInTheDocument();
  });
});
