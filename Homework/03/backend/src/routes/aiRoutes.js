const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, requiresHealthProfile } = require('../middleware/auth');

// All AI routes require authentication AND health profile
router.use(authenticateToken);
router.use(requiresHealthProfile);

// POST /api/ai/meal-plan
router.post('/meal-plan', aiController.generateMealPlan);

// POST /api/ai/exercises
router.post('/exercises', aiController.getExerciseRecommendations);

// POST /api/ai/nutrition-search
router.post('/nutrition-search', aiController.searchNutrition);

// POST /api/ai/analyze-meal
router.post('/analyze-meal', aiController.analyzeMeal);

module.exports = router;
