// src/services/aiService.js

// 🚨 PASTE YOUR NEW API KEY HERE
const GEMINI_KEY = "AIzaSyC2UM7JO6BKQKcD1Eg02TzfLAdJken_Qbs"; 

// The modern Google AI Endpoint
const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

export const generateQuiz = async (topic, difficulty) => {
  const prompt = `Generate a ${difficulty} mock test with 5 multiple choice questions for topic: ${topic}. 
  Return ONLY a valid JSON object with this exact structure:
  { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" } ] }`;

  try {
    const response = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean JSON in case Gemini adds markdown backticks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return { questions: parsed.questions || [] };
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw new Error("AI Engine failed to generate the test.");
  }
};

export const chatWithGemini = async ({ prompt, mode, language }) => {
  try {
    const response = await fetch(GOOGLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Mode: ${mode}. Language: ${language}. User: ${prompt}` }] }]
      })
    });

    if (!response.ok) throw new Error('Gemini Link Failed');

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return { text };
  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Neural Link interrupted. Please verify API configuration." };
  }
};