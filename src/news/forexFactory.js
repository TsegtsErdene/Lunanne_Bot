import axios from "axios";
import * as cheerio from "cheerio";

const TARGET_EVENTS = [
  "Consumer Price Index",
  "Non-Farm Employment Change",
  "Federal Funds Rate",
  "FOMC Statement",
  "PCE Price Index",
  "Retail Sales",
  "Gross Domestic Product"
];

export async function fetchHighImpactGoldNews() {
  const url = "https://www.forexfactory.com/calendar";

  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const $ = cheerio.load(html);
  const events = [];

  $(".calendar__row").each((_, row) => {
    const impact = $(row).find(".impact span").attr("title");
    const title = $(row).find(".calendar__event-title").text().trim();
    const currency = $(row).find(".calendar__currency").text().trim();
    const time = $(row).find(".calendar__time").text().trim();

    if (
      impact === "High Impact Expected" &&
      currency === "USD" &&
      TARGET_EVENTS.some(e => title.includes(e))
    ) {
      events.push({ title, time });
    }
  });

  return events;
}

// CLI test
console.log(fetchHighImpactGoldNews())