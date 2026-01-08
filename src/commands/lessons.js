import { pg } from "../db/pg.js";
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";

export async function lessons(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const userId = interaction.user.id;

  const res = await pg.query(`
    select
      l.id,
      l.module,
      l.title,
      exists (
        select 1
        from quiz_attempts qa
        where qa.lesson_id = l.id
          and qa.user_id = $1
      ) as completed
    from lessons l
    order by l.module, l.id
  `, [userId]);

  if (res.rows.length === 0) {
    return interaction.editReply("📭 Одоогоор хичээл алга байна.");
  }

  const grouped = {};
  for (const row of res.rows) {
    if (!grouped[row.module]) grouped[row.module] = [];
    grouped[row.module].push(row);
  }

  let text = "📚 **Боломжит хичээлүүд**\n\n";

  for (const module of Object.keys(grouped)) {
    text += `📘 **${module}**\n`;
    for (const lesson of grouped[module]) {
      //text += `${lesson.completed ? "✅" : "▫️"} \`${lesson.id}\` — ${lesson.title}\n`;
      text += `• \`${lesson.id}\` — ${lesson.title}  ${lesson.completed ? "✅" : ""} \n`;
    }
    text += "\n";
  }

  text += "➡️ **Хичээл үзэх:**\n`/lesson <lesson_id>`";

  const textcomp = new TextDisplayBuilder().setContent(text)
  const cont = new ContainerBuilder().addTextDisplayComponents(textcomp)

  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [cont],
  });
}
