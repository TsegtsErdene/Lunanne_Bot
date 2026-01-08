import { pg } from "../db/pg.js";
import { activeQuizzes } from "../commands/quiz.js";
import { sendQuestion } from "../quiz/sendQuestion.js";
import {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags
} from "discord.js";

/**
 * Quiz Answer Handler (FINAL)
 *
 * - Quiz явц: legacy editReply
 * - Quiz дуусах: followUp + Components V2
 * - XP = зөв хариулт × 100
 * - Буруу асуултын тайлбар харуулна
 */
export async function quizAnswerHandler(interaction) {
  try {
    if (!interaction.isButton()) return;

    const [, userId, selectedIndex] = interaction.customId.split(":");

    // 🔑 ACK
    await interaction.deferUpdate();

    // ❌ Өөр хүний quiz дарахыг хориглоно
    if (interaction.user.id !== userId) return;

    const quiz = activeQuizzes.get(userId);
    if (!quiz) return;

    // 🧠 Wrong answers array
    if (!quiz.wrongAnswers) quiz.wrongAnswers = [];

    const currentQ = quiz.questions[quiz.current];
    const selected = Number(selectedIndex);
    const isCorrect = selected === currentQ.answer;

    // 📊 Оноо
    if (isCorrect) {
      quiz.correct++;
    } else {
      quiz.wrongAnswers.push({
        question: currentQ.question,
        correctOption: currentQ.options[currentQ.answer],
        explanation: currentQ.explanation || "Тайлбар байхгүй."
      });
    }

    quiz.current++;

    await interaction.editReply({
      content: isCorrect ? "✅ Зөв!" : "❌ Буруу!",
      components: []
    });


    // ─────────────────────────────────────────
    // 🏁 QUIZ ДУУССАН
    // ─────────────────────────────────────────
    if (quiz.current >= quiz.questions.length) {
      const xpPerQuestion = 100;
      const xpEarned = quiz.correct * xpPerQuestion;

   
      // 🧹 Memory цэвэрлэх
      activeQuizzes.delete(userId);

      // 🧠 Алдааны тайлбар
      let explanationText = "";

      if (quiz.wrongAnswers.length > 0) {
        explanationText += "\n📘 **Буруу хариулсан асуултуудын тайлбар:**\n";
        quiz.wrongAnswers.forEach((w, i) => {
          explanationText += `
${i + 1}. **${w.question}**
✔ Зөв: ${w.correctOption}
ℹ️ ${w.explanation}
`;
        });
      } else {
        explanationText += "\n🎉 **Бүх асуултад зөв хариуллаа! Маш сайн байна.**";
      }

      

      // 🧾 Final result (V2)
      const resultText = new TextDisplayBuilder().setContent(`
🏁 **Quiz дууслаа**

🧪 Асуулт: ${quiz.questions.length}
✅ Зөв: ${quiz.correct}
❌ Буруу: ${quiz.questions.length - quiz.correct}

⭐ XP авсан: +${xpEarned}

${explanationText}

📌 **Сануулахад**
Зөв хариулт бүр 100 XP өгдөг.
`);

      const resultContainer = new ContainerBuilder()
        .addTextDisplayComponents(resultText);

      // ❗ ШИНЭ MESSAGE → followUp
      
      try {
        // await interaction.message.delete();
      } catch (e) {
        console.warn("Quiz message delete failed:", e.message);
      }

      await interaction.followUp({
        flags: MessageFlags.IsComponentsV2,
        components: [resultContainer],
      });

         // 🧪 Quiz attempt хадгалах
      await pg.query(
        `
        insert into quiz_attempts (user_id, lesson_id, score)
        values ($1, $2, $3)
        `,
        [userId, quiz.lessonId, quiz.correct]
      );

      // ⭐ XP хадгалах
      if (xpEarned > 0) {
        await pg.query(
          `
          insert into user_xp (user_id, xp)
          values ($1, $2)
          on conflict (user_id)
          do update set
            xp = user_xp.xp + $2,
            level = floor((user_xp.xp + $2) / 500) + 1
          `,
          [userId, xpEarned]
        );
      }


      return;
    }

    // ─────────────────────────────────────────
    // ▶️ QUIZ ЯВЦ (LEGACY)
    // ─────────────────────────────────────────
    
    
    // ⏳ Дараагийн асуулт
    setTimeout(async () => {
      try {
        await sendQuestion(interaction, userId);
      } catch (err) {
        console.error("sendQuestion error:", err);
      }
    }, 800);

  } catch (err) {
    console.error("quizAnswerHandler error:", err);
  }
}

