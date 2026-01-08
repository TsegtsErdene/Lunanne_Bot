import { quiz } from "../commands/quiz.js";

export async function lessonQuizHandler(interaction) {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("lesson_quiz:")) return;

  // 🔑 Button interaction ACK
  await interaction.deferUpdate();

  const lessonId = interaction.customId.split(":")[1];

  // 🆕 QUIZ-ийг ШИНЭ МЕССЕЖЭЭР эхлүүлэх
  const followUpMessage = await interaction.followUp({
    content: "🧪 **Quiz эхэлж байна...**",
    fetchReply: true   // 👈 маш чухал
  });

  // 🧠 quiz()-д хэрэгтэй fake interaction
  const fakeInteraction = {
    ...interaction,
    replied: false,
    deferred: false,
    reply: options => followUpMessage.reply(options),
    editReply: options => followUpMessage.edit(options),
    deferReply: async () => {}, // noop
    options: {
      getString: () => lessonId
    }
  };

  await quiz(fakeInteraction);
}
