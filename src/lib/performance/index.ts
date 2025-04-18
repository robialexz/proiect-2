// Export all performance utilities
export * from './memo-utils';
export * from './virtualization';
export * from './lazy-loading';
export * from './render-optimization';

// Export default objects
import memoUtils from './memo-utils';
import virtualization from './virtualization';
import lazyLoading from './lazy-loading';
import renderOptimization from './render-optimization';

// Combine all utilities into a single object
const performance = {
  ...memoUtils,
  ...virtualization,
  ...lazyLoading,
  ...renderOptimization
};

export default performance;
