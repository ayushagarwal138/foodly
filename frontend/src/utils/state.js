export function sameData(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function keepPreviousIfSame(previous, next) {
  return sameData(previous, next) ? previous : next;
}
