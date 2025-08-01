const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Task = require('../models/Task');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
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