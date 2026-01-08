import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import { activeQuizzes } from "../commands/quiz.js";

export async function sendQuestion(interaction, userId) {
  const quiz = activeQuizzes.get(userId);
  if (!quiz) return;

  const q = quiz.questions[quiz.current];

  const row = new ActionRowBuilder().addComponents(
    q.options.map((opt, idx) =>
      new ButtonBuilder()
        .setCustomId(`quiz_answer:${userId}:${idx}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  const content =
    `🧪 **Асуулт ${quiz.current + 1} / ${quiz.questions.length}**\n\n${q.question}`;

  // ❗ ЭНД ЗӨВХӨН editReply
  await interaction.editReply({
    content,
    components: [row]
  });
}
