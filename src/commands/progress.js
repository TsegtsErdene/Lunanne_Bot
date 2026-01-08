import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from "discord.js";
import { pg } from "../db/pg.js";

export async function progress(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const userId = interaction.user.id;

  // 1️⃣ Module progress
  const progressRes = await pg.query(`
    select
      l.module,
      count(distinct l.id) as total,
      count(distinct qa.lesson_id) as completed
    from lessons l
    left join quiz_attempts qa
      on qa.lesson_id = l.id
      and qa.user_id = $1
    group by l.module
    order by l.module
  `, [userId]);

  // 2️⃣ Badge олгох (if eligible)
  await pg.query(`
    insert into user_badges (user_id, badge_id)
    select
      $1,
      b.id
    from badges b
    where not exists (
      select 1 from user_badges ub
      where ub.user_id = $1 and ub.badge_id = b.id
    )
    and not exists (
      select 1
      from lessons l
      left join quiz_attempts qa
        on qa.lesson_id = l.id and qa.user_id = $1
      where l.module = b.module
      and qa.lesson_id is null
    )
  `, [userId]);

  // 3️⃣ User XP
  const xpRes = await pg.query(
    "select xp, level from user_xp where user_id=$1",
    [userId]
  );

  const xp = xpRes.rows[0] ?? { xp: 0, level: 1 };

  // 4️⃣ User badges
  const badgeRes = await pg.query(`
    select b.title
    from user_badges ub
    join badges b on b.id = ub.badge_id
    where ub.user_id = $1
  `, [userId]);

  // 5️⃣ Response build
  let text = "📊 **Таны сургалтын явц**\n\n";

  for (const row of progressRes.rows) {
    text += `📘 ${row.module}: ${row.completed} / ${row.total}\n`;
  }

  text += `\n🏅 **Авсан badge:**\n`;
  if (badgeRes.rows.length === 0) {
    text += "• Одоогоор алга\n";
  } else {
    for (const b of badgeRes.rows) {
      text += `• ${b.title}\n`;
    }
  }

  text += `\n🏆 Level: ${xp.level}\n⭐ XP: ${xp.xp}`;

  const textcomp = new TextDisplayBuilder().setContent(text)
  const cont = new ContainerBuilder().addTextDisplayComponents(textcomp)

  await interaction.editReply({
    flags: MessageFlags.IsComponentsV2,
    components: [cont],
  });
}
