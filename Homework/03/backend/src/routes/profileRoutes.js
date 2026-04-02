const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { healthProfileValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/profile
router.get('/', profileController.getProfile);

// GET /api/profile/health
router.get('/health', profileController.getHealthProfile);

// POST /api/profile/health
router.post('/health', healthProfileValidation, profileController.saveHealthProfile);

module.exports = router;
