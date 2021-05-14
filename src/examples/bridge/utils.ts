import { Item, Type } from './store';

export function getPathFolder(rootFolder: Item, path: string[]) {
  let folder = rootFolder;
  path.forEach((fragment) => {
    if (folder.content) {
      folder = folder.content[fragment];
    }
  });
  return folder;
}

export function getImage(item: Item, size?: number) {
  const { type, width, height } = item;
  const colorMap: { [key in Type]: string } = {
    image: 'ccc',
    folder: '74d0fb',
    file: '666',
  };
  if (type === 'image') {
    let w = width as number;
    let h = height as number;
    if (size) {
      const s = Math.max(w, h) / size;
      [w, h] = [Math.floor(w / s), Math.floor(h / s)];
    }
    return `https://via.placeholder.com/${w}x${h}?text=${width}x${height}`;
  }
  return `https://via.placeholder.com/100/${colorMap[type]}?text=${type}`;
}
