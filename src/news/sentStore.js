const sent = new Set();

export function isSent(id) {
  return sent.has(id);
}

export function markSent(id) {
  sent.add(id);
}
