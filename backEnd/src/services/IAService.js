// src/services/AiService.ts
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { getSantiagoContext } from '../models/SantiagoModel.js';
const aiGoogle = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const aiOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export class AiService {
    // Método 1: Stream con Gemini
    static async askGeminiStream(userPrompt) {
        const systemInstruction = getSantiagoContext();
        return await aiGoogle.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });
    }
    // Método 2: Stream con OpenAI
    static async askOpenAIStream(userPrompt) {
        const systemInstruction = getSantiagoContext();
        return await aiOpenAI.chat.completions.create({
            model: 'gpt-4o-mini', // El más rápido y económico
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            stream: true,
            temperature: 0.3,
        });
    }
}
//# sourceMappingURL=IAService.js.map