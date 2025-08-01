const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// Navigation endpoint
router.get('/navigation', optionalAuth, asyncHandler(async (req, res) => {
    // Complete navigation structure matching the Fuse demo
    const defaultNavigation = [
        {
            id: 'dashboards',
            title: 'Dashboards',
            subtitle: 'Unique dashboard designs',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'dashboards.project',
                    title: 'Project',
                    type: 'basic',
                    icon: 'heroicons_outline:clipboard-document-check',
                    link: '/dashboards/project'
                },
                {
                    id: 'dashboards.analytics',
                    title: 'Analytics',
                    type: 'basic',
                    icon: 'heroicons_outline:chart-pie',
                    link: '/dashboards/analytics'
                },
                {
                    id: 'dashboards.finance',
                    title: 'Finance',
                    type: 'basic',
                    icon: 'heroicons_outline:banknotes',
                    link: '/dashboards/finance'
                },
                {
                    id: 'dashboards.crypto',
                    title: 'Crypto',
                    type: 'basic',
                    icon: 'heroicons_outline:currency-dollar',
                    link: '/dashboards/crypto'
                }
            ]
        },
        {
            id: 'apps',
            title: 'Applications',
            subtitle: 'Custom made application designs',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: [
                {
                    id: 'apps.academy',
                    title: 'Academy',
                    type: 'basic',
                    icon: 'heroicons_outline:academic-cap',
                    link: '/apps/academy'
                },
                {
                    id: 'apps.chat',
                    title: 'Chat',
                    type: 'basic',
                    icon: 'heroicons_outline:chat-bubble-bottom-center-text',
                    link: '/apps/chat'
                },
                {
                    id: 'apps.contacts',
                    title: 'Contacts',
                    type: 'basic',
                    icon: 'heroicons_outline:user-group',
                    link: '/apps/contacts'
                },
                {
                    id: 'apps.ecommerce',
                    title: 'ECommerce',
                    type: 'collapsable',
                    icon: 'heroicons_outline:shopping-cart',
                    children: [
                        {
                            id: 'apps.ecommerce.inventory',
                            title: 'Inventory',
                            type: 'basic',
                            link: '/apps/ecommerce/inventory'
                        }
                    ]
                },
                {
                    id: 'apps.file-manager',
                    title: 'File Manager',
                    type: 'basic',
                    icon: 'heroicons_outline:cloud',
                    link: '/apps/file-manager'
                },
                {
                    id: 'apps.help-center',
                    title: 'Help Center',
                    type: 'collapsable',
                    icon: 'heroicons_outline:information-circle',
                    link: '/apps/help-center',
                    children: [
                        {
                            id: 'apps.help-center.home',
                            title: 'Home',
                            type: 'basic',
                            link: '/apps/help-center',
                            exactMatch: true
                        },
                        {
                            id: 'apps.help-center.faqs',
                            title: 'FAQs',
                            type: 'basic',
                            link: '/apps/help-center/faqs'
                        },
                        {
                            id: 'apps.help-center.guides',
                            title: 'Guides',
                            type: 'basic',
                            link: '/apps/help-center/guides'
                        },
                        {
                            id: 'apps.help-center.support',
                            title: 'Support',
                            type: 'basic',
                            link: '/apps/help-center/support'
                        }
                    ]
                },
                {
                    id: 'apps.mailbox',
                    title: 'Mailbox',
                    type: 'basic',
                    icon: 'heroicons_outline:envelope',
                    link: '/apps/mailbox',
                    badge: {
                        title: '27',
                        classes: 'px-2 bg-pink-600 text-white rounded-full'
                    }
                },
                {
                    id: 'apps.notes',
                    title: 'Notes',
                    type: 'basic',
                    icon: 'heroicons_outline:pencil-square',
                    link: '/apps/notes'
                },
                {
                    id: 'apps.scrumboard',
                    title: 'Scrumboard',
                    type: 'basic',
                    icon: 'heroicons_outline:view-columns',
                    link: '/apps/scrumboard'
                },
                {
                    id: 'apps.tasks',
                    title: 'Tasks',
                    type: 'basic',
                    icon: 'heroicons_outline:check-circle',
                    link: '/apps/tasks'
                }
            ]
        },
        {
            id: 'pages',
            title: 'Pages',
            subtitle: 'Custom made page designs',
            type: 'group',
            icon: 'heroicons_outline:document',
            children: [
                {
                    id: 'pages.activities',
                    title: 'Activities',
                    type: 'basic',
                    icon: 'heroicons_outline:bars-3-bottom-left',
                    link: '/pages/activities'
                },
                {
                    id: 'pages.authentication',
                    title: 'Authentication',
                    type: 'collapsable',
                    icon: 'heroicons_outline:lock-closed',
                    children: [
                        {
                            id: 'pages.authentication.sign-in',
                            title: 'Sign in',
                            type: 'collapsable',
                            children: [
                                {
                                    id: 'pages.authentication.sign-in.classic',
                                    title: 'Classic',
                                    type: 'basic',
                                    link: '/pages/authentication/sign-in/classic'
                                },
                                {
                                    id: 'pages.authentication.sign-in.modern',
                                    title: 'Modern',
                                    type: 'basic',
                                    link: '/pages/authentication/sign-in/modern'
                                }
                            ]
                        },
                        {
                            id: 'pages.authentication.sign-up',
                            title: 'Sign up',
                            type: 'collapsable',
                            children: [
                                {
                                    id: 'pages.authentication.sign-up.classic',
                                    title: 'Classic',
                                    type: 'basic',
                                    link: '/pages/authentication/sign-up/classic'
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'pages.coming-soon',
                    title: 'Coming Soon',
                    type: 'collapsable',
                    icon: 'heroicons_outline:clock',
                    children: [
                        {
                            id: 'pages.coming-soon.classic',
                            title: 'Classic',
                            type: 'basic',
                            link: '/pages/coming-soon/classic'
                        }
                    ]
                },
                {
                    id: 'pages.error',
                    title: 'Error',
                    type: 'collapsable',
                    icon: 'heroicons_outline:exclamation-triangle',
                    children: [
                        {
                            id: 'pages.error.404',
                            title: '404',
                            type: 'basic',
                            link: '/pages/error/404'
                        },
                        {
                            id: 'pages.error.500',
                            title: '500',
                            type: 'basic',
                            link: '/pages/error/500'
                        }
                    ]
                },
                {
                    id: 'pages.invoice',
                    title: 'Invoice',
                    type: 'collapsable',
                    icon: 'heroicons_outline:calculator',
                    children: [
                        {
                            id: 'pages.invoice.printable',
                            title: 'Printable',
                            type: 'basic',
                            link: '/pages/invoice/printable'
                        }
                    ]
                },
                {
                    id: 'pages.maintenance',
                    title: 'Maintenance',
                    type: 'basic',
                    icon: 'heroicons_outline:wrench-screwdriver',
                    link: '/pages/maintenance'
                },
                {
                    id: 'pages.pricing',
                    title: 'Pricing',
                    type: 'collapsable',
                    icon: 'heroicons_outline:currency-dollar',
                    children: [
                        {
                            id: 'pages.pricing.modern',
                            title: 'Modern',
                            type: 'basic',
                            link: '/pages/pricing/modern'
                        },
                        {
                            id: 'pages.pricing.simple',
                            title: 'Simple',
                            type: 'basic',
                            link: '/pages/pricing/simple'
                        }
                    ]
                },
                {
                    id: 'pages.profile',
                    title: 'Profile',
                    type: 'basic',
                    icon: 'heroicons_outline:user-circle',
                    link: '/pages/profile'
                },
                {
                    id: 'pages.search',
                    title: 'Search',
                    type: 'collapsable',
                    icon: 'heroicons_outline:magnifying-glass',
                    children: [
                        {
                            id: 'pages.search.classic',
                            title: 'Classic',
                            type: 'basic',
                            link: '/pages/search/classic'
                        },
                        {
                            id: 'pages.search.modern',
                            title: 'Modern',
                            type: 'basic',
                            link: '/pages/search/modern'
                        }
                    ]
                }
            ]
        }
    ];

    const compactNavigation = [
        {
            id: 'dashboards',
            title: 'Dashboards',
            type: 'group',
            icon: 'heroicons_outline:home',
            children: []
        },
        {
            id: 'apps',
            title: 'Applications',
            type: 'group',
            icon: 'heroicons_outline:document-duplicate',
            children: []
        }
    ];

    // Fill compact navigation children using the default navigation
    compactNavigation.forEach((compactNavItem) => {
        defaultNavigation.forEach((defaultNavItem) => {
            if (defaultNavItem.id === compactNavItem.id) {
                compactNavItem.children = [...defaultNavItem.children];
            }
        });
    });

    const navigation = {
        compact: compactNavigation,
        default: defaultNavigation,
        futuristic: [
            {
                id: 'dashboards',
                title: 'DASHBOARDS',
                type: 'group',
                children: defaultNavigation[0].children.map(child => ({
                    id: child.id,
                    title: child.title,
                    type: child.type,
                    link: child.link
                }))
            },
            {
                id: 'apps',
                title: 'APPLICATIONS',
                type: 'group',
                children: defaultNavigation[1].children.map(child => ({
                    id: child.id,
                    title: child.title,
                    type: child.type,
                    link: child.link
                }))
            }
        ],
        horizontal: [
            {
                id: 'dashboards',
                title: 'Dashboards',
                type: 'group',
                icon: 'heroicons_outline:home',
                children: defaultNavigation[0].children
            },
            {
                id: 'apps',
                title: 'Apps',
                type: 'group',
                icon: 'heroicons_outline:document-duplicate',
                children: defaultNavigation[1].children
            }
        ]
    };

    res.json(navigation);
}));

// User info endpoint
router.get('/user', auth, asyncHandler(async (req, res) => {
    // This is the same as /auth/me but under common API
    res.json(req.user);
}));

// Update user endpoint
router.patch('/user', auth, asyncHandler(async (req, res) => {
    const { user } = req.body;

    // In a real implementation, you would update the user in the database
    // For now, just return the updated user data merged with current user
    const updatedUser = {
        ...req.user,
        ...user,
        id: req.user.id, // Don't allow ID changes
        email: req.user.email // Don't allow email changes via this endpoint
    };

    res.json(updatedUser);
}));

// Search endpoint
router.get('/search', auth, asyncHandler(async (req, res) => {
    const { query } = req.query;

    // Simple search implementation with sample data
    const results = {
        contacts: query ? [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'assets/images/avatars/male-01.jpg'
            }
        ] : [],
        notes: query ? [
            {
                id: '1',
                title: 'Sample Note',
                content: 'This is a sample note content...'
            }
        ] : [],
        tasks: query ? [
            {
                id: '1',
                title: 'Sample Task',
                completed: false
            }
        ] : []
    };

    res.json(results);
}));

// Messages endpoint
router.get('/messages', optionalAuth, asyncHandler(async (req, res) => {
    // Sample messages data
    const messages = [
        {
            id: '1',
            image: 'assets/images/avatars/male-01.jpg',
            title: 'John Doe',
            description: 'Hey! How are you doing?',
            time: new Date().toISOString(),
            read: false,
            link: '/apps/chat',
            useRouter: true
        }
    ];

    res.json(messages);
}));

// Create message
router.post('/messages', auth, asyncHandler(async (req, res) => {
    const { message } = req.body;

    // In a real implementation, you would save to database
    const newMessage = {
        id: Date.now().toString(),
        ...message,
        time: new Date().toISOString(),
        read: false
    };

    res.json(newMessage);
}));

// Update message
router.patch('/messages', auth, asyncHandler(async (req, res) => {
    const { id, message } = req.body;

    // In a real implementation, you would update in database
    const updatedMessage = {
        id,
        ...message,
        time: new Date().toISOString()
    };

    res.json(updatedMessage);
}));

// Delete message
router.delete('/messages', auth, asyncHandler(async (req, res) => {
    const { id } = req.query;

    // In a real implementation, you would delete from database
    res.json(true);
}));

// Mark all messages as read
router.get('/messages/mark-all-as-read', auth, asyncHandler(async (req, res) => {
    // In a real implementation, you would update the database
    res.json(true);
}));

// Notifications endpoint
router.get('/notifications', optionalAuth, asyncHandler(async (req, res) => {
    // Sample notifications data
    const notifications = [
        {
            id: '1',
            icon: 'heroicons_outline:bell',
            title: 'Welcome to Fuse!',
            description: 'Your account has been successfully created.',
            time: new Date().toISOString(),
            read: false,
            link: '/dashboards/project',
            useRouter: true
        },
        {
            id: '2',
            icon: 'heroicons_outline:check-circle',
            title: 'System Update',
            description: 'The system has been updated to the latest version.',
            time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            read: false,
            link: null,
            useRouter: false
        }
    ];

    res.json(notifications);
}));

// Mark all notifications as read
router.get('/notifications/mark-all-as-read', auth, asyncHandler(async (req, res) => {
    // In a real implementation, you would update the database
    res.json(true);
}));

// Create notification
router.post('/notifications', auth, asyncHandler(async (req, res) => {
    const { notification } = req.body;

    // In a real implementation, you would save to database
    const newNotification = {
        id: Date.now().toString(),
        ...notification,
        time: new Date().toISOString(),
        read: false
    };

    res.json(newNotification);
}));

// Update notification
router.patch('/notifications', auth, asyncHandler(async (req, res) => {
    const { id, notification } = req.body;

    // In a real implementation, you would update in database
    const updatedNotification = {
        id,
        ...notification,
        time: new Date().toISOString()
    };

    res.json(updatedNotification);
}));

// Delete notification
router.delete('/notifications', auth, asyncHandler(async (req, res) => {
    const { id } = req.query;

    // In a real implementation, you would delete from database
    res.json(true);
}));

// Shortcuts endpoint
router.get('/shortcuts', optionalAuth, asyncHandler(async (req, res) => {
    // Sample shortcuts data
    const shortcuts = [
        {
            id: '1',
            label: 'Calendar',
            description: 'Appointments and meetings',
            icon: 'heroicons_outline:calendar',
            link: '/apps/calendar',
            useRouter: true
        },
        {
            id: '2',
            label: 'Mail',
            description: 'Emails and messages',
            icon: 'heroicons_outline:envelope',
            link: '/apps/mailbox',
            useRouter: true
        },
        {
            id: '3',
            label: 'Contacts',
            description: 'List of contacts',
            icon: 'heroicons_outline:user-group',
            link: '/apps/contacts',
            useRouter: true
        },
        {
            id: '4',
            label: 'Tasks',
            description: 'Task management',
            icon: 'heroicons_outline:check-circle',
            link: '/apps/tasks',
            useRouter: true
        }
    ];

    res.json(shortcuts);
}));

// Create shortcut
router.post('/shortcuts', auth, asyncHandler(async (req, res) => {
    const { shortcut } = req.body;

    // In a real implementation, you would save to database
    const newShortcut = {
        id: Date.now().toString(),
        ...shortcut
    };

    res.json(newShortcut);
}));

// Update shortcut
router.patch('/shortcuts', auth, asyncHandler(async (req, res) => {
    const { id, shortcut } = req.body;

    // In a real implementation, you would update in database
    const updatedShortcut = {
        id,
        ...shortcut
    };

    res.json(updatedShortcut);
}));

// Delete shortcut
router.delete('/shortcuts', auth, asyncHandler(async (req, res) => {
    const { id } = req.query;

    // In a real implementation, you would delete from database
    res.json(true);
}));

module.exports = router;