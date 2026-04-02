const { groq } = require('../config/groq');
const { parseJSONFromAI, validateRequiredKeys } = require('../utils/jsonParser');

const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Base system prompt for the Health AI
 */
const BASE_SYSTEM_PROMPT = `You are HealthBrain AI, a certified nutritionist and personal trainer with 20 years of experience.
You provide evidence-based, personalized health and fitness advice.
You always respond with valid JSON that matches the requested schema exactly.
Never include markdown formatting, explanations, or text outside the JSON structure.
All nutritional values should be realistic and based on standard food databases.
All exercise recommendations should consider safety and the user's fitness level.`;

/**
 * Generate a personalized meal plan
 */
async function generateMealPlan(userProfile) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

Generate a complete daily meal plan based on the user's profile.
Return JSON with this exact structure:
{
  "breakfast": {
    "name": "string",
    "recipe": "string",
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "prep_time_minutes": number,
    "ingredients": ["ingredient1", "ingredient2"]
  },
  "lunch": { ... same structure ... },
  "dinner": { ... same structure ... },
  "snacks": [{
    "name": "string",
    "calories": number,
    "description": "string"
  }],
  "total_calories": number,
  "total_protein_g": number,
  "total_carbs_g": number,
  "total_fat_g": number,
  "notes": "string"
}`;

  const userPrompt = `User Profile:
- BMR: ${userProfile.bmr} kcal/day
- Daily Calorie Target: ${userProfile.daily_calories} kcal/day
- Weight: ${userProfile.weight_kg}kg
- Height: ${userProfile.height_cm}cm
- Age: ${userProfile.age} years
- Gender: ${userProfile.gender}
- Activity Level: ${userProfile.activity_level}
- Goal: ${userProfile.goal || 'maintain'}

Generate a healthy, balanced meal plan that meets their caloric needs.`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    const parsed = parseJSONFromAI(content);

    if (!parsed || !validateRequiredKeys(parsed, ['breakfast', 'lunch', 'dinner'])) {
      throw new Error('Invalid meal plan structure from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
}

/**
 * Get exercise recommendations
 */
async function getExerciseRecommendations(userProfile) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

Provide exercise recommendations based on the user's profile and goals.
Return JSON with this exact structure:
{
  "recommended_exercises": [
    {
      "name": "string",
      "category": "cardio|strength|flexibility|hiit",
      "description": "string",
      "duration_minutes": number,
      "calories_burned": number,
      "difficulty": "beginner|intermediate|advanced",
      "instructions": ["step1", "step2"],
      "sets_reps": "string (for strength exercises)"
    }
  ],
  "weekly_plan": {
    "monday": ["exercise1", "exercise2"],
    "tuesday": ["exercise1"],
    "wednesday": "rest",
    "thursday": ["exercise1", "exercise2"],
    "friday": ["exercise1"],
    "saturday": ["exercise1", "exercise2"],
    "sunday": "rest"
  },
  "tips": ["tip1", "tip2"],
  "total_weekly_calories": number
}`;

  const userPrompt = `User Profile:
- BMR: ${userProfile.bmr} kcal/day
- Daily Calorie Target: ${userProfile.daily_calories} kcal/day
- Weight: ${userProfile.weight_kg}kg
- Height: ${userProfile.height_cm}cm
- Age: ${userProfile.age} years
- Gender: ${userProfile.gender}
- Activity Level: ${userProfile.activity_level}
- Goal: ${userProfile.goal || 'maintain'}

Provide personalized exercise recommendations.`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    const parsed = parseJSONFromAI(content);

    if (!parsed || !validateRequiredKeys(parsed, ['recommended_exercises'])) {
      throw new Error('Invalid exercise recommendations from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Error getting exercise recommendations:', error);
    throw error;
  }
}

/**
 * Search for nutrition information about a food
 */
async function searchNutrition(foodQuery, userProfile) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

Provide detailed nutritional information about the requested food.
Return JSON with this exact structure:
{
  "food_name": "string",
  "serving_size": "string",
  "calories": number,
  "macros": {
    "protein_g": number,
    "carbs_g": number,
    "fiber_g": number,
    "sugar_g": number,
    "fat_g": number,
    "saturated_fat_g": number
  },
  "vitamins": {
    "vitamin_a_iu": number,
    "vitamin_c_mg": number,
    "vitamin_d_iu": number,
    "vitamin_e_mg": number,
    "vitamin_k_mcg": number,
    "thiamin_mg": number,
    "riboflavin_mg": number,
    "niacin_mg": number,
    "vitamin_b6_mg": number,
    "folate_mcg": number,
    "vitamin_b12_mcg": number
  },
  "minerals": {
    "calcium_mg": number,
    "iron_mg": number,
    "magnesium_mg": number,
    "phosphorus_mg": number,
    "potassium_mg": number,
    "sodium_mg": number,
    "zinc_mg": number
  },
  "health_score": number (0-100),
  "health_analysis": "string explaining the score",
  "is_good_for_goal": boolean,
  "recommendation": "string with personalized advice"
}`;

  const userPrompt = `User Profile:
- Daily Calorie Target: ${userProfile.daily_calories} kcal/day
- Goal: ${userProfile.goal || 'maintain'}

Food to analyze: ${foodQuery}

Provide complete nutritional breakdown and assess if this food aligns with the user's health goals.`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    const parsed = parseJSONFromAI(content);

    if (!parsed || !validateRequiredKeys(parsed, ['food_name', 'calories', 'health_score'])) {
      throw new Error('Invalid nutrition data from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Error searching nutrition:', error);
    throw error;
  }
}

/**
 * Analyze a meal or recipe
 */
async function analyzeMeal(mealDescription, userProfile) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

Analyze the provided meal or recipe and return JSON with this structure:
{
  "meal_name": "string",
  "estimated_calories": number,
  "macros": {
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "health_score": number (0-100),
  "pros": ["positive aspect 1", "positive aspect 2"],
  "cons": ["negative aspect 1", "negative aspect 2"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "fits_goal": boolean,
  "recommendation": "string"
}`;

  const userPrompt = `User Profile:
- Daily Calorie Target: ${userProfile.daily_calories} kcal/day
- Goal: ${userProfile.goal || 'maintain'}

Meal to analyze: ${mealDescription}

Provide a thorough nutritional analysis.`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    const parsed = parseJSONFromAI(content);

    return parsed || { error: 'Could not analyze meal' };
  } catch (error) {
    console.error('Error analyzing meal:', error);
    throw error;
  }
}

module.exports = {
  generateMealPlan,
  getExerciseRecommendations,
  searchNutrition,
  analyzeMeal,
};
