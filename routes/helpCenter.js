const express = require('express');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  // TODO: Implement helpCenter endpoints
  res.json({ success: true, message: 'helpCenter endpoints - TODO' });
}));

module.exports = router;
