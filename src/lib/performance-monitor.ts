/**
 * Performance monitoring utilities to help identify and fix performance issues
 */
import React from 'react';

// Track render times for components
const renderTimes: Record<string, number[]> = {};

/**
 * Track the render time of a component
 * @param componentName The name of the component
 * @param renderTime The time it took to render in ms
 */
export function trackRenderTime(componentName: string, renderTime: number): void {
  if (!renderTimes[componentName]) {
    renderTimes[componentName] = [];
  }
  renderTimes[componentName].push(renderTime);
  
  // Keep only the last 10 render times
  if (renderTimes[componentName].length > 10) {
    renderTimes[componentName].shift();
  }
}

/**
 * Get the average render time for a component
 * @param componentName The name of the component
 * @returns The average render time in ms
 */
export function getAverageRenderTime(componentName: string): number {
  if (!renderTimes[componentName] || renderTimes[componentName].length === 0) {
    return 0;
  }
  
  const sum = renderTimes[componentName].reduce((acc, time) => acc + time, 0);
  return sum / renderTimes[componentName].length;
}

/**
 * Get all component render times
 * @returns A record of component names to their render times
 */
export function getAllRenderTimes(): Record<string, number[]> {
  return { ...renderTimes };
}

/**
 * Clear all render times
 */
export function clearRenderTimes(): void {
  Object.keys(renderTimes).forEach(key => {
    delete renderTimes[key];
  });
}

/**
 * Clear render times for a specific component
 * @param componentName The name of the component
 */
export function clearComponentRenderTimes(componentName: string): void {
  if (renderTimes[componentName]) {
    delete renderTimes[componentName];
  }
}

/**
 * Higher-order component to monitor performance
 * @param Component The component to monitor
 * @param componentName The name of the component
 * @returns A wrapped component with performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  if (process.env.NODE_ENV !== 'development') {
    return Component as React.FC<P>;
  }
  
  const MonitoredComponent: React.FC<P> = (props) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      trackRenderTime(componentName, renderTime);
      
      // Log slow renders (over 50ms)
      if (renderTime > 50) {
        // Removed console statement
      }
    });
    
    return React.createElement(Component, props);
  };
  
  MonitoredComponent.displayName = `Monitored(${componentName})`;
  
  return MonitoredComponent;
}
