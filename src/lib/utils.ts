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

export function isEqualArray(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  return a.every((e, index) => e === b[index]);
}

export function distance(x: number, y: number) {
  return Math.sqrt(x ** 2 + y ** 2);
}

export function removeItem(arr: any[], item: any) {
  const index = arr.findIndex((e) => e === item);
  arr.splice(index, 1);
}

export function detectPosition([ox, oy, w, h]: number[], [px, py]: [number, number], border: number) {
  const [x, y] = [px - ox, py - oy];
  if (x >= y && y >= 0 && y <= border && x <= w - y) {
    return 'top';
  } else if (x >= w - border && x <= w && y >= w - x && y <= h - (w - x)) {
    return 'right';
  } else if (y >= h - border && y <= h && x >= h - y && x <= w - (h - y)) {
    return 'bottom';
  } else if (x >= 0 && x <= border && y >= x && y <= h - x) {
    return 'left';
  }
  return 'center';
}
