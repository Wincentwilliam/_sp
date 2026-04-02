const Groq = require('groq-sdk');

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('Missing Groq API key. Check .env file.');
}

const groq = new Groq({ apiKey: groqApiKey });

module.exports = { groq };
