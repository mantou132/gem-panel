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

export function removeItem<T>(arr: T[], item: T) {
  const index = arr.findIndex((e) => e === item);
  arr.splice(index, 1);
  return arr;
}

export function swapPosition<T>(arr: T[], item2: T, item1: T) {
  const index1 = arr.findIndex((e) => e === item1);
  const index2 = arr.findIndex((e) => e === item2);
  [arr[index1], arr[index2]] = [item2, item1];
  return arr;
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

export function findLimintPosition(arr: number[], limit: number) {
  let total = 0;
  for (let index = 0; index < arr.length; index++) {
    total += arr[index];
    if (total >= limit) {
      return { index, margin: total - limit };
    }
  }
  return { index: arr.length, margin: total - limit };
}

type Rect = { x: number; y: number; width: number; height: number };
export function isOutside(rect: Rect, target: Rect) {
  if (
    target.x >= rect.x + rect.width ||
    target.y >= rect.y + rect.height ||
    rect.x >= target.x + target.width ||
    rect.y >= target.y + target.height
  ) {
    return true;
  }
  return false;
}

export function keyBy<T>(arr: T[], key: keyof T) {
  const obj: { [name: string]: T } = {};
  for (const ele of arr) {
    obj[(ele[key] as unknown) as string] = ele;
  }
  return obj;
}

export function exclude<T>(obj: { [name: string]: T }, key: keyof T, arr: T[]) {
  for (const ele of arr) {
    delete obj[(ele[key] as unknown) as string];
  }
  return obj;
}

// only read and modify element
export function getFlipMatrix<T>(matrix: T[][]) {
  return new Proxy(matrix, {
    get(_, p) {
      return new Proxy(
        {},
        {
          get(_, c) {
            if (c in Array.prototype) {
              const arr = matrix.map((row) => row[p as any]);
              const v = arr[c as any];
              return typeof v === 'function' ? v.bind(arr) : arr[c as any];
            }
            return matrix[c as any][p as any];
          },
          set(_, c, v) {
            matrix[c as any][p as any] = v;
            return true;
          },
        },
      );
    },
  });
}
