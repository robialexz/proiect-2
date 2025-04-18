// Export all utilities
export * from "./utils";
export * from "./performance";
export * from "./image-optimization";
export * from "./form-optimization";

// Export default objects
import utils from "./utils";
import performance from "./performance";
import imageOptimization from "./image-optimization";
import formOptimization from "./form-optimization";

// Combine all utilities into a single object
const lib = {
  ...utils,
  ...performance,
  ...imageOptimization,
  ...formOptimization,
};

export default lib;
