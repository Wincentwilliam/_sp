/**
 * BMR and Daily Calorie Calculator
 * Uses the Mifflin-St Jeor Equation (most accurate for general population)
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise or physical job
};

const GOAL_ADJUSTMENTS = {
  lose: -500,          // Deficit for weight loss (~0.5kg/week)
  maintain: 0,         // Maintenance
  gain: 500,           // Surplus for weight gain (~0.5kg/week)
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male', 'female', or 'other'
 * @returns {number} BMR in calories/day
 */
function calculateBMR(weight, height, age, gender) {
  let bmr;

  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // Average of male and female for 'other'
    bmr = 10 * weight + 6.25 * height - 5 * age - 78;
  }

  return Math.round(bmr * 100) / 100;
}

/**
 * Calculate daily caloric needs based on BMR and activity level
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key
 * @param {string} goal - 'lose', 'maintain', or 'gain'
 * @returns {number} Daily calories needed
 */
function calculateDailyCalories(bmr, activityLevel, goal = 'maintain') {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const goalAdjustment = GOAL_ADJUSTMENTS[goal] || 0;

  const dailyCalories = bmr * multiplier + goalAdjustment;
  return Math.round(dailyCalories);
}

/**
 * Calculate BMI
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI value
 */
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
}

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

/**
 * Calculate all health metrics
 * @param {Object} profile - User profile data
 * @returns {Object} Health metrics
 */
function calculateHealthMetrics(profile) {
  const { weight_kg, height_cm, age, gender, activity_level, goal } = profile;

  const bmr = calculateBMR(weight_kg, height_cm, age, gender);
  const dailyCalories = calculateDailyCalories(bmr, activity_level, goal);
  const bmi = calculateBMI(weight_kg, height_cm);
  const bmiCategory = getBMICategory(bmi);

  return {
    bmr,
    daily_calories: dailyCalories,
    bmi,
    bmi_category: bmiCategory,
  };
}

module.exports = {
  calculateBMR,
  calculateDailyCalories,
  calculateBMI,
  getBMICategory,
  calculateHealthMetrics,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
};
