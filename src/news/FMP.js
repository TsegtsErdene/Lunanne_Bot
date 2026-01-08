import axios from "axios";
import "dotenv/config";


const KEY_EVENTS = [
  "Consumer Price Index",
  "Non-Farm Employment Change",
  "Federal Funds Rate",
  "FOMC",
  "PCE Price Index",
  "Retail Sales",
  "Gross Domestic Product"
];

export async function fetchGoldImpactEvents() {
  const from = new Date().toISOString().slice(0, 10);
  const to = from;

  const url = `https://financialmodelingprep.com/stable/economic-calendar?apikey=${process.env.FMP_API_KEY}`;

  console.log(process.env.FMP_API_KEY)

  const { data } = await axios.get(url, {
    params: {
      from,
      to
    }
  });

  return data.filter(e =>
    e.country === "US" &&
    e.impact === "High" &&
    KEY_EVENTS.some(k => e.event.includes(k))
  );
}

console.log(await fetchGoldImpactEvents())