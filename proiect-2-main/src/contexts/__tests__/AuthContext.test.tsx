import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabase-service';

// Mock the Supabase client and service
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      refreshSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/supabase-service', () => ({
  supabaseService: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/lib/cache-service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    clearNamespace: jest.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <div>Logged in as: {user.email}</div>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <div>Not logged in</div>
          <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage and sessionStorage
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', { value: mockStorage });
    Object.defineProperty(window, 'sessionStorage', { value: mockStorage });
    
    // Mock console methods to reduce noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('provides loading state initially', () => {
    // Mock getSession to return a promise that doesn't resolve immediately
    (supabaseService.auth.getSession as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('provides user when authenticated', async () => {
    // Mock successful authentication
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    (supabaseService.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    (supabaseService.auth.getUser as jest.Mock).mockResolvedValue({
      data: mockUser,
      error: null,
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    try {
    await waitFor(() => {
    } catch (error) {
      // Handle error appropriately
    }
      expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
    });
  });

  it('provides signIn method that works', async () => {
    // Mock initial unauthenticated state
    (supabaseService.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Mock successful sign in
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    (supabaseService.auth.signIn as jest.Mock).mockResolvedValue({
      status: 'success',
      data: {
        user: mockUser,
        session: mockSession,
      },
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial state
    try {
    await waitFor(() => {
    } catch (error) {
      // Handle error appropriately
    }
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
    
    // Click sign in button
    act(() => {
      screen.getByText('Sign In').click();
    });
    
    // Verify signIn was called
    expect(supabaseService.auth.signIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('provides signOut method that works', async () => {
    // Mock authenticated state
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    (supabaseService.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    (supabaseService.auth.getUser as jest.Mock).mockResolvedValue({
      data: mockUser,
      error: null,
    });
    
    // Mock successful sign out
    (supabaseService.auth.signOut as jest.Mock).mockResolvedValue({
      status: 'success',
      error: null,
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authenticated state
    try {
    await waitFor(() => {
    } catch (error) {
      // Handle error appropriately
    }
      expect(screen.getByText('Logged in as: test@example.com')).toBeInTheDocument();
    });
    
    // Click sign out button
    act(() => {
      screen.getByText('Sign Out').click();
    });
    
    // Verify signOut was called
    expect(supabaseService.auth.signOut).toHaveBeenCalled();
  });
});
