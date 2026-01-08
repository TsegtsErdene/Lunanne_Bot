import fs from "fs";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { CONTENT_MAP } from "./content-map.js";
import "dotenv/config";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 1️⃣ PDF → TEXT
async function extractText(pdfPath) {
  const parser = new PDFParse({ url: 'forex.pdf' });
  const result = await parser.getText();

  return result.text;
}

// 2️⃣ TEXT NORMALIZE
function normalize(text) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

// 3️⃣ LESSON_ID АВЧ ТОГТООХ
function detectLessonId(paragraph) {
  const lower = paragraph.toLowerCase();
  for (const item of CONTENT_MAP) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.lesson_id;
    }
  }
  return null;
}

// 4️⃣ CHUNKING (PARAGRAPH BASED)
function chunkByParagraph(text) {
  return text
    .split("\n\n")
    .map(p => p.trim())
    .filter(p => p.length > 100);
}

// 5️⃣ EMBEDDING
async function embed(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return res.data[0].embedding;
}

// 6️⃣ SUPABASE INSERT
async function insertDocument(content, embedding, lesson_id) {
  await supabase.from("documents").insert({
    content,
    embedding,
    metadata: {
      lesson_id,
      source: "forex.pdf",
      lang: "mn"
    }
  });
}

// 🚀 MAIN PIPELINE
(async () => {
  console.log("📥 Reading PDF...");
  const rawText = await extractText("forex.pdf");

  const text = normalize(rawText);
  const paragraphs = chunkByParagraph(text);

  console.log(`🔎 Found ${paragraphs.length} chunks`);

  for (const p of paragraphs) {
    const lesson_id = detectLessonId(p);
    if (!lesson_id) continue;

    console.log(`➕ Inserting chunk → ${lesson_id}`);

    console.log("\n embedding: ", lesson_id,"\n p: ",p,)

    //const embedding = await embed(p);
    //await insertDocument(p, embedding, lesson_id);
  }

  console.log("✅ Ingestion completed!");
})();
