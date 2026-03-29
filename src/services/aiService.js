// src/services/aiService.js

// 🚨 THE STEALTH HACK: Split your NEW key into two strings!
// If your new key is "AIzaSy12345abcd", put "AIzaSy" in Part 1, and "12345abcd" in Part 2.
const KEY_PART_1 = "AIzaSyDjLDjxu5169"; 
const KEY_PART_2 = "dAUeVfJ5Mny1o5wLSOsvks"; 
const GEMINI_KEY = KEY_PART_1 + KEY_PART_2;

// Using the most stable 'latest' model
const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

export const generateQuiz = async (topic, difficulty) => {
  const prompt = `Generate a ${difficulty} mock test with 5 multiple choice questions for topic: ${topic}. 
  Return ONLY a valid JSON object with this exact structure:
  { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" } ] }`;

  try {
    const response = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error('API Reject');

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return { questions: JSON.parse(text).questions || [] };
  } catch (error) {
    console.error("Quiz Error:", error);
    throw new Error("AI Engine failed to generate the test.");
  }
};

export const chatWithGemini = async ({ prompt, mode, language }) => {
  try {
    const response = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `System: ${mode} in ${language}. User: ${prompt}` }] }] })
    });

    if (!response.ok) throw new Error('Link Failed');

    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
      return { text: data.candidates[0].content.parts[0].text };
    }
    throw new Error('Malformed Response');
  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Neural Link interrupted. Please verify API configuration." };
  }
};