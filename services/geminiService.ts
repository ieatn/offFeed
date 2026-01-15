import { GoogleGenAI, Type } from "@google/genai";
import { DailyBriefData, GroundingSource, TrendTopic } from "../types";

const parseGroundingChunks = (groundingChunks: any[]): GroundingSource[] => {
  if (!groundingChunks || !Array.isArray(groundingChunks)) return [];
  
  const sources: GroundingSource[] = [];
  
  groundingChunks.forEach(chunk => {
    if (chunk.web && chunk.web.uri) {
      sources.push({
        title: chunk.web.title || new URL(chunk.web.uri).hostname,
        uri: chunk.web.uri
      });
    }
  });

  // Remove duplicates based on URI
  return Array.from(new Map(sources.map(s => [s.uri, s])).values());
};

const cleanJsonString = (text: string): string => {
  // Remove markdown code blocks if present
  let clean = text.replace(/```json\n?|\n?```/g, '');
  // Remove any leading/trailing whitespace
  return clean.trim();
};

export const generateDailyBrief = async (): Promise<DailyBriefData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are an expert news curator acting as the editor for "OffFeed".
    
    Task:
    1. Research the current top trending topics on Twitter (X) and Reddit for today, ${today}.
    2. Select the top 5-7 most significant and distinct stories. Prioritize global news, major tech announcements, and significant cultural moments. Avoid celebrity gossip unless it is of major cultural significance.
    3. For each topic, write a concise "Daily Brief" style summary (3-5 sentences).
    
    Output Format:
    Return a strictly valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    The JSON structure must be:
    {
      "topics": [
        {
          "title": "Clear, engaging headline",
          "summary": "The 3-5 sentence summary.",
          "platform": "Twitter" | "Reddit" | "Both"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We do not use responseMimeType: 'application/json' because it sometimes conflicts with search tool usage in current preview models
        // We rely on the prompt to enforce JSON structure.
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated.");
    }

    let parsedData: { topics: TrendTopic[] };
    
    try {
      parsedData = JSON.parse(cleanJsonString(text));
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("The daily brief could not be formatted correctly. Please try again.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = parseGroundingChunks(groundingChunks);

    return {
      date: today,
      topics: parsedData.topics,
      sources: sources
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate daily brief.");
  }
};
