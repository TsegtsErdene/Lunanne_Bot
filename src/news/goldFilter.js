const GOLD_KEYWORDS = [
  "gold",
  "xau",
  "bullion",
  "precious metal",
  "safe haven",
  "federal reserve",
  "fed",
  "interest rate",
  "inflation",
  "us dollar",
  "treasury",
  "yield"
];

export function isGoldRelated(news) {
  const text = `
    ${news.title}
    ${news.description || ""}
    ${(news.keywords || []).join(" ")}
  `.toLowerCase();

  return GOLD_KEYWORDS.some(k => text.includes(k));
}
