import React from 'react';
import { render, screen, act } from '@testing-library/react';
import WelcomeOverlay from '../WelcomeOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useTranslation } from 'react-i18next';

// Mock the hooks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/RoleContext', () => ({
  useRole: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('WelcomeOverlay Component', () => {
  // Setup mock data
  const mockUserProfile = {
    displayName: 'Test User',
    email: 'test@example.com',
  };

  const mockGetWelcomeMessage = jest.fn().mockReturnValue('Welcome message');
  const mockT = jest.fn((key, defaultValue) => defaultValue);
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Setup mocks
    (useAuth as jest.Mock).mockReturnValue({
      userProfile: mockUserProfile,
    });
    
    (useRole as jest.Mock).mockReturnValue({
      userRole: 'user',
      getWelcomeMessage: mockGetWelcomeMessage,
    });
    
    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders the welcome message with user name', () => {
    render(<WelcomeOverlay onComplete={mockOnComplete} />);
    
    // Check if user name is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check if welcome message is displayed
    expect(screen.getByText('Welcome message')).toBeInTheDocument();
  });

  it('displays time-based greeting', () => {
    // Mock the current hour
    const mockDate = new Date();
    mockDate.setHours(14); // 2 PM - afternoon
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
    
    render(<WelcomeOverlay onComplete={mockOnComplete} />);
    
    // Should show afternoon greeting
    expect(screen.getByText('Bună ziua')).toBeInTheDocument();
  });

  it('calls onComplete after timeout', () => {
    render(<WelcomeOverlay onComplete={mockOnComplete} />);
    
    // Initially, onComplete should not be called
    expect(mockOnComplete).not.toHaveBeenCalled();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Now onComplete should be called
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('uses default user name if profile is not available', () => {
    // Override the mock to return null for userProfile
    (useAuth as jest.Mock).mockReturnValue({
      userProfile: null,
    });
    
    render(<WelcomeOverlay onComplete={mockOnComplete} />);
    
    // Should show default name
    expect(screen.getByText('Utilizator')).toBeInTheDocument();
  });
});
