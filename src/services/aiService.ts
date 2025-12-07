import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '../config';
import { log } from '../lib/logger';

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your environment.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return client;
};

export const analyzeSymptoms = async (description: string): Promise<string> => {
  const trimmed = description.trim();
  if (!trimmed) {
    throw new Error('Symptom description is empty.');
  }

  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                'You are an expert agricultural assistant helping farmers with crop management, soil health, weather patterns, and farm operations. ' +
                'Given the following field symptoms, provide a concise, practical assessment (likely issue, severity, and next recommended actions).\n\n' +
                trimmed,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'Return a short, farmer-friendly explanation (2–4 sentences) with specific next steps. Avoid legal or medical disclaimers.',
      },
    });

    const text = (response as any).text ?? '';
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    return text;
  } catch (error) {
    log.error('Gemini analysis failed', error);
    throw error instanceof Error ? error : new Error('Unknown AI error');
  }
};
