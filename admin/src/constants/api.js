// API Endpoints Configuration

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User Management
  USERS: {
    BASE: '/users',
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    BULK_DELETE: '/users/bulk-delete',
    EXPORT: '/users/export',
    IMPORT: '/users/import',
    SEARCH: '/users/search',
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/profile/avatar',
    DELETE_AVATAR: '/users/profile/avatar',
    CHANGE_STATUS: (id) => `/users/${id}/status`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  },

  // Role Management
  ROLES: {
    BASE: '/roles',
    LIST: '/roles',
    CREATE: '/roles',
    GET_BY_ID: (id) => `/roles/${id}`,
    UPDATE: (id) => `/roles/${id}`,
    DELETE: (id) => `/roles/${id}`,
    GET_PERMISSIONS: '/roles/permissions',
    ASSIGN_PERMISSIONS: (id) => `/roles/${id}/permissions`,
    GET_USERS_WITH_ROLE: (id) => `/roles/${id}/users`,
  },

  // Permission Management
  PERMISSIONS: {
    BASE: '/permissions',
    LIST: '/permissions',
    GROUPS: '/permissions/groups',
    ASSIGN_TO_ROLE: '/permissions/assign-to-role',
    ASSIGN_TO_USER: '/permissions/assign-to-user',
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    RECENT_ACTIVITIES: '/dashboard/activities',
    QUICK_ACTIONS: '/dashboard/quick-actions',
  },

  // Reports
  REPORTS: {
    BASE: '/reports',
    LIST: '/reports',
    CREATE: '/reports',
    GET_BY_ID: (id) => `/reports/${id}`,
    UPDATE: (id) => `/reports/${id}`,
    DELETE: (id) => `/reports/${id}`,
    EXPORT: (id) => `/reports/${id}/export`,
    GENERATE: '/reports/generate',
    TEMPLATES: '/reports/templates',
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    GENERAL: '/settings/general',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    THEME: '/settings/theme',
    SYSTEM: '/settings/system',
    BACKUP: '/settings/backup',
    RESTORE: '/settings/restore',
  },

  // Audit Logs
  AUDIT: {
    BASE: '/audit',
    LOGS: '/audit/logs',
    EXPORT: '/audit/export',
    SEARCH: '/audit/search',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    DELETE_ALL: '/notifications/delete-all',
    PREFERENCES: '/notifications/preferences',
  },

  // Business Profile
  BUSINESS_PROFILE: {
    BASE: '/business-profile',
    GET: '/business-profile',
    UPDATE: '/business-profile',
  },

  // WhatsApp Numbers
  WHATSAPP_NUMBERS: {
    BASE: '/whatsapp-numbers',
    LIST: '/whatsapp-numbers',
    CREATE: '/whatsapp-numbers',
    GET_BY_ID: (id) => `/whatsapp-numbers/${id}`,
    UPDATE: (id) => `/whatsapp-numbers/${id}`,
    DELETE: (id) => `/whatsapp-numbers/${id}`,
    TEST_CONNECTION: (id) => `/whatsapp-numbers/${id}/test-connection`,
    STATUS: (id) => `/whatsapp-numbers/${id}/status`,
  },

  // Contacts
  CONTACTS: {
    BASE: '/contacts',
    LIST: '/contacts',
    CREATE: '/contacts',
    GET_BY_ID: (id) => `/contacts/${id}`,
    UPDATE: (id) => `/contacts/${id}`,
    DELETE: (id) => `/contacts/${id}`,
  },

  // Templates
  TEMPLATES: {
    BASE: '/templates',
    LIST: '/templates',
    CREATE: '/templates',
    GET_BY_ID: (id) => `/templates/${id}`,
    UPDATE: (id) => `/templates/${id}`,
    DELETE: (id) => `/templates/${id}`,
    PREVIEW: (id) => `/templates/${id}/preview`,
    APPROVE: (id) => `/templates/${id}/approve`,
    REJECT: (id) => `/templates/${id}/reject`,
    SUBMIT_FOR_APPROVAL: (id) => `/templates/${id}/submit-for-approval`,
  },

  // Campaigns
  CAMPAIGNS: {
    BASE: '/campaigns',
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET_BY_ID: (id) => `/campaigns/${id}`,
    STATS: (id) => `/campaigns/${id}/stats`,
    START: (id) => `/campaigns/${id}/start`,
    RETRY_FAILED: (id) => `/campaigns/${id}/retry-failed`,
  },

  // Message Logs
  MESSAGE_LOGS: {
    BASE: '/message-logs',
    LIST: '/message-logs',
    GET_BY_ID: (id) => `/message-logs/${id}`,
  },
}

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
}

// API Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Cannot connect to backend server. Please make sure the backend server is running on http://localhost:8000',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied. You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
}

// Request Configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

export default {
  API_ENDPOINTS,
  HTTP_METHODS,
  API_STATUS,
  API_ERRORS,
  REQUEST_CONFIG,
}
