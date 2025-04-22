/**
 * OS Report Generator
 * 
 * This module provides functionality to generate reports about the operating system
 * and browser environment where the application is running.
 */

// Define the structure of the OS report
export interface OSReport {
  timestamp: string;
  browser: {
    userAgent: string;
    appName: string;
    appVersion: string;
    platform: string;
    vendor: string;
    language: string;
    cookiesEnabled: boolean;
    doNotTrack: string | null;
    online: boolean;
    hardwareConcurrency: number;
    maxTouchPoints: number;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
    orientation: {
      type: string;
      angle: number;
    };
  };
  window: {
    innerWidth: number;
    innerHeight: number;
    outerWidth: number;
    outerHeight: number;
    devicePixelRatio: number;
  };
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  performance: {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
    navigation?: {
      type: number;
      redirectCount: number;
    };
    timing?: {
      navigationStart: number;
      loadEventEnd: number;
      domComplete: number;
      domInteractive: number;
      connectEnd: number;
      responseEnd: number;
      fetchStart: number;
    };
  };
  features: {
    localStorage: boolean;
    sessionStorage: boolean;
    webWorkers: boolean;
    serviceWorkers: boolean;
    webSockets: boolean;
    webGL: boolean;
    webRTC: boolean;
    geolocation: boolean;
    notifications: boolean;
    bluetooth: boolean;
    usb: boolean;
    battery: boolean;
    touchscreen: boolean;
  };
}

/**
 * Generate a comprehensive report about the operating system and browser environment
 */
export function generateOSReport(): OSReport {
  // Create the base report structure
  const report: OSReport = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      online: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
    },
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: {
        type: screen.orientation ? screen.orientation.type : 'unknown',
        angle: screen.orientation ? screen.orientation.angle : 0,
      },
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    },
    network: {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
    },
    performance: {},
    features: {
      localStorage: false,
      sessionStorage: false,
      webWorkers: false,
      serviceWorkers: false,
      webSockets: false,
      webGL: false,
      webRTC: false,
      geolocation: false,
      notifications: false,
      bluetooth: false,
      usb: false,
      battery: false,
      touchscreen: false,
    },
  };

  // Add network information if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      report.network = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
    }
  }

  // Add performance information if available
  if ('performance' in window) {
    const perf = window.performance;
    
    // Add memory info if available (Chrome only)
    if ((perf as any).memory) {
      report.performance.memory = {
        jsHeapSizeLimit: (perf as any).memory.jsHeapSizeLimit,
        totalJSHeapSize: (perf as any).memory.totalJSHeapSize,
        usedJSHeapSize: (perf as any).memory.usedJSHeapSize,
      };
    }
    
    // Add navigation info if available
    if (perf.navigation) {
      report.performance.navigation = {
        type: perf.navigation.type,
        redirectCount: perf.navigation.redirectCount,
      };
    }
    
    // Add timing info if available
    if (perf.timing) {
      report.performance.timing = {
        navigationStart: perf.timing.navigationStart,
        loadEventEnd: perf.timing.loadEventEnd,
        domComplete: perf.timing.domComplete,
        domInteractive: perf.timing.domInteractive,
        connectEnd: perf.timing.connectEnd,
        responseEnd: perf.timing.responseEnd,
        fetchStart: perf.timing.fetchStart,
      };
    }
  }

  // Check for feature support
  try {
    report.features.localStorage = !!window.localStorage;
  } catch (e) {
    report.features.localStorage = false;
  }
  
  try {
    report.features.sessionStorage = !!window.sessionStorage;
  } catch (e) {
    report.features.sessionStorage = false;
  }
  
  report.features.webWorkers = !!window.Worker;
  report.features.serviceWorkers = 'serviceWorker' in navigator;
  report.features.webSockets = !!window.WebSocket;
  
  try {
    const canvas = document.createElement('canvas');
    report.features.webGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    report.features.webGL = false;
  }
  
  report.features.webRTC = !!(window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection);
  report.features.geolocation = 'geolocation' in navigator;
  report.features.notifications = 'Notification' in window;
  report.features.bluetooth = 'bluetooth' in navigator;
  report.features.usb = 'usb' in navigator;
  report.features.battery = 'getBattery' in navigator;
  report.features.touchscreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return report;
}

/**
 * Generate and download the OS report as a JSON file
 */
export function downloadOSReport(): void {
  const report = generateOSReport();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `os-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format the OS report as a human-readable string
 */
export function formatOSReport(report: OSReport): string {
  return `
OS Report - Generated on ${new Date(report.timestamp).toLocaleString()}

BROWSER INFORMATION
------------------
User Agent: ${report.browser.userAgent}
App Name: ${report.browser.appName}
App Version: ${report.browser.appVersion}
Platform: ${report.browser.platform}
Vendor: ${report.browser.vendor}
Language: ${report.browser.language}
Cookies Enabled: ${report.browser.cookiesEnabled}
Do Not Track: ${report.browser.doNotTrack || 'Not set'}
Online: ${report.browser.online}
Hardware Concurrency: ${report.browser.hardwareConcurrency} cores
Max Touch Points: ${report.browser.maxTouchPoints}

SCREEN INFORMATION
-----------------
Resolution: ${report.screen.width}x${report.screen.height}
Available: ${report.screen.availWidth}x${report.screen.availHeight}
Color Depth: ${report.screen.colorDepth} bits
Pixel Depth: ${report.screen.pixelDepth} bits
Orientation: ${report.screen.orientation.type} (${report.screen.orientation.angle}°)

WINDOW INFORMATION
-----------------
Inner Size: ${report.window.innerWidth}x${report.window.innerHeight}
Outer Size: ${report.window.outerWidth}x${report.window.outerHeight}
Device Pixel Ratio: ${report.window.devicePixelRatio}

NETWORK INFORMATION
------------------
Effective Type: ${report.network.effectiveType}
Downlink: ${report.network.downlink} Mbps
RTT: ${report.network.rtt} ms
Save Data: ${report.network.saveData}

PERFORMANCE INFORMATION
----------------------
${report.performance.memory ? `
Memory:
  JS Heap Size Limit: ${Math.round(report.performance.memory.jsHeapSizeLimit / 1048576)} MB
  Total JS Heap Size: ${Math.round(report.performance.memory.totalJSHeapSize / 1048576)} MB
  Used JS Heap Size: ${Math.round(report.performance.memory.usedJSHeapSize / 1048576)} MB
` : ''}
${report.performance.timing ? `
Timing:
  Page Load Time: ${report.performance.timing.loadEventEnd - report.performance.timing.navigationStart} ms
  DOM Interactive: ${report.performance.timing.domInteractive - report.performance.timing.navigationStart} ms
  DOM Complete: ${report.performance.timing.domComplete - report.performance.timing.navigationStart} ms
  Response Time: ${report.performance.timing.responseEnd - report.performance.timing.fetchStart} ms
` : ''}

FEATURE SUPPORT
--------------
Local Storage: ${report.features.localStorage}
Session Storage: ${report.features.sessionStorage}
Web Workers: ${report.features.webWorkers}
Service Workers: ${report.features.serviceWorkers}
WebSockets: ${report.features.webSockets}
WebGL: ${report.features.webGL}
WebRTC: ${report.features.webRTC}
Geolocation: ${report.features.geolocation}
Notifications: ${report.features.notifications}
Bluetooth: ${report.features.bluetooth}
USB: ${report.features.usb}
Battery API: ${report.features.battery}
Touchscreen: ${report.features.touchscreen}
`;
}

export default {
  generateOSReport,
  downloadOSReport,
  formatOSReport,
};
