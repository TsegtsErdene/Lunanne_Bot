import { pg } from "../db/pg.js";
import { supabase } from "../db/supabase.js";
import { chat } from "../ai/chat.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  TextDisplayBuilder
} from "discord.js";

export async function lesson(interaction) {
  await interaction.deferReply();

  const lessonId = interaction.options.getString("lesson");
  const userId = interaction.user.id;

  // 1️⃣ Lesson байгаа эсэх (Local PG)
  const lessonRes = await pg.query(
    "select * from lessons where id = $1",
    [lessonId]
  );

  if (!lessonRes.rows.length) {
    return interaction.editReply("❌ Ийм хичээл олдсонгүй.");
  }

  const lesson = lessonRes.rows[0];

  // 2️⃣ Supabase Vector → lesson content
  const { data } = await supabase
    .from("docs")
    .select("content")
    .eq("metadata->>lesson_id", lessonId)
    .limit(5);

  if (!data || data.length === 0) {
    return interaction.editReply(
      "⚠️ Энэ хичээлийн сургалтын материал олдсонгүй."
    );
  }

  const context = data.map(d => d.content).join("\n---\n");

  // 3️⃣ AI teaching
  const teaching = await chat(`
You are a Forex AI Trainer teaching beginners in Mongolian.

Lesson title: ${lesson.title}
Module: ${lesson.module}

Training material:
${context}

Rules:
- Simple Mongolian
- Short paragraphs
- One real example
- No profit promises
- End with 2 key takeaways
`);

  // 4️⃣ Progress тэмдэглэх (XP өгөхгүй)
  await pg.query(`
    insert into user_progress (user_id, lesson_id, completed, completed_at)
    values ($1, $2, true, now())
    on conflict (user_id, lesson_id)
    do update set completed = true, completed_at = now()
  `, [userId, lessonId]);

  // 5️⃣ Buttons (Next lesson + Quiz)
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`lesson_next:${lessonId}`)
      .setLabel("➡️ Next lesson")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`lesson_quiz:${lessonId}`)
      .setLabel("🧪 Quiz")
      .setStyle(ButtonStyle.Primary)
  );

    const textcomp = new TextDisplayBuilder().setContent(`
📘 **${lesson.title}**
📂 Module: ${lesson.module}

${teaching}

⬇️ **Дараагийн алхам**
`)
  const cont = new ContainerBuilder().addTextDisplayComponents(textcomp)


  // 6️⃣ Reply
  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
        components: [cont,actionRow],
  });
}
