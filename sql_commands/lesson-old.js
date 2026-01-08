// src/commands/lesson.js
import { pg } from "../src/db/pg.js";

export async function lesson(interaction) {
  const id = interaction.options.getString("day");

  const { rows } = await pg.query(
    "select * from lessons where id=$1",
    [id]
  );

  if (!rows.length)
    return interaction.reply("❌ Хичээл олдсонгүй");

  await interaction.reply(`
📘 ${rows[0].title}

${rows[0].content}

▶ /quiz start ${id}
`);
}

үүүүүүүүүүүүүүүү


import { supabase } from "../src/db/supabase.js";
import { pg } from "../src/db/pg.js";
import { chat } from "../src/ai/chat.js";

export async function lesson(interaction) {
  await interaction.deferReply();

  const lessonId = interaction.options.getString("lesson");

  // 1. lesson логик байгаа эсэх
  const lessonRes = await pg.query(
    "select * from lessons where id=$1",
    [lessonId]
  );

  if (!lessonRes.rows.length) {
    return interaction.editReply("❌ Ийм хичээл олдсонгүй.");
  }

  const lesson = lessonRes.rows[0];

  // 2. Supabase vector → lesson_id
  const { data } = await supabase
    .from("documents")
    .select("content")
    .eq("metadata->>lesson_id", lessonId)
    .limit(5);

  if (!data || data.length === 0) {
    return interaction.editReply("⚠️ Энэ хичээлийн контент олдсонгүй.");
  }

  const context = data.map(d => d.content).join("\n---\n");

  // 3. AI teaching
  const teaching = await chat(`
You are a Forex trainer teaching beginners in Mongolian.

Lesson title: ${lesson.title}
Module: ${lesson.module}

Training material:
${context}

Rules:
- Simple Mongolian
- One example
- End with 2 key takeaways
- Remind about demo trading
`);

  // 4. Progress тэмдэглэх
  await pg.query(`
    insert into user_progress (user_id, lesson_id, completed, completed_at)
    values ($1,$2,true,now())
    on conflict (user_id, lesson_id)
    do update set completed=true, completed_at=now()
  `, [interaction.user.id, lessonId]);

  await interaction.editReply(`
📘 **${lesson.title}**

${teaching}

▶ Дараагийн алхам:
\`/quiz ${lessonId}\`
`);
}



v3

import { pg } from "../src/db/pg.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export async function lesson(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const lessonId = interaction.options.getString("lesson");

  const pages = await pg.query(
    "select * from lesson_pages where lesson_id=$1 order by page",
    [lessonId]
  );

  if (!pages.rows.length) {
    return interaction.editReply("❌ Хичээл олдсонгүй");
  }

  const user = await interaction.user.createDM();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`lesson_next:${lessonId}:1`)
      .setLabel("▶ Next")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`lesson_quiz:${lessonId}`)
      .setLabel("🧪 Quiz")
      .setStyle(ButtonStyle.Secondary)
  );

  await user.send({
    content: `📘 **${lessonId}**\n\n${pages.rows[0].content}`,
    components: [row]
  });

  await interaction.editReply("📩 Хичээл DM-ээр илгээгдлээ");
}

client.on(Events.InteractionCreate, async i => {

  if (i.isButton() && i.customId === "testtt") {
    const modal = new ModalBuilder()
      .setCustomId("text_modal")
      .setTitle("Text оруулна уу");

    const input = new TextInputBuilder()
      .setCustomId("user_text")
      .setLabel("Энд бич")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input)
    );

    await i.showModal(modal);
    return;
  }
  

  if (i.isModalSubmit() && i.customId === "text_modal") {
  const text = i.fields.getTextInputValue("user_text");
  await i.reply({ content: `Чиний бичсэн текст: ${text}`, ephemeral: true });
}
