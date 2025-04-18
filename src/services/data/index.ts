// Export base data service
export { default as DataService } from './data-service';

// Export specific data services
export { default as userService } from './user-service';
export { default as projectService } from './project-service';
export { default as materialService } from './material-service';

// Update main services index
import '../index';
