const API_URL = `${import.meta.env.VITE_API_URL}/api/ai`;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

export const generateQuiz = async (topic, difficulty) => {
  // If backend AI endpoint available, use it
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      ...getAuthConfig(),
      body: JSON.stringify({ topic, difficulty }),
    });
    if (!response.ok) throw new Error('Failed to generate AI quiz via backend');
    return await response.json();
  } catch (e) {
    console.warn('Backend generateQuiz failed, using Gemini direct fallback', e);
  }

  // Fallback directly to Gemini API (clientside)
  if (!GEMINI_KEY) throw new Error('Gemini API key is not configured');

  const payload = {
    model: 'gemini-1.5',
    prompt: `Generate ${difficulty} mock test with 10 multiple choice questions for topic: ${topic}. Include options A, B, C, D, and correct answer in JSON format.`,
    max_tokens: 1200,
  };

  const response = await fetch('https://api.gemini.com/v1/generateText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEMINI_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Gemini quiz generation failed');
  const result = await response.json();
  const text = result?.output_text || result?.output?.[0]?.content || result?.candidates?.[0]?.content || '';

  // Attempt to parse JSON output from model
  try {
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.questions)) {
      return { questions: parsed.questions };
    }
  } catch {
    // fallback to text parsing below
  }

  // Basic extract: maybe line-separated Q/A format
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const questionBlocks = [];
  let current = null;

  lines.forEach((line) => {
    const qMatch = line.match(/^\d+\.?\s*(.*)/);
    if (qMatch) {
      if (current) questionBlocks.push(current);
      current = { question: qMatch[1].trim(), options: [], correctAnswer: '' };
      return;
    }

    const optionMatch = line.match(/^[A-D][\.)]\s*(.*)/);
    if (optionMatch && current) {
      current.options.push(optionMatch[1].trim());
      return;
    }

    const ansMatch = line.match(/^(Correct Answer|Answer)\s*[:\-]?\s*([A-D])/i);
    if (ansMatch && current) {
      current.correctAnswer = ansMatch[2].trim();
    }
  });

  if (current) questionBlocks.push(current);

  return { questions: questionBlocks.length ? questionBlocks : [] };
};

export const chatWithGemini = async ({ prompt, mode, language }) => {
  const body = JSON.stringify({ prompt, mode, language });

  // 1) First try our Express backend AI route (best practice for API keys)
  try {
    const backendResponse = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      ...getAuthConfig(),
      body,
    });

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      if (data.success && data.answer) {
        return { text: data.answer, raw: data };
      }
      if (data.answer) {
        return { text: data.answer, raw: data };
      }
    }

    // If backend returns status >= 400, throw to fallback path.
    const errorText = await backendResponse.text();
    throw new Error(`Backend AI error: ${backendResponse.status} ${errorText}`);
  } catch (backendError) {
    console.warn('Backend /api/ai/chat failed, falling back to direct Gemini:', backendError.message);
  }

  // 2) Direct fallback to Gemini API (client-side) if backend fails
  if (!GEMINI_KEY) throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY.');

  const response = await fetch('https://api.gemini.com/v1/generateText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEMINI_KEY}`,
    },
    body: JSON.stringify({ model: 'gemini-1.5', prompt, max_tokens: 400 }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini AI request failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  const text = result?.output_text || result?.output?.[0]?.content || result?.candidates?.[0]?.content || '';
  return { raw: result, text };
};