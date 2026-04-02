const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, requiresHealthProfile } = require('../middleware/auth');
const { scheduleValidation } = require('../middleware/validation');

// All schedule routes require authentication AND health profile
router.use(authenticateToken);
router.use(requiresHealthProfile);

// Schedule endpoints
// GET /api/schedule
router.get('/', scheduleController.getSchedule);

// POST /api/schedule
router.post('/', scheduleValidation, scheduleController.createScheduleEntry);

// PUT /api/schedule/:id
router.put('/:id', scheduleController.updateScheduleEntry);

// PATCH /api/schedule/:id/complete
router.patch('/:id/complete', scheduleController.completeScheduleEntry);

// DELETE /api/schedule/:id
router.delete('/:id', scheduleController.deleteScheduleEntry);

// Exercise endpoints
// GET /api/exercises
router.get('/exercises', scheduleController.getExercises);

// POST /api/exercises
router.post('/exercises', scheduleController.createExercise);

// PATCH /api/exercises/:id/complete
router.patch('/exercises/:id/complete', scheduleController.completeExercise);

// DELETE /api/exercises/:id
router.delete('/exercises/:id', scheduleController.deleteExercise);

module.exports = router;
