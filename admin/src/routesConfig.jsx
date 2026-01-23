// Routes configuration for breadcrumbs and navigation
const routesConfig = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  
  // WhatsApp Management Routes
  { path: '/business-profile', name: 'Business Profile' },
  { path: '/whatsapp-numbers', name: 'WhatsApp Numbers' },
  { path: '/contacts', name: 'Contacts' },
  { path: '/templates', name: 'Templates' },
  { path: '/campaigns', name: 'Campaigns' },
  { path: '/campaigns/create', name: 'Create Campaign' },
  { path: '/campaigns/:id', name: 'Campaign Details' },
  { path: '/message-logs', name: 'Message Logs' },
  { path: '/compose', name: 'Create Campaign' },
  
  // User Management Routes
  { path: '/users', name: 'Users' },
  { path: '/users/create', name: 'Create User' },
  { path: '/users/edit/:id', name: 'Edit User' },
  { path: '/users/:id', name: 'User Details' },
  
  // Role Management Routes
  { path: '/roles', name: 'Roles' },
  { path: '/roles/create', name: 'Create Role' },
  { path: '/roles/edit/:id', name: 'Edit Role' },
  { path: '/roles/:id', name: 'Role Details' },
  
  // Account Routes
  { path: '/profile', name: 'Profile' },
  { path: '/profile/edit', name: 'Edit Profile' },
  { path: '/settings', name: 'Settings' },
  
  // Auth Routes
  { path: '/login', name: 'Login' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/reset-password', name: 'Reset Password' },
]

export default routesConfig
