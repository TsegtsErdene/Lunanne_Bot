import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeGoldNews(news, goldPrice) {
  const prompt = `
You are a professional gold (XAU/USD) analyst in Mongolian.You should respond in Mongolian

Current gold Price: ${goldPrice}

News title: ${news.title}
Description: ${news.description}

Return exactly:
Bias: Bullish / Bearish / Neutral
• Reason 1
• Reason 2
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }]
  });

  return res.choices[0].message.content;
}
