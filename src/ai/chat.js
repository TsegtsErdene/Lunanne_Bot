import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chat(prompt) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a Forex trainer teaching in Mongolian." },
      { role: "user", content: prompt }
    ]
  });
  return res.choices[0].message.content;
}
