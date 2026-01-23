/**
 * Application-wide constants and configuration
 * 
 * Centralizes magic numbers and configuration values
 * for better maintainability and consistency.
 */

export const APP_CONFIG = {
  /** Auto-refresh interval for dashboard (milliseconds) */
  REFRESH_INTERVAL: 30000, // 30 seconds

  /** Pagination settings */
  PAGINATION: {
    /** Default number of items per page */
    DEFAULT_PAGE_SIZE: 20,
    /** Available page size options */
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    /** Maximum page size allowed */
    MAX_PAGE_SIZE: 100,
  },

  /** Monaco Editor settings */
  EDITOR: {
    /** Default editor height */
    DEFAULT_HEIGHT: '400px',
    /** Minimum editor height */
    MIN_HEIGHT: '200px',
    /** Maximum editor height */
    MAX_HEIGHT: '800px',
    /** Editor theme (light mode) */
    LIGHT_THEME: 'vs-light',
    /** Editor theme (dark mode) */
    DARK_THEME: 'vs-dark',
  },

  /** API client settings */
  API: {
    /** Request timeout (milliseconds) */
    TIMEOUT: 30000, // 30 seconds
    /** Number of retry attempts for failed requests */
    RETRY_ATTEMPTS: 3,
    /** Initial delay for retry (milliseconds) */
    RETRY_DELAY: 1000, // 1 second
    /** Maximum delay for exponential backoff (milliseconds) */
    MAX_RETRY_DELAY: 10000, // 10 seconds
    /** Backoff multiplier for retries */
    BACKOFF_FACTOR: 2,
  },

  /** Logs settings */
  LOGS: {
    /** Maximum number of log entries to display */
    MAX_LOG_ENTRIES: 1000,
    /** Timestamp format for logs */
    TIMESTAMP_FORMAT: 'HH:mm:ss.SSS',
    /** Date format for logs */
    DATE_FORMAT: 'yyyy-MM-dd',
    /** DateTime format for logs */
    DATETIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  },

  /** Toast notification settings */
  TOAST: {
    /** Duration for success toasts (milliseconds) */
    SUCCESS_DURATION: 3000, // 3 seconds
    /** Duration for error toasts (milliseconds) */
    ERROR_DURATION: 5000, // 5 seconds
    /** Duration for info toasts (milliseconds) */
    INFO_DURATION: 4000, // 4 seconds
    /** Duration for loading toasts (milliseconds) */
    LOADING_DURATION: Infinity, // Manual dismiss
  },

  /** Debounce delays */
  DEBOUNCE: {
    /** Default debounce delay for search inputs (milliseconds) */
    SEARCH: 300,
    /** Debounce delay for form inputs (milliseconds) */
    INPUT: 500,
    /** Debounce delay for resize events (milliseconds) */
    RESIZE: 150,
  },

  /** Theme settings */
  THEME: {
    /** Transition duration for theme changes (milliseconds) */
    TRANSITION_DURATION: 200,
    /** Local storage key for theme preference */
    STORAGE_KEY: 'pype-theme',
  },

  /** LocalStorage keys */
  STORAGE_KEYS: {
    /** Auth token storage key */
    AUTH_TOKEN: 'pype-auth-storage',
    /** Theme preference key */
    THEME: 'pype-theme',
    /** Dashboard preferences key */
    DASHBOARD_ONLY_MINE: 'pype-dashboard-only-mine',
    /** Dashboard auto-refresh preference */
    DASHBOARD_AUTO_REFRESH: 'pype-dashboard-auto-refresh',
    /** Last used tenant */
    LAST_TENANT: 'pype-last-tenant',
    /** Feature flags (dev only) */
    FEATURE_FLAGS: 'pype-feature-flags',
  },

  /** File upload settings */
  FILE_UPLOAD: {
    /** Maximum file size in bytes (5MB) */
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    /** Allowed file extensions for YAML */
    ALLOWED_YAML_EXTENSIONS: ['.yaml', '.yml'],
  },

  /** Validation settings */
  VALIDATION: {
    /** Minimum password length */
    MIN_PASSWORD_LENGTH: 8,
    /** Maximum pipeline name length */
    MAX_PIPELINE_NAME_LENGTH: 100,
    /** Maximum description length */
    MAX_DESCRIPTION_LENGTH: 500,
  },
} as const;

/** Application name */
export const APP_NAME = 'Pype';

/** Application version (from package.json) */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

/** Environment */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/** Feature flags (development only) */
export const FEATURES = {
  /** Enable dry-run mode UI */
  DRY_RUN: 'dry_run',
  /** Enable real-time logs via WebSocket */
  REAL_TIME_LOGS: 'real_time_logs',
  /** Enable YAML IntelliSense */
  YAML_INTELLISENSE: 'yaml_intellisense',
  /** Enable advanced analytics dashboard */
  ANALYTICS_V2: 'analytics_v2',
} as const;

export type FeatureFlag = typeof FEATURES[keyof typeof FEATURES];
