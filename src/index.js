import { Client, GatewayIntentBits, Events } from "discord.js";
import "dotenv/config";

import { ask } from "./commands/ask.js";
import { lesson } from "./commands/lesson.js";
import { quiz } from "./commands/quiz.js";
import { progress } from "./commands/progress.js";
import { leaderboard } from "./commands/leaderboard.js";
import { lessons } from "./commands/lessons.js";

import { startGoldNewsService } from "./news/newsService.js";
import { test } from "./commands/test.js";
import { lessonQuizHandler } from "./handlers/lessonQuizHandler.js";
import { quizAnswerHandler } from "./handlers/quizAnswerHandler.js";
import { lessonNextHandler } from "./handlers/lessonNextHandler.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, async () => {
  console.log(`🤖 Ready: ${client.user.tag}`);

  // ⬇️ NEWS CHANNEL ID
  startGoldNewsService(client, process.env.NEWS_CHANNEL_ID);
});

client.on(Events.InteractionCreate, async i => {

  // 🧪 QUIZ ANSWER BUTTON
  if (i.isButton() && i.customId.startsWith("quiz_answer")) {
    return quizAnswerHandler(i);
  }

  // ➡️ NEXT LESSON
  if (i.isButton() && i.customId.startsWith("lesson_next")) {
    return lessonNextHandler(i);
  }

  // 🧪 QUIZ FROM LESSON
  if (i.isButton() && i.customId.startsWith("lesson_quiz")) {
    return lessonQuizHandler(i);
  }

  // ❌ Button биш бол command шалгана
  if (!i.isCommand()) return;

  // 📚 COMMANDS
  if (i.commandName === "lessons") return lessons(i);
  if (i.commandName === "leaderboard") return leaderboard(i);
  if (i.commandName === "ask") return ask(i);
  if (i.commandName === "lesson") return lesson(i);
  if (i.commandName === "quiz") return quiz(i);
  if (i.commandName === "progress") return progress(i);
  if (i.commandName === "test") return test(i);
});


client.login(process.env.DISCORD_TOKEN);
