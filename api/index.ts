// Export API client and types
export * from './client';
export * from './types';

// Export all endpoints
export { authEndpoints } from './endpoints/auth';
export { sopEndpoints } from './endpoints/sops';
export { complianceEndpoints } from './endpoints/compliance';
export { userEndpoints } from './endpoints/users';

// Unified API interface
import { authEndpoints } from './endpoints/auth';
import { sopEndpoints } from './endpoints/sops';
import { complianceEndpoints } from './endpoints/compliance';
import { userEndpoints } from './endpoints/users';

export const api = {
  auth: authEndpoints,
  sops: sopEndpoints,
  compliance: complianceEndpoints,
  users: userEndpoints,
};

// Export default API instance
export default api; 