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

export async function lessonNextHandler(interaction) {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("lesson_next:")) return;

  await interaction.deferUpdate();

  // ─────────────────────────────────────────
  // 1️⃣ LOADING STATE
  // ─────────────────────────────────────────
  const loadingContainer = new ContainerBuilder().addTextDisplayComponents(
    new TextDisplayBuilder().setContent("⏳ **Дараагийн хичээлийг бэлтгэж байна...**")
  );

  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [loadingContainer]
  });

  try {
    const currentLessonId = interaction.customId.split(":")[1];
    const userId = interaction.user.id;

    // ─────────────────────────────────────────
    // 2️⃣ NEXT LESSON DATA
    // ─────────────────────────────────────────
    const currentRes = await pg.query(
      "select module from lessons where id = $1",
      [currentLessonId]
    );

    if (!currentRes.rows.length) {
      throw new Error("CURRENT_LESSON_NOT_FOUND");
    }

    const module = currentRes.rows[0].module;

    const nextRes = await pg.query(
      `
      select *
      from lessons
      where module = $1
        and id > $2
      order by id
      limit 1
      `,
      [module, currentLessonId]
    );

    if (!nextRes.rows.length) {
      const doneContainer = new ContainerBuilder().addTextDisplayComponents(
  new TextDisplayBuilder().setContent("🎉 **Энэ модулийн бүх хичээлийг үзсэн байна!**")
);

return interaction.editReply({
  flags: MessageFlags.IsComponentsV2,
  components: [doneContainer]
});
    }

    const lesson = nextRes.rows[0];

    // ─────────────────────────────────────────
    // 3️⃣ VECTOR CONTENT
    // ─────────────────────────────────────────
    const { data } = await supabase
      .from("docs")
      .select("content")
      .eq("metadata->>lesson_id", lesson.id)
      .limit(5);

    if (!data?.length) {
      throw new Error("LESSON_CONTENT_NOT_FOUND");
    }

    const context = data.map(d => d.content).join("\n---\n");

    // ─────────────────────────────────────────
    // 4️⃣ AI TEACHING
    // ─────────────────────────────────────────
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
- Mention that quiz is required to earn points
`);

    // ─────────────────────────────────────────
    // 5️⃣ SAVE PROGRESS (NO XP)
    // ─────────────────────────────────────────
    await pg.query(
      `
      insert into user_progress (user_id, lesson_id, completed, completed_at)
      values ($1, $2, true, now())
      on conflict (user_id, lesson_id)
      do update set completed = true, completed_at = now()
      `,
      [userId, lesson.id]
    );

    // ─────────────────────────────────────────
    // 6️⃣ FINAL UI
    // ─────────────────────────────────────────
    const lessonCard = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`
📘 **${lesson.title}**
📂 Module: ${lesson.module}

${teaching}

⬇️ **Дараагийн алхам**
`)
    );

    const actions = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`lesson_next:${lesson.id}`)
        .setLabel("➡️ Next lesson")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`lesson_quiz:${lesson.id}`)
        .setLabel("🧪 Quiz")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [lessonCard, actions]
    });

  } catch (err) {
    console.error("Lesson Next Error:", err);

    const errorContainer = new ContainerBuilder().addTextDisplayComponents(
  new TextDisplayBuilder().setContent("❌ **Алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.**")
);

await interaction.editReply({
  flags: MessageFlags.IsComponentsV2,
  components: [errorContainer]
});
  }
}
