const { supabase } = require('../config/supabase');
const { calculateHealthMetrics } = require('../utils/bmrCalculator');

/**
 * Get user profile
 * GET /api/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, email, phone_number, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    // Check for health profile
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    res.json({
      profile,
      healthProfile: healthProfile || null,
      hasHealthProfile: !!healthProfile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * Create or update health profile
 * POST /api/profile/health
 */
const saveHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight_kg, height_cm, age, gender, activity_level, goal } = req.body;

    // Calculate health metrics
    const metrics = calculateHealthMetrics({
      weight_kg,
      height_cm,
      age,
      gender,
      activity_level,
      goal: goal || 'maintain',
    });

    // Check if health profile exists
    const { data: existingProfile } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('health_profiles')
        .update({
          weight_kg,
          height_cm,
          age,
          gender,
          activity_level,
          goal: goal || 'maintain',
          bmr: metrics.bmr,
          daily_calories: metrics.daily_calories,
          updated_at: new Date(),
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('health_profiles')
        .insert([
          {
            user_id: userId,
            weight_kg,
            height_cm,
            age,
            gender,
            activity_level,
            goal: goal || 'maintain',
            bmr: metrics.bmr,
            daily_calories: metrics.daily_calories,
          },
        ])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Save health profile error:', result.error);
      return res.status(500).json({
        error: 'SAVE_FAILED',
        message: 'Failed to save health profile',
      });
    }

    res.json({
      message: 'Health profile saved successfully',
      healthProfile: result.data || result,
      metrics,
    });
  } catch (error) {
    console.error('Save health profile error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to save health profile',
    });
  }
};

/**
 * Get health profile
 * GET /api/profile/health
 */
const getHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: healthProfile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !healthProfile) {
      return res.status(404).json({
        error: 'HEALTH_PROFILE_NOT_FOUND',
        message: 'Health profile not found. Please complete onboarding.',
      });
    }

    res.json({
      healthProfile,
    });
  } catch (error) {
    console.error('Get health profile error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to fetch health profile',
    });
  }
};

module.exports = {
  getProfile,
  saveHealthProfile,
  getHealthProfile,
};
