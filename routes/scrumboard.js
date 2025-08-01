const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// @desc    Get scrumboard boards
// @route   GET /api/scrumboard/boards
// @access  Private (temporarily optional for testing)
router.get('/boards', optionalAuth, asyncHandler(async (req, res) => {
  const boards = [
    {
      id: '1',
      title: 'ACME Backend Development',
      description: 'Backend development tasks for ACME project',
      icon: 'heroicons_outline:code-bracket',
      lastActivity: new Date().toISOString(),
      members: [
        {
          id: '1',
          name: 'Brian Hughes',
          avatar: 'assets/images/avatars/male-01.jpg'
        },
        {
          id: '2',
          name: 'John Doe',
          avatar: 'assets/images/avatars/male-02.jpg'
        }
      ]
    },
    {
      id: '2',
      title: 'Frontend Redesign',
      description: 'UI/UX improvements and frontend updates',
      icon: 'heroicons_outline:paint-brush',
      lastActivity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      members: [
        {
          id: '3',
          name: 'Jane Smith',
          avatar: 'assets/images/avatars/female-01.jpg'
        }
      ]
    }
  ];

  res.json(boards);
}));

// @desc    Get specific board
// @route   GET /api/scrumboard/boards/:id
// @access  Private (temporarily optional for testing)
router.get('/boards/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const board = {
    id: id,
    title: 'ACME Backend Development',
    description: 'Backend development tasks for ACME project',
    icon: 'heroicons_outline:code-bracket',
    lastActivity: new Date().toISOString(),
    members: [
      {
        id: '1',
        name: 'Brian Hughes',
        avatar: 'assets/images/avatars/male-01.jpg'
      },
      {
        id: '2',
        name: 'John Doe',
        avatar: 'assets/images/avatars/male-02.jpg'
      }
    ],
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        cards: [
          {
            id: 'card-1',
            title: 'Setup Database Schema',
            description: 'Create MongoDB schemas for all entities',
            labels: [
              { id: 'label-1', title: 'Backend', color: 'blue' }
            ],
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            assignedTo: {
              id: '1',
              name: 'Brian Hughes',
              avatar: 'assets/images/avatars/male-01.jpg'
            },
            attachments: [],
            subscribed: true,
            checklists: [],
            activities: []
          },
          {
            id: 'card-2',
            title: 'API Authentication',
            description: 'Implement JWT authentication system',
            labels: [
              { id: 'label-1', title: 'Backend', color: 'blue' },
              { id: 'label-2', title: 'Security', color: 'red' }
            ],
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
            assignedTo: {
              id: '2',
              name: 'John Doe',
              avatar: 'assets/images/avatars/male-02.jpg'
            },
            attachments: [],
            subscribed: false,
            checklists: [],
            activities: []
          }
        ]
      },
      {
        id: 'list-2',
        title: 'In Progress',
        cards: [
          {
            id: 'card-3',
            title: 'Dashboard APIs',
            description: 'Create REST APIs for dashboard data',
            labels: [
              { id: 'label-1', title: 'Backend', color: 'blue' }
            ],
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
            assignedTo: {
              id: '1',
              name: 'Brian Hughes',
              avatar: 'assets/images/avatars/male-01.jpg'
            },
            attachments: [],
            subscribed: true,
            checklists: [
              {
                id: 'checklist-1',
                name: 'API Endpoints',
                checkItems: [
                  { id: 'item-1', name: 'Project Dashboard', checked: true },
                  { id: 'item-2', name: 'Analytics Dashboard', checked: true },
                  { id: 'item-3', name: 'Finance Dashboard', checked: false },
                  { id: 'item-4', name: 'Crypto Dashboard', checked: false }
                ]
              }
            ],
            activities: []
          }
        ]
      },
      {
        id: 'list-3',
        title: 'Done',
        cards: [
          {
            id: 'card-4',
            title: 'Project Setup',
            description: 'Initialize Node.js project with Express',
            labels: [
              { id: 'label-3', title: 'Setup', color: 'green' }
            ],
            dueDate: null,
            assignedTo: {
              id: '1',
              name: 'Brian Hughes',
              avatar: 'assets/images/avatars/male-01.jpg'
            },
            attachments: [],
            subscribed: false,
            checklists: [],
            activities: []
          }
        ]
      }
    ],
    labels: [
      { id: 'label-1', title: 'Backend', color: 'blue' },
      { id: 'label-2', title: 'Security', color: 'red' },
      { id: 'label-3', title: 'Setup', color: 'green' }
    ]
  };

  res.json(board);
}));

// @desc    Create new board
// @route   POST /api/scrumboard/boards
// @access  Private
router.post('/boards', auth, asyncHandler(async (req, res) => {
  const { title, description, icon } = req.body;
  
  const newBoard = {
    id: Date.now().toString(),
    title,
    description,
    icon: icon || 'heroicons_outline:view-columns',
    lastActivity: new Date().toISOString(),
    members: [
      {
        id: req.user?.id || 'demo-user-id',
        name: req.user?.name || 'Demo User',
        avatar: req.user?.avatar || 'assets/images/avatars/male-01.jpg'
      }
    ],
    lists: [],
    labels: []
  };

  res.json(newBoard);
}));

// @desc    Update board
// @route   PUT /api/scrumboard/boards/:id
// @access  Private
router.put('/boards/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // In a real implementation, you would update the board in the database
  const updatedBoard = {
    id,
    ...updates,
    lastActivity: new Date().toISOString()
  };

  res.json(updatedBoard);
}));

// @desc    Delete board
// @route   DELETE /api/scrumboard/boards/:id
// @access  Private
router.delete('/boards/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // In a real implementation, you would delete the board from the database
  res.json({ success: true, message: 'Board deleted successfully' });
}));

module.exports = router;
