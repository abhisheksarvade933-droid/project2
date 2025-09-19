// Auth utilities for Replit Auth - referenced from javascript_log_in_with_replit blueprint
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}