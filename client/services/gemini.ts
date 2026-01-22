import { GoogleGenAI, Type } from "@google/genai";
import { Ride, GeminiMatchResponse } from '../types';

// Ensure API key is available; in a real app, handle missing key gracefully
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const findSmartMatches = async (
  userQuery: string,
  availableRides: Ride[]
): Promise<GeminiMatchResponse> => {
  
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return { matchedRideIds: [], reasoning: "API Key missing. Cannot perform smart match." };
  }

  try {
    // Convert rides to a simplified string format for the model to process efficiently
    const ridesContext = JSON.stringify(availableRides.map(r => ({
      id: r.id,
      origin: r.origin,
      destination: r.destination,
      time: r.time,
      date: r.date,
      driver: r.driver.name,
      tags: r.tags
    })));

    const prompt = `
      You are an intelligent ride-matching assistant for a community carpooling app.
      
      Context:
      Here is a list of available rides in JSON format:
      ${ridesContext}

      User Request:
      "${userQuery}"

      Task:
      1. Analyze the User Request to understand their desired origin, destination, time, or preferences.
      2. Compare against the available rides.
      3. Select the IDs of the rides that are good matches. If the user asks for a specific vibe (e.g. "quiet"), checks tags.
      4. Provide a short, friendly reasoning string explaining why you picked these rides (or why none fit).
      
      Return the result in strict JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedRideIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reasoning: {
              type: Type.STRING
            }
          },
          required: ["matchedRideIds", "reasoning"]
        }
      }
    });

    let resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    // Clean markdown code blocks if present (common in LLM JSON responses)
    // Remove ```json at the start, ``` at the end, and any surrounding whitespace
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(resultText) as GeminiMatchResponse;

  } catch (error) {
    console.error("Gemini Match Error:", error);
    return {
      matchedRideIds: [],
      reasoning: "Sorry, I encountered an error while trying to find matches. Please try again."
    };
  }
};