import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { pg } from "../db/pg.js";

export async function leaderboard(interaction) {
  await interaction.deferReply();

  const limit = 10;

  const res = await pg.query(`
    select user_id, xp, level
    from user_xp
    order by xp desc
    limit $1
  `, [limit]);

  if (res.rows.length === 0) {
    return interaction.editReply("📭 Одоогоор leaderboard хоосон байна.");
  }

  let text = "🏆 **e**\n\n";

  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows[i];
    const rank = i + 1;

    let medal = "";
    if (rank === 1) medal = "🥇";
    else if (rank === 2) medal = "🥈";
    else if (rank === 3) medal = "🥉";
    else medal = `${rank}.`;

    text += `${medal} <@${row.user_id}> — ${row.xp} XP (Level ${row.level})\n`;
  }

  const textcomp = new TextDisplayBuilder().setContent(text)
  const cont = new ContainerBuilder().addTextDisplayComponents(textcomp)

  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [cont],
  });
}
