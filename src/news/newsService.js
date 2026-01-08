import cron from "node-cron";
import { massive } from "./massiveClient.js";
import { isGoldRelated } from "./goldFilter.js";
import { analyzeGoldNews } from "./aiAnalysis.js";
import { getGoldPrice } from "./goldPrice.js";
import { isNewsExists, saveNews } from "./newsRepo.js";

export function startGoldNewsService(client, channelId) {
  console.log("🟡 Gold News Service (Postgres) started");

  cron.schedule("*/1 * * * *", async () => {
    try {
      const res = await massive.listNews({
        order: "desc",
        limit: "20",
        sort: "published_utc"
      });


      const channel = await client.channels.fetch(channelId);
      if (!channel) return;

      const goldPrice = await getGoldPrice();

      for (const news of res.results || []) {
        if (!isGoldRelated(news)) continue;
        if (await isNewsExists(news.id)) continue;

        const summaryMn = await analyzeGoldNews(news, goldPrice);

        await channel.send({
          embeds: [
            {
              title: "🟡 Алтны мэдээ",
              description:
                `**${news.title}**\n\n` +
                `💰 **Алтны үнэ:** $${goldPrice}\n\n` +
                `${summaryMn}`,
              url: news.article_url,
              footer: {
                text: `Эх сурвалж: ${news.publisher?.name || "Massive"}`
              },
              timestamp: news.published_utc,
              color: 15844367
            }
          ]
        });

        await saveNews(news, goldPrice, summaryMn);
      }
    } catch (err) {
      console.error("❌ Gold News Service error:", err.message);
    }
  });
}
