import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SplineWidget from '../SplineWidget';
import { ToastProvider } from '@/components/ui/use-toast';

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => {
  const originalModule = jest.requireActual('@/components/ui/use-toast');
  return {
    ...originalModule,
    useToast: () => ({
      toast: jest.fn(),
    }),
  };
});

describe('SplineWidget Component', () => {
  const renderComponent = () => 
    render(
      <ToastProvider>
        <SplineWidget />
      </ToastProvider>
    );

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Vizualizare 3D')).toBeInTheDocument();
  });

  it('displays tabs for different 3D models', () => {
    renderComponent();
    expect(screen.getByRole('tab', { name: /cub/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cameră/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tastatură/i })).toBeInTheDocument();
  });

  it('shows the Spline component when loaded', async () => {
    renderComponent();
    
    // Wait for the Spline component to load
    await waitFor(() => {
      expect(screen.getByTestId('spline-component')).toBeInTheDocument();
    });
  });

  it('changes the active tab when clicked', async () => {
    renderComponent();
    
    // Initially, 'cube' tab should be selected
    expect(screen.getByRole('tab', { name: /cub/i })).toHaveAttribute('data-state', 'active');
    
    // Click on the 'room' tab
    screen.getByRole('tab', { name: /cameră/i }).click();
    
    // Now 'room' tab should be selected
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /cameră/i })).toHaveAttribute('data-state', 'active');
    });
  });
});
