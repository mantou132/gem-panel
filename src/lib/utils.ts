export default function add(a: number, b: number) {
  return a + b;
}

export function getNewFocusElementIndex(arr: any[], currentFocusIndex: number, deleteIndex: number) {
  if (arr.length === 1) return -1;
  if (deleteIndex >= currentFocusIndex) {
    if (currentFocusIndex > arr.length - 2) return arr.length - 2;
    return currentFocusIndex;
  }
  return currentFocusIndex - 1;
}
