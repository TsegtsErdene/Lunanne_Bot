import axios from "axios";

export async function getGoldPrice() {
  const { data } = await axios.get("https://api.gold-api.com/price/XAU");
  return Number(data.price.toFixed(2));
}
