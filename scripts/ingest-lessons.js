import "dotenv/config";
import { embedText } from "../src/ai/embeddings.js";
import { supabase } from "../src/db/supabase.js";

const lesson = {
  lesson_id: "pip",
  module: "Market Mechanics",
  source: "forex.pdf",
  lang: "mn",
  chunks: [
    `Pip гэдэг нь “Percentage in Point” гэсэн утгатай.
    Энэ нь валютын ханшийн хамгийн бага өөрчлөлтийг илэрхийлнэ.`,

    `Жишээ:
    EUR/USD 1.1000 → 1.1001
    Энэ нь 1 pip-ийн өсөлт.`,

    `Ихэнх валютын хувьд:
    1 pip = 0.0001.
    JPY оролцсон хосын хувьд 1 pip = 0.01.`
  ]
};

async function ingest() {
  for (const chunk of lesson.chunks) {
    const embedding = await embedText(chunk);

    await supabase.from("docs").insert({
      content: chunk,
      embedding,
      metadata: {
        lesson_id: lesson.lesson_id,
        module: lesson.module,
        source: lesson.source,
        lang: lesson.lang
      }
    });
  }

  console.log(`✅ Lesson '${lesson.lesson_id}' vectorized`);
}

ingest();
