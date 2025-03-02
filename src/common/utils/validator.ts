export function isThenable(thing?: any): boolean {
  return !!(thing && thing.then);
}
