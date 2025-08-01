/**
 * Test data fixtures for E2E tests
 */

const testUsers = {
  admin: {
    name: 'Admin User',
    email: 'admin.test@example.com',
    password: 'AdminPass123!',
    role: 'admin'
  },
  user: {
    name: 'Regular User',
    email: 'user.test@example.com',
    password: 'UserPass123!',
    role: 'user'
  },
  manager: {
    name: 'Manager User',
    email: 'manager.test@example.com',
    password: 'ManagerPass123!',
    role: 'manager'
  }
};

const testContacts = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@testcompany.com',
    phone: '+1-555-0101',
    company: 'Test Company Inc',
    position: 'Software Engineer',
    notes: 'Frontend specialist'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@anothertest.com',
    phone: '+1-555-0102',
    company: 'Another Test LLC',
    position: 'Project Manager',
    notes: 'Great communicator'
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@freelance.com',
    phone: '+1-555-0103',
    company: 'Freelance',
    position: 'UX Designer',
    notes: 'Creative and detail-oriented'
  }
];

const testNotes = [
  {
    title: 'Project Meeting Notes',
    content: 'Discussed project timeline and deliverables. Next meeting scheduled for next week.',
    tags: ['meeting', 'project', 'work'],
    archived: false
  },
  {
    title: 'Research Ideas',
    content: 'Some interesting research topics to explore:\n1. AI in web development\n2. New frontend frameworks\n3. Performance optimization techniques',
    tags: ['research', 'ideas', 'development'],
    archived: false
  },
  {
    title: 'Personal Goals',
    content: 'Goals for this quarter:\n- Learn TypeScript\n- Complete certification\n- Start side project',
    tags: ['personal', 'goals', 'learning'],
    archived: false
  }
];

const testTasks = [
  {
    title: 'Complete user authentication',
    notes: 'Implement JWT-based authentication with refresh tokens',
    completed: false,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    tags: ['development', 'auth', 'security']
  },
  {
    title: 'Write unit tests',
    notes: 'Add comprehensive unit tests for all components',
    completed: false,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    tags: ['testing', 'quality']
  },
  {
    title: 'Update documentation',
    notes: 'Update API documentation and user guide',
    completed: true,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    tags: ['documentation', 'maintenance']
  }
];

const chatMessages = [
  {
    content: 'Hello there! How are you doing?',
    type: 'text'
  },
  {
    content: 'I\'m working on the new feature we discussed',
    type: 'text'
  },
  {
    content: 'Great! Let me know if you need any help',
    type: 'text'
  },
  {
    content: 'Thanks! I\'ll update you on the progress',
    type: 'text'
  }
];

const testFiles = {
  textFile: {
    name: 'test-document.txt',
    content: 'This is a test document for file upload testing.',
    mimeType: 'text/plain'
  },
  imageFile: {
    name: 'test-image.png',
    path: 'tests/e2e/fixtures/test-image.png',
    mimeType: 'image/png'
  },
  largeFile: {
    name: 'large-test-file.txt',
    content: 'A'.repeat(1024 * 1024), // 1MB file
    mimeType: 'text/plain'
  }
};

const formValidationData = {
  validEmail: 'valid.email@example.com',
  invalidEmails: [
    'invalid-email',
    '@missing-local.com',
    'missing-at-sign.com',
    'missing-domain@.com'
  ],
  validPasswords: [
    'StrongPass123!',
    'AnotherGood1@',
    'Secure$Pass9'
  ],
  invalidPasswords: [
    'weak',
    '12345678',
    'nouppercasenumbers',
    'NOLOWERCASENUMBERS',
    'NoSpecialChars123'
  ],
  validPhoneNumbers: [
    '+1-555-0123',
    '(555) 012-3456',
    '555.012.3456',
    '5550123456'
  ],
  invalidPhoneNumbers: [
    '123',
    'not-a-phone',
    '++1-555-0123'
  ]
};

const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile'
  },
  users: {
    list: '/users',
    create: '/users',
    update: '/users',
    delete: '/users'
  },
  contacts: {
    list: '/contacts',
    create: '/contacts',
    update: '/contacts',
    delete: '/contacts'
  },
  notes: {
    list: '/notes',
    create: '/notes',
    update: '/notes',
    delete: '/notes'
  },
  tasks: {
    list: '/tasks',
    create: '/tasks',
    update: '/tasks',
    delete: '/tasks'
  },
  upload: {
    single: '/upload',
    multiple: '/upload/multiple'
  },
  chat: {
    conversations: '/chat/conversations',
    messages: '/chat/messages',
    send: '/chat/send'
  }
};

const uiSelectors = {
  navigation: {
    sidebar: '[data-testid="sidebar"]',
    userMenu: '[data-testid="user-menu"]',
    logoHome: '[data-testid="logo-home"]'
  },
  forms: {
    loginForm: '[data-testid="login-form"]',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"]'
  },
  tables: {
    contactsTable: '[data-testid="contacts-table"]',
    notesTable: '[data-testid="notes-table"]',
    tasksTable: '[data-testid="tasks-table"]'
  },
  buttons: {
    addNew: '[data-testid="add-new-button"]',
    save: '[data-testid="save-button"]',
    cancel: '[data-testid="cancel-button"]',
    delete: '[data-testid="delete-button"]',
    edit: '[data-testid="edit-button"]'
  },
  modals: {
    confirmDialog: '[data-testid="confirm-dialog"]',
    formModal: '[data-testid="form-modal"]',
    uploadModal: '[data-testid="upload-modal"]'
  },
  notifications: {
    success: '.toast-success, .notification-success',
    error: '.toast-error, .notification-error',
    warning: '.toast-warning, .notification-warning',
    info: '.toast-info, .notification-info'
  }
};

module.exports = {
  testUsers,
  testContacts,
  testNotes,
  testTasks,
  chatMessages,
  testFiles,
  formValidationData,
  apiEndpoints,
  uiSelectors
};