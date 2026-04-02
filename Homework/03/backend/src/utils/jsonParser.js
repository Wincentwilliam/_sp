/**
 * Parse JSON from AI response, handling various formats
 * Groq may return JSON wrapped in markdown or with extra text
 */

/**
 * Extract and parse JSON from AI response text
 * @param {string} text - Raw AI response
 * @returns {Object|null} Parsed JSON object or null
 */
function parseJSONFromAI(text) {
  if (!text) return null;

  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Continue to other methods
  }

  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to extract JSON object from text (finds { and matching })
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to extract JSON array from text
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      // All methods failed
    }
  }

  return null;
}

/**
 * Validate that an object has required keys
 * @param {Object} obj - Object to validate
 * @param {string[]} requiredKeys - Required key names
 * @returns {boolean} True if all required keys present
 */
function validateRequiredKeys(obj, requiredKeys) {
  if (!obj || typeof obj !== 'object') return false;
  return requiredKeys.every(key => key in obj);
}

module.exports = {
  parseJSONFromAI,
  validateRequiredKeys,
};
