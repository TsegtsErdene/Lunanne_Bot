import { restClient } from "@massive.com/client-js";

export const massive = restClient(
  process.env.MASSIVE_API_KEY,
  "https://api.massive.com"
);
