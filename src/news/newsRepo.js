import { pg } from "../db/pg.js";

export async function isNewsExists(id) {
  const { rows } = await pg.query(
    "SELECT 1 FROM gold_news WHERE id = $1",
    [id]
  );
  return rows.length > 0;
}

export async function saveNews(news, goldPrice, summaryMn) {
  await pg.query(
    `
    INSERT INTO gold_news
      (id, title, url, published_utc, gold_price, summary_mn)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    `,
    [
      news.id,
      news.title,
      news.article_url,
      news.published_utc,
      goldPrice,
      summaryMn
    ]
  );
}
