import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "ollama";

if (!apiKey) {
  console.warn("OPENAI_API_KEY не задан — AI-функции будут недоступны");
}

export const openai = new OpenAI({
  apiKey,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  timeout: 15 * 60 * 1000,
});

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
