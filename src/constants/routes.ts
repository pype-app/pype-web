/**
 * Application routes
 * 
 * Centralizes all route definitions for type-safety
 * and easier refactoring.
 */

export const ROUTES = {
  /** Public routes */
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ACCEPT_INVITE: '/accept-invite',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',

  /** Dashboard routes */
  DASHBOARD: '/dashboard',

  /** Pipeline routes */
  PIPELINES: '/dashboard/pipelines',
  PIPELINE_CREATE: '/dashboard/pipelines/create',
  PIPELINE_DETAIL: (id: string) => `/dashboard/pipelines/${id}` as const,
  PIPELINE_EDIT: (id: string) => `/dashboard/pipelines/${id}/edit` as const,

  /** Execution routes */
  EXECUTIONS: '/dashboard/executions',
  EXECUTION_DETAIL: (id: string) => `/dashboard/executions/${id}` as const,

  /** Environment variables routes */
  ENVIRONMENT: '/dashboard/environment',

  /** Analytics routes */
  ANALYTICS: '/dashboard/analytics',

  /** Dead Letter Queue routes */
  DLQ_ADMIN: '/dashboard/pipelines/dead-letter-queue',

  /** User management routes */
  USERS: '/dashboard/users',

  /** Settings routes */
  SETTINGS: '/dashboard/settings',
  SETTINGS_PROFILE: '/dashboard/settings/profile',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',

  /** Profile routes */
  PROFILE: '/dashboard/profile',
} as const;

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.PRIVACY_POLICY,
    ROUTES.TERMS_OF_SERVICE,
  ];

  return !publicRoutes.includes(path as any);
}

/**
 * Check if a route is a dashboard route
 */
export function isDashboardRoute(path: string): boolean {
  return path.startsWith(ROUTES.DASHBOARD);
}

/**
 * Get breadcrumb items for a given path
 */
export function getBreadcrumbs(path: string): Array<{ label: string; href: string }> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format label (capitalize and remove dashes)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}
