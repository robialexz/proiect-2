// Import testing libraries
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock localStorage and sessionStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock Framer Motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }) => children,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
      h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
      h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
      ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
      li: ({ children, ...props }) => <li {...props}>{children}</li>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      a: ({ children, ...props }) => <a {...props}>{children}</a>,
      header: ({ children, ...props }) => <header {...props}>{children}</header>,
      footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
      main: ({ children, ...props }) => <main {...props}>{children}</main>,
      nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
      section: ({ children, ...props }) => <section {...props}>{children}</section>,
      article: ({ children, ...props }) => <article {...props}>{children}</article>,
      aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
    },
  };
});

// Mock Spline
jest.mock('@splinetool/react-spline', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ onLoad }) => {
      // Simulate loading after a short delay
      setTimeout(() => {
        if (onLoad) onLoad();
      }, 100);
      return <div data-testid="spline-component">Spline 3D Component</div>;
    }),
  };
});

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
     args[0].includes('Warning: Invalid hook call'))
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
     args[0].includes('Warning: The tag <'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
