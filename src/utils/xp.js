// src/utils/xp.js
import { pg } from "../db/pg.js";

export async function addXP(userId, xp) {
  await pg.query(`
    insert into user_progress (user_id, total_xp)
    values ($1,$2)
    on conflict (user_id)
    do update set
      total_xp = user_progress.total_xp + $2,
      level = floor((user_progress.total_xp + $2)/500)+1
  `,[userId,xp]);
}
