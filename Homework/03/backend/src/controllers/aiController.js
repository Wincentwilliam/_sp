const { supabase } = require('../config/supabase');
const healthBrainService = require('../services/healthBrainService');

/**
 * Generate a meal plan
 * POST /api/ai/meal-plan
 */
const generateMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's health profile
    const { data: healthProfile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !healthProfile) {
      return res.status(400).json({
        error: 'HEALTH_PROFILE_REQUIRED',
        message: 'Please complete your health profile first',
      });
    }

    // Generate meal plan using AI
    const mealPlan = await healthBrainService.generateMealPlan(healthProfile);

    res.json({
      message: 'Meal plan generated successfully',
      mealPlan,
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({
      error: 'AI_SERVICE_ERROR',
      message: 'Failed to generate meal plan. Please try again.',
      details: error.message,
    });
  }
};

/**
 * Get exercise recommendations
 * POST /api/ai/exercises
 */
const getExerciseRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's health profile
    const { data: healthProfile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !healthProfile) {
      return res.status(400).json({
        error: 'HEALTH_PROFILE_REQUIRED',
        message: 'Please complete your health profile first',
      });
    }

    // Get exercise recommendations using AI
    const exercises = await healthBrainService.getExerciseRecommendations(healthProfile);

    res.json({
      message: 'Exercise recommendations generated successfully',
      exercises,
    });
  } catch (error) {
    console.error('Get exercise recommendations error:', error);
    res.status(500).json({
      error: 'AI_SERVICE_ERROR',
      message: 'Failed to get exercise recommendations. Please try again.',
      details: error.message,
    });
  }
};

/**
 * Search nutrition information
 * POST /api/ai/nutrition-search
 */
const searchNutrition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'QUERY_REQUIRED',
        message: 'Please provide a food name to search',
      });
    }

    // Get user's health profile
    const { data: healthProfile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !healthProfile) {
      return res.status(400).json({
        error: 'HEALTH_PROFILE_REQUIRED',
        message: 'Please complete your health profile first',
      });
    }

    // Search nutrition using AI
    const nutritionInfo = await healthBrainService.searchNutrition(query, healthProfile);

    // Optionally save search history
    await supabase.from('nutrition_searches').insert([
      {
        user_id: userId,
        query: query.trim(),
        result: nutritionInfo,
      },
    ]);

    res.json({
      message: 'Nutrition information retrieved successfully',
      nutrition: nutritionInfo,
    });
  } catch (error) {
    console.error('Search nutrition error:', error);
    res.status(500).json({
      error: 'AI_SERVICE_ERROR',
      message: 'Failed to search nutrition information. Please try again.',
      details: error.message,
    });
  }
};

/**
 * Analyze a meal
 * POST /api/ai/analyze-meal
 */
const analyzeMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealDescription } = req.body;

    if (!mealDescription || mealDescription.trim().length === 0) {
      return res.status(400).json({
        error: 'MEAL_REQUIRED',
        message: 'Please provide a meal description to analyze',
      });
    }

    // Get user's health profile
    const { data: healthProfile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !healthProfile) {
      return res.status(400).json({
        error: 'HEALTH_PROFILE_REQUIRED',
        message: 'Please complete your health profile first',
      });
    }

    // Analyze meal using AI
    const analysis = await healthBrainService.analyzeMeal(mealDescription, healthProfile);

    res.json({
      message: 'Meal analyzed successfully',
      analysis,
    });
  } catch (error) {
    console.error('Analyze meal error:', error);
    res.status(500).json({
      error: 'AI_SERVICE_ERROR',
      message: 'Failed to analyze meal. Please try again.',
      details: error.message,
    });
  }
};

module.exports = {
  generateMealPlan,
  getExerciseRecommendations,
  searchNutrition,
  analyzeMeal,
};
