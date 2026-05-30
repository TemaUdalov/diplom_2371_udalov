/**
 * Build knowledge base from PDF textbooks.
 *
 * Usage:
 *   npx tsx scripts/build-knowledge-base.ts
 *
 * Prerequisites:
 *   - Ollama running locally with `nomic-embed-text` model pulled
 *   - PDF files in project root
 */

import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const pdf = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

interface Chunk {
  id: number;
  text: string;
  source: string;
  embedding: number[];
}

const PDF_FILES = [
  { path: "studybook1.pdf", name: "Управление карьерой" },
  { path: "studybook2.pdf", name: "Управление персоналом" },
];

const OUTPUT_PATH = path.join(process.cwd(), "data", "knowledge-base.json");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const EMBED_MODEL = "nomic-embed-text";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function cleanText(text: string): string {
  return text
    // Remove page numbers (standalone numbers on a line)
    .replace(/^\d{1,3}\s*$/gm, "")
    // Remove decorative dots
    .replace(/·{3,}/g, "")
    // Collapse multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Collapse multiple spaces
    .replace(/ {2,}/g, " ")
    .trim();
}

function chunkText(text: string): string[] {
  const cleaned = cleanText(text);
  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    // Try to break at paragraph or sentence boundary
    if (end < cleaned.length) {
      const slice = cleaned.slice(start, end + 100);
      const paragraphBreak = slice.lastIndexOf("\n\n");
      const sentenceBreak = slice.lastIndexOf(". ");

      if (paragraphBreak > CHUNK_SIZE * 0.5) {
        end = start + paragraphBreak + 2;
      } else if (sentenceBreak > CHUNK_SIZE * 0.5) {
        end = start + sentenceBreak + 2;
      }
    }

    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    start = end - CHUNK_OVERLAP;
    if (start < 0) start = 0;
    if (end >= cleaned.length) break;
  }

  return chunks;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embedding failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.embedding;
}

async function main() {
  const allChunks: Chunk[] = [];
  let globalId = 0;

  for (const file of PDF_FILES) {
    const filePath = path.join(process.cwd(), file.path);

    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file.path} (file not found)`);
      continue;
    }

    console.log(`\nReading ${file.path} (${file.name})...`);
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(pdfBuffer);
    console.log(`  Extracted ${pdfData.text.length} characters from ${pdfData.numpages} pages`);

    console.log("  Chunking text...");
    const textChunks = chunkText(pdfData.text);
    console.log(`  Created ${textChunks.length} chunks`);

    console.log("  Generating embeddings...");
    for (let i = 0; i < textChunks.length; i++) {
      try {
        const embedding = await getEmbedding(textChunks[i]);
        allChunks.push({
          id: globalId++,
          text: textChunks[i],
          source: file.name,
          embedding,
        });

        if ((i + 1) % 20 === 0) {
          console.log(`    ${i + 1}/${textChunks.length} chunks processed`);
        }
      } catch (err) {
        console.error(`  Failed to embed chunk ${i}:`, err);
        console.error("  Make sure Ollama is running and nomic-embed-text is pulled:");
        console.error("    ollama pull nomic-embed-text");
        process.exit(1);
      }
    }

    console.log(`  Done with ${file.name}: ${textChunks.length} chunks`);
  }

  console.log(`\nWriting knowledge base to ${OUTPUT_PATH}...`);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allChunks, null, 0));

  const sizeMB = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done! ${allChunks.length} total chunks saved (${sizeMB} MB)`);
}

main().catch(console.error);
