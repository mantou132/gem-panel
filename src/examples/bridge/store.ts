import { createStore, randomStr, updateStore } from '@mantou/gem';
import { getPathFolder } from './utils';

export const layoutModes = ['essentials', 'libraries'] as const;
export type LayoutMode = typeof layoutModes[number];

const types = ['image', 'file', 'folder'] as const;
export type Type = typeof types[number];

export type Item = {
  parent: Item | null;
  filename: string;
  type: Type;
  modifiedTime: number;
  width?: number;
  height?: number;
  content?: { [key: string]: Item };
};

export type Filter = (item: Item) => boolean | undefined;

type BridgeStore = {
  selection: Set<Item>;
  favorites: Set<Item>;
  path: string[];
  filters: Set<Filter>;
  mode: LayoutMode;
  content?: { [key: string]: Item };
};

export const bridgeStore = createStore<BridgeStore>({
  favorites: new Set(),
  selection: new Set(),
  path: [],
  filters: new Set(),
  mode: (localStorage.getItem('mode') as LayoutMode) || 'essentials',
  content: undefined,
});

export function updateLayoutMode(mode: LayoutMode) {
  localStorage.setItem('mode', mode);
  updateStore(bridgeStore, { mode });
}

export function updateSelection(selection: Item[]) {
  updateStore(bridgeStore, { selection: new Set(selection) });
}

export function toggleFilter(filter: Filter) {
  if (bridgeStore.filters.has(filter)) {
    bridgeStore.filters.delete(filter);
  } else {
    bridgeStore.filters.add(filter);
  }
  updateStore(bridgeStore);
}

export function removeAllFilter() {
  bridgeStore.filters.clear();
  updateStore(bridgeStore);
}

export function toggleFavorite(item: Item) {
  if (bridgeStore.favorites.has(item)) {
    bridgeStore.favorites.delete(item);
  } else {
    bridgeStore.favorites.add(item);
  }
  updateStore(bridgeStore);
}

export function fetchFolderContent(folder: Item) {
  const fetchContent = () => {
    const content: { [key: string]: Item } = {};
    Array(Math.ceil(Math.random() * 100))
      .fill(null)
      .forEach((_, index) => {
        const filename = `${randomStr()}${index}`;
        const type = types[Math.floor(Math.random() * types.length)];
        const width = type === 'image' ? 300 + Math.floor(Math.random() * 1000) : undefined;
        const height = type === 'image' ? 300 + Math.floor(Math.random() * 1000) : undefined;
        const modifiedTime = Date.now() - Math.floor(Math.random() * 1000 * 1000 * 60 * 60 * 24);
        content[filename] = {
          parent: folder,
          filename,
          type,
          width,
          height,
          modifiedTime,
        } as Item;
      });
    return content;
  };
  if (!folder.content) {
    folder.content = fetchContent();
    updateStore(bridgeStore);
  }
}

export function updatePath(path: string[]) {
  const folder = getPathFolder((bridgeStore as unknown) as Item, path);
  fetchFolderContent(folder);
  updateStore(bridgeStore, { path });
}
