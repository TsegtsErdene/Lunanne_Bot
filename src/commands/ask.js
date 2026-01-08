import { embedText } from "../ai/embeddings.js";
import { supabase } from "../db/supabase.js";
import { chat } from "../ai/chat.js";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";

export async function ask(interaction) {
  await interaction.deferReply();

  const question = interaction.options.getString("question");

  // 1. Embedding
  const embedding = await embedText(question);

  // 2. Vector search
  const { data } = await supabase.rpc("match_doc", {
    query_embedding: embedding,
    match_threshold: 0.2,
    match_count: 3
  });

  if (!data || data.length === 0) {
    return interaction.editReply(
      "Энэ асуулт сургалтын материалд олдсонгүй."
    );
  }

  const context = data.map(d => d.content).join("\n---\n");

  // 3. AI answer
  const answer = await chat(`
Answer the Forex question using ONLY the material below.

Material:
${context}

Question:
${question}

Rules:
- Mongolian
- Simple
- One example if possible
`);

console.log("context: ",context,"\n question: ",question)

  const textcomp = new TextDisplayBuilder().setContent(answer)
  const cont = new ContainerBuilder().addTextDisplayComponents(textcomp)

  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [cont],
  });
}
