import { GoogleGenAI, Chat, Type } from "@google/genai";
import { DiseaseAnalysis, WeatherData, LearningResource } from '../types';

// FIX: Per @google/genai coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// Utility function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const detectPlantDisease = async (imageFile: File): Promise<DiseaseAnalysis> => {
  const base64Data = await fileToBase64(imageFile);
  
  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: base64Data,
    },
  };

  // FIX: Simplified the prompt as the JSON structure is now defined by the responseSchema, following best practices.
  const textPart = {
    text: `Analyze this plant image for diseases. Provide a detailed analysis including the disease name, whether the plant is healthy, a description, causes, and treatment recommendations (both organic and chemical). If the plant is healthy, provide a positive message in the description and other fields can be empty.`,
  };

  // FIX: Added responseSchema to ensure the model returns a valid JSON object matching the DiseaseAnalysis type, as recommended by the guidelines.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disease_name: { type: Type.STRING },
            is_healthy: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
            causes: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatment_recommendations: {
              type: Type.OBJECT,
              properties: {
                organic: { type: Type.ARRAY, items: { type: Type.STRING } },
                chemical: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
        }
    }
  });

  try {
    const jsonString = response.text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(jsonString) as DiseaseAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", response.text);
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};


let communityChat: Chat | null = null;

export const getCommunityChat = (): Chat => {
    if (!communityChat) {
        communityChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Plants Doctor, an expert agricultural assistant in a community forum for farmers. 
                Your tone should be knowledgeable, friendly, and supportive. Provide practical, actionable advice. 
                Keep your answers concise but thorough. Always prioritize sustainable and safe farming practices.`,
            },
        });
    }
    return communityChat;
}

export const getWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const prompt = `Provide a detailed weather forecast for agricultural purposes at latitude ${lat} and longitude ${lon}. Include current conditions, a 3-day forecast, and soil data.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          current: {
            type: Type.OBJECT,
            properties: {
              temp_c: { type: Type.NUMBER, description: "Current temperature in Celsius" },
              condition: { type: Type.STRING, description: "e.g., Sunny, Partly Cloudy" },
              humidity: { type: Type.NUMBER, description: "Humidity percentage" },
              wind_kph: { type: Type.NUMBER, description: "Wind speed in km/h" },
              precip_mm: { type: Type.NUMBER, description: "Precipitation in millimeters" },
              uv_index: { type: Type.NUMBER, description: "UV Index" }
            },
            required: ["temp_c", "condition", "humidity", "wind_kph", "precip_mm", "uv_index"]
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Forecast date (YYYY-MM-DD)" },
                day: { type: Type.STRING, description: "Day of the week" },
                max_temp_c: { type: Type.NUMBER, description: "Maximum temperature in Celsius" },
                min_temp_c: { type: Type.NUMBER, description: "Minimum temperature in Celsius" },
                condition: { type: Type.STRING, description: "Forecasted weather condition" },
                chance_of_rain: { type: Type.NUMBER, description: "Probability of rain as a percentage" }
              },
              required: ["date", "day", "max_temp_c", "min_temp_c", "condition", "chance_of_rain"]
            }
          },
          soil: {
            type: Type.OBJECT,
            properties: {
                temperature_c: { type: Type.NUMBER, description: "Soil temperature at 10cm depth in Celsius" },
                moisture_percent: { type: Type.NUMBER, description: "Soil moisture percentage" }
            },
            required: ["temperature_c", "moisture_percent"]
          }
        },
        required: ["current", "forecast", "soil"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as WeatherData;
  } catch (error) {
    console.error("Failed to parse weather JSON:", response.text);
    throw new Error("Could not retrieve weather data for your location.");
  }
};

export const getLearningResources = async (): Promise<LearningResource[]> => {
    const prompt = `Generate a list of 5 diverse and modern farming techniques. For each technique, provide a title, a brief summary, a list of key techniques or steps, and a fictional source name.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        techniques: { type: Type.ARRAY, items: { type: Type.STRING } },
                        source: { type: Type.STRING },
                    },
                    required: ["title", "summary", "techniques", "source"]
                }
            }
        }
    });

    try {
        return JSON.parse(response.text) as LearningResource[];
    } catch (error) {
        console.error("Failed to parse learning resources JSON:", response.text);
        throw new Error("Could not fetch learning resources.");
    }
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation, with no additional commentary or explanations:\n\n"${text}"`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
}