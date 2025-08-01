const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Note = require('../models/Note');

const router = express.Router();
router.use(auth);

// @desc    Get user's notes
// @route   GET /api/notes
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, tags, category, isPinned, isArchived, isFavorite, color } = req.query;

  // Handle demo user in development
  if (req.user.id === 'demo-user-id' && process.env.NODE_ENV === 'development') {
    const sampleNotes = [
      {
        id: '1',
        title: 'Project Meeting Notes',
        content: 'Discussed the new features for Q1 release. Need to focus on user experience improvements.',
        tags: ['work', 'meeting'],
        category: 'work',
        isPinned: true,
        isArchived: false,
        isFavorite: false,
        color: '#2196F3',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Shopping List',
        content: 'Milk, Bread, Eggs, Coffee, Fruits',
        tags: ['personal', 'shopping'],
        category: 'personal',
        isPinned: false,
        isArchived: false,
        isFavorite: true,
        color: '#4CAF50',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];

    return res.json({ success: true, data: { notes: sampleNotes } });
  }

  const notes = await Note.searchNotes(req.user.id, search, {
    page: parseInt(page),
    limit: parseInt(limit),
    tags: tags ? tags.split(',') : [],
    category,
    isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
    isArchived: isArchived === 'true',
    isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
    color
  });

  res.json({ success: true, data: { notes } });
}));

// @desc    Create note
// @route   POST /api/notes
router.post('/', asyncHandler(async (req, res) => {
  const note = new Note({
    ...req.body,
    owner: req.user.id,
    lastEditedBy: req.user.id
  });
  
  await note.save();
  
  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: { note }
  });
}));

// @desc    Get note by ID
// @route   GET /api/notes/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('collaborators.user', 'name email avatar');
  
  if (!note || !note.canUserAccess(req.user.id)) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  
  res.json({ success: true, data: { note } });
}));

// @desc    Update note
// @route   PUT /api/notes/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note || !note.canUserAccess(req.user.id, 'write')) {
    return res.status(404).json({ success: false, message: 'Note not found or insufficient permissions' });
  }
  
  Object.assign(note, req.body);
  note.lastEditedBy = req.user.id;
  await note.save();
  
  res.json({
    success: true,
    message: 'Note updated successfully',
    data: { note }
  });
}));

// @desc    Delete note
// @route   DELETE /api/notes/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note || note.owner.toString() !== req.user.id) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  
  await note.deleteOne();
  
  res.json({ success: true, message: 'Note deleted successfully' });
}));

// @desc    Toggle note pin
// @route   PATCH /api/notes/:id/pin
router.patch('/:id/pin', asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  
  if (!note || !note.canUserAccess(req.user.id, 'write')) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  
  await note.togglePin();
  
  res.json({
    success: true,
    message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: { note }
  });
}));

module.exports = router;