import { createStore, randomStr, updateStore } from '@mantou/gem';

export const layoutModes = ['essentials', 'libraries'] as const;
export type LayoutMode = typeof layoutModes[number];

const types = ['image', 'file', 'folder'] as const;
export type Type = typeof types[number];

export type Item = {
  filename: string;
  type: Type;
  modifiedTime: number;
  width?: number;
  height?: number;
  src?: string;
  content?: { [key: string]: Item };
};

type Filter = {
  type?: Type;
  width?: number;
  height?: number;
};

type BridgeStore = {
  selection: Set<Item>;
  path: string[];
  filter: Filter;
  mode: LayoutMode;
  content?: { [key: string]: Item };
};

export const bridgeStore = createStore<BridgeStore>({
  selection: new Set(),
  path: [],
  filter: {},
  mode: 'essentials',
  content: undefined,
});

export function getCurrentFolder() {
  let folder = (bridgeStore as unknown) as Item;
  bridgeStore.path.forEach((fragment) => {
    folder = folder.content![fragment];
  });
  return folder;
}

export function updateLayoutMode(mode: LayoutMode) {
  updateStore(bridgeStore, { mode });
}

export function updateSelection(selection: Item[]) {
  updateStore(bridgeStore, { selection: new Set(selection) });
}

export function updateFilter(filter: Filter) {
  updateStore(bridgeStore, { filter: { ...bridgeStore.filter, ...filter } });
}

export function updatePath(path: string[]) {
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
        const src = type === 'image' ? `https://via.placeholder.com/${width}x${height}` : undefined;
        content[filename] = {
          filename,
          type,
          width,
          height,
          modifiedTime,
          src,
        } as Item;
      });
    return content;
  };
  const folder = getCurrentFolder();
  if (!folder.content) {
    folder.content = fetchContent();
  }
  updateStore(bridgeStore, { path });
}
