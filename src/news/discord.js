import axios from "axios";

export async function sendToDiscord(news, analysis) {
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    embeds: [
      {
        title: "🟡 Gold News",
        description: `**${news.title}**\n\n${analysis}`,
        url: news.article_url,
        footer: {
          text: `Source: ${news.publisher?.name || "Massive"}`
        },
        timestamp: news.published_utc,
        color: 15844367
      }
    ]
  });
}
