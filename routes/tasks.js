const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Task = require('../models/Task');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  // Handle demo user in development
  if (req.user.id === 'demo-user-id' && process.env.NODE_ENV === 'development') {
    const sampleTasks = [
      {
        id: '1',
        title: 'Complete API Documentation',
        description: 'Write comprehensive API documentation for all endpoints',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        tags: ['documentation', 'api'],
        assignees: [
          { id: 'demo-user-id', name: 'Brian Hughes', avatar: 'assets/images/avatars/male-01.jpg' }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Fix Authentication Bug',
        description: 'Resolve the JWT token validation issue in production',
        status: 'todo',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        tags: ['bug', 'authentication'],
        assignees: [
          { id: 'demo-user-id', name: 'Brian Hughes', avatar: 'assets/images/avatars/male-01.jpg' }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: '3',
        title: 'Code Review',
        description: 'Review pull requests from the team',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        tags: ['review', 'code'],
        assignees: [
          { id: 'demo-user-id', name: 'Brian Hughes', avatar: 'assets/images/avatars/male-01.jpg' }
        ],
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];

    return res.json({ success: true, data: { tasks: sampleTasks } });
  }

  const tasks = await Task.getUserTasks(req.user.id, req.query);
  res.json({ success: true, data: { tasks } });
}));

router.post('/', asyncHandler(async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user.id });
  await task.save();
  res.status(201).json({ success: true, data: { task } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('owner assignees.user project');
  if (!task || !task.canUserAccess(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: { task } });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || !task.canUserAccess(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  Object.assign(task, req.body);
  await task.save();
  res.json({ success: true, data: { task } });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, message: 'Task deleted successfully' });
}));

module.exports = router;