import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import LoginPage from '../../pages/LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Import mocks
import { supabase } from '../../__mocks__/lib/supabase';

// Mock the toast notifications
jest.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Setup test component with all required providers
const TestComponent = () => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the login form', () => {
    render(<TestComponent />);

    // Check if the login form elements are rendered
    expect(screen.getByText(/Autentificare/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Parolă/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Autentificare/i })).toBeInTheDocument();
    expect(screen.getByText(/Ai uitat parola/i)).toBeInTheDocument();
    expect(screen.getByText(/Nu ai cont/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    render(<TestComponent />);

    // Try to submit the form without filling in the fields
    const submitButton = screen.getByRole('button', { name: /Autentificare/i });
    fireEvent.click(submitButton);

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Adresa de email este obligatorie/i)).toBeInTheDocument();
      expect(screen.getByText(/Parola este obligatorie/i)).toBeInTheDocument();
    });
  });

  test('submits the form with valid inputs', async () => {
    const { supabase } = require('../../lib/supabase');
    render(<TestComponent />);

    // Fill in the form fields
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Parolă/i);
    const submitButton = screen.getByRole('button', { name: /Autentificare/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check if the signInWithPassword method was called with the correct arguments
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('navigates to forgot password page', () => {
    render(<TestComponent />);

    // Click on the forgot password link
    const forgotPasswordLink = screen.getByText(/Ai uitat parola/i);
    fireEvent.click(forgotPasswordLink);

    // Check if the navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  test('navigates to register page', () => {
    render(<TestComponent />);

    // Click on the register link
    const registerLink = screen.getByText(/Înregistrează-te/i);
    fireEvent.click(registerLink);

    // Check if the navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('shows error message on login failure', async () => {
    const { supabase } = require('../../lib/supabase');
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const { useToast } = require('../../components/ui/use-toast');
    const mockToast = useToast().toast;

    render(<TestComponent />);

    // Fill in the form fields and submit
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Parolă/i);
    const submitButton = screen.getByRole('button', { name: /Autentificare/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Check if the error toast was displayed
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: expect.any(String),
        description: expect.stringContaining('Invalid login credentials'),
        variant: 'destructive',
      });
    });
  });
});
