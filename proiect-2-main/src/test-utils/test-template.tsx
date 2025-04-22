/**
 * Template pentru teste de componente
 * Acest fișier oferă funcții și utilități comune pentru testarea componentelor
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { RoleProvider } from '../contexts/RoleContext';
import { AdvancedRoleProvider } from '../contexts/AdvancedRoleContext';
import { OfflineProvider } from '../contexts/OfflineContext';

// Wrapper pentru toate contextele necesare în aplicație
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <AdvancedRoleProvider>
            <OfflineProvider>
              {children}
            </OfflineProvider>
          </AdvancedRoleProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Funcție customizată de render care include toți providerii
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportăm tot din testing-library
export * from '@testing-library/react';

// Suprascrie funcția render cu versiunea noastră
export { customRender as render };

/**
 * Mockuri comune pentru teste
 */

// Mock pentru supabase
export const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null })),
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '{process.env.EXAMPLE_COM_IMAGE}' } }),
    }),
  },
};

// Mock pentru react-router-dom
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

// Mock pentru i18next
export const mockT = jest.fn((key, defaultValue) => defaultValue || key);

/**
 * Utilități pentru teste
 */

// Funcție pentru a aștepta ca elementele să fie vizibile/invizibile
export const waitForElementToBeRemoved = (element: Element | null) => {
  if (!element) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

// Funcție pentru a simula evenimente de rețea
export const mockNetworkEvent = (online: boolean) => {
  const event = new Event(online ? 'online' : 'offline');
  window.dispatchEvent(event);
};

// Funcție pentru a simula redimensionarea ferestrei
export const mockResize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
};

// Funcție pentru a simula media queries
export const mockMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Funcție pentru a genera date de test
export const generateTestData = <T extends Record<string, any>>(
  template: T,
  count: number = 1
): T[] => {
  return Array.from({ length: count }, (_, index) => {
    const result = { ...template };
    Object.keys(template).forEach(key => {
      if (typeof template[key] === 'string') {
        result[key] = `${template[key]} ${index + 1}`;
      } else if (typeof template[key] === 'number') {
        result[key] = template[key] + index;
      } else if (Array.isArray(template[key])) {
        result[key] = [...template[key]];
      } else if (typeof template[key] === 'object' && template[key] !== null) {
        result[key] = { ...template[key] };
      }
    });
    return result;
  });
};
