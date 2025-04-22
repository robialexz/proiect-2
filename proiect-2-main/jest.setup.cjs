// Import testing libraries
require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
const React = require('react');

// Add React to global scope for JSX in tests
global.React = React;

// Add TextEncoder and TextDecoder to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock Spline
jest.mock('@splinetool/react-spline', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ onLoad }) => {
      // Simulate loading after a short delay
      setTimeout(() => {
        if (onLoad) onLoad();
      }, 100);
      return React.createElement('div', { 'data-testid': 'spline-component' }, 'Spline 3D Component');
    }),
  };
}, { virtual: true });

// Mock react-window
jest.mock('react-window', () => {
  return {
    FixedSizeList: ({ children, itemCount, itemData }) => {
      const items = [];
      for (let i = 0; i < Math.min(itemCount, 10); i++) {
        items.push(children({ index: i, style: {}, data: itemData }));
      }
      return React.createElement('div', { 'data-testid': 'virtualized-list' }, items);
    },
  };
}, { virtual: true });

// Mock react-i18next
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  // Mock Trans component
  Trans: ({ children }) => children,
  // Mock withTranslation HOC
  withTranslation: () => Component => props => React.createElement(Component, { t: (k) => k, ...props }),
  // Mock I18nextProvider
  I18nextProvider: ({ children }) => children,
}));

// Mock contexts
jest.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => React.createElement('div', null, children),
  useAuth: () => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
    },
    isAuthenticated: true,
    loading: false,
    signIn: jest.fn().mockResolvedValue({ success: true }),
    signOut: jest.fn().mockResolvedValue({ success: true }),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
  }),
}), { virtual: true });

jest.mock('../src/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => React.createElement('div', null, children),
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}), { virtual: true });

jest.mock('../src/contexts/RoleContext', () => ({
  RoleProvider: ({ children }) => React.createElement('div', null, children),
  useRole: () => ({
    role: 'user',
    hasRole: jest.fn().mockReturnValue(true),
  }),
}), { virtual: true });

jest.mock('../src/contexts/AdvancedRoleContext', () => ({
  AdvancedRoleProvider: ({ children }) => React.createElement('div', null, children),
  useAdvancedRole: () => ({
    permissions: ['read', 'write'],
    hasPermission: jest.fn().mockReturnValue(true),
  }),
}), { virtual: true });

jest.mock('../src/contexts/OfflineContext', () => ({
  OfflineProvider: ({ children }) => React.createElement('div', null, children),
  useOffline: () => ({
    isOffline: false,
    setIsOffline: jest.fn(),
  }),
}), { virtual: true });

// Mock toast notifications
jest.mock('../src/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}), { virtual: true });

// Global console overrides to make tests cleaner
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Filter out specific React errors that we're handling in our tests
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: React.createElement') ||
     args[0].includes('Warning: Invalid hook call') ||
     args[0].includes('Warning: The current testing environment') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('Error: Not implemented: navigation'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Filter out specific React warnings that we're handling in our tests
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: React does not recognize') ||
     args[0].includes('Warning: The tag <') ||
     args[0].includes('Warning: Using UNSAFE_') ||
     args[0].includes('Warning: Failed prop type'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
