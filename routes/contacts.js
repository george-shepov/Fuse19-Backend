const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Contact = require('../models/Contact');

const router = express.Router();
router.use(auth);

// @desc    Get user's contacts
// @route   GET /api/contacts
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, tags, isFavorite, company } = req.query;
  
  const contacts = await Contact.searchContacts(req.user.id, search, {
    page: parseInt(page),
    limit: parseInt(limit),
    tags: tags ? tags.split(',') : [],
    isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
    company
  });
  
  res.json({ success: true, data: { contacts } });
}));

// @desc    Create contact
// @route   POST /api/contacts
router.post('/', asyncHandler(async (req, res) => {
  const contact = new Contact({
    ...req.body,
    owner: req.user.id
  });
  
  await contact.save();
  
  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: { contact }
  });
}));

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    owner: req.user.id
  });
  
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  
  res.json({ success: true, data: { contact } });
}));

// @desc    Update contact
// @route   PUT /api/contacts/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  
  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: { contact }
  });
}));

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id
  });
  
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }
  
  res.json({ success: true, message: 'Contact deleted successfully' });
}));

module.exports = router;