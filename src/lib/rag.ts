/**
 * RAG (Retrieval-Augmented Generation) module.
 *
 * Loads pre-built knowledge base and finds relevant chunks
 * via cosine similarity against query embeddings.
 */

import fs from "fs";
import path from "path";

interface Chunk {
  id: number;
  text: string;
  source?: string;
  embedding: number[];
}

const KB_PATH = path.join(process.cwd(), "data", "knowledge-base.json");
const OLLAMA_URL = process.env.OLLAMA_URL || process.env.OPENAI_BASE_URL?.replace("/v1", "") || "http://localhost:11434";
const EMBED_MODEL = "nomic-embed-text";

let knowledgeBase: Chunk[] | null = null;

function loadKnowledgeBase(): Chunk[] {
  if (knowledgeBase) return knowledgeBase;

  try {
    const raw = fs.readFileSync(KB_PATH, "utf-8");
    knowledgeBase = JSON.parse(raw);
    return knowledgeBase!;
  } catch {
    console.warn("RAG: knowledge base not found at", KB_PATH);
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getQueryEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding;
  } catch {
    return null;
  }
}

/**
 * Search the knowledge base for chunks relevant to the query.
 * Returns top-K most similar text chunks.
 */
export async function searchKnowledge(query: string, topK = 5): Promise<string[]> {
  const chunks = loadKnowledgeBase();
  if (chunks.length === 0) return [];

  const queryEmbedding = await getQueryEmbedding(query);
  if (!queryEmbedding) return [];

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    source: chunk.source || "",
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((s) => s.source ? `[${s.source}] ${s.text}` : s.text);
}

/**
 * Build a context string from relevant knowledge base chunks.
 * Returns empty string if RAG is not available.
 */
export async function getRAGContext(query: string, topK = 4): Promise<string> {
  const results = await searchKnowledge(query, topK);
  if (results.length === 0) return "";

  return (
    "\n\n--- Релевантные знания из учебников ---\n" +
    results.join("\n\n") +
    "\n--- Конец контекста из учебников ---\n"
  );
}

/**
 * Check if RAG knowledge base is available.
 */
export function isRAGAvailable(): boolean {
  try {
    return fs.existsSync(KB_PATH);
  } catch {
    return false;
  }
}
