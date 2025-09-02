// FIX: Added a triple-slash directive to include Vite's client types.
// This resolves the TypeScript error 'Property 'env' does not exist on type 'ImportMeta''
// in components/Login.tsx by providing the correct type definitions for `import.meta.env`.
/// <reference types="vite/client" />

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface DiseaseAnalysis {
  disease_name: string;
  is_healthy: boolean;
  description: string;
  causes: string[];
  treatment_recommendations: {
    organic: string[];
    chemical: string[];
  };
}

export interface WeatherData {
  current: {
    temp_c: number;
    condition: string;
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    uv_index: number;
  };
  forecast: {
    date: string;
    day: string;
    max_temp_c: number;
    min_temp_c: number;
    condition: string;
    chance_of_rain: number;
  }[];
  soil: {
      temperature_c: number;
      moisture_percent: number;
  }
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
}

export interface LearningResource {
    title: string;
    summary: string;
    techniques: string[];
    source: string;
}

export interface ForumReply {
    id: string;
    author: {
        name: string;
        picture: string;
    };
    content: string;
    timestamp: string;
}

export interface ForumPost {
    id: string;
    author: {
        name: string;
        picture: string;
    };
    title: string;
    content: string;
    timestamp: string;
    replies: ForumReply[];
}