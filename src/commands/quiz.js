// src/commands/quiz.js
import { pg } from "../db/pg.js";
import { chat } from "../ai/chat.js";
import { sendQuestion } from "../quiz/sendQuestion.js";
import { supabase } from "../db/supabase.js";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

// 🔥 EXPORT ХИЙСЭН
export const activeQuizzes = new Map();
function extractJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}


export async function quiz(interaction) {
  if (!interaction.deferred && !interaction.replied) {
  await interaction.deferReply();
}

  const lessonId = interaction.options.getString("lesson");
  const userId = interaction.user.id;

  // Lesson үзсэн эсэх шалгах
  const progress = await pg.query(`
    select completed from user_progress
    where user_id=$1 and lesson_id=$2
  `, [userId, lessonId]);

  if (!progress.rows.length || !progress.rows[0].completed) {
    return interaction.editReply(
      `❌ Эхлээд /lesson ${lessonId} үзэх хэрэгтэй.`
    );
  }

  // 2️⃣ Supabase Vector → lesson content
  const { data } = await supabase
    .from("docs")
    .select("content")
    .eq("metadata->>lesson_id", lessonId)
    .limit(5);

  if (!data || data.length === 0) {
    return interaction.editReply(
      "⚠️ Энэ хичээлийн сургалтын материал олдсонгүй."
    );
  }

  const context = data.map(d => d.content).join("\n---\n")

  // AI quiz үүсгэх
  const quizJSON = await chat(`
Create a beginner Forex quiz in Mongolian.

Topic: ${lessonId}

Content: ${context}

Rules:
- Exactly 3 questions
- Multiple choice A-D
- One correct answer
- Provide a short explanation for the correct answer
- Simple wording
- DO NOT use markdown
- DO NOT use code blocks
- Return ONLY raw JSON

Format:
[
  {
    "question": "",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": ""
  }
]
`);


  let questions;
try {
  const cleanJSON = extractJSON(quizJSON);
  questions = JSON.parse(cleanJSON);
  console.log("Quiz parsed:", questions);
} catch (err) {
  console.error("Quiz JSON parse error:", quizJSON);
  return interaction.editReply("❌ Quiz үүсгэхэд алдаа гарлаа.");
}


  activeQuizzes.set(userId, {
    lessonId,
    questions,
    current: 0,
    correct: 0
  });

  await sendQuestion(interaction, userId);
}

