import { REST, Routes } from "discord.js";
import "dotenv/config";

const commands = [
  {
    name: "lesson",
    description: "Хичээл эхлүүлэх (агуулгаар)",
    options: [
      {
        name: "lesson",
        description: "lesson_id (ж: pip, risk_basics)",
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: "quiz",
    description: "Хичээлийн шалгалт эхлүүлэх",
    options: [
      {
        name: "lesson",
        description: "lesson_id (ж: pip, risk_basics)",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "ask",
    description: "Forex асуулт асуух",
    options: [
      {
        name: "question",
        description: "Таны асуулт (Forex ойлголт)",
        type: 3,
        required: true
      }
    ]
  },
    {
  name: "leaderboard",
  description: "XP дээр суурилсан шилдэг трейдерүүд"
},
  {
    name: "progress",
    description: "Миний сургалтын явц"
  },
  {
  name: "lessons",
  description: "Бүх боломжит хичээлүүдийг харах"
},
{
  name: "test",
  description: "Энэ бол тест baby woo hoo"
}

];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Slash command-уудыг шинэчилж байна...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash command-ууд амжилттай шинэчлэгдлээ");
  } catch (err) {
    console.error("❌ Slash command update error:", err);
  }
})();
