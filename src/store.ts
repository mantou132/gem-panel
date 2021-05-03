import { createStore, updateStore } from '@mantou/gem';
import { WINDOW_BORDER } from './const';
import { Side, GemPanelWindowElement } from './elements/window';
import { HoverWindowPosition } from './elements/window-mask';
import { Config, Panel, Window } from './lib/config';
import { detectPosition } from './lib/utils';

type AppStore = {
  windowPanTimer: number;
  hoverWindow: null | Window;
  panWindow: null | Window;
  hoverWindowPosition: HoverWindowPosition;
};
type WindowConfig = { config: Config; window: Window };
type PanelConfig = WindowConfig & { panel: Panel };

export const store = createStore<AppStore>({
  windowPanTimer: 0,
  hoverWindow: null,
  hoverWindowPosition: 'center',
  panWindow: null,
});

export function independentPanel(ele: GemPanelWindowElement, panel: Panel, [x, y]: [number, number]) {
  const { config, window } = ele;
  const { width, height } = ele.getBoundingClientRect();
  const newWindow = config.createIndependentWindow(window, panel, [x, y, width, height]);
  updateStore(store, {});
  return newWindow;
}

export function setWindowPanTimeout(
  ele: GemPanelWindowElement,
  currentPanWindow: Window,
  [clientX, clientY]: [number, number],
) {
  updateStore(store, {
    windowPanTimer: window.setTimeout(() => {
      const rootShadowDom = (ele.getRootNode() as unknown) as ShadowRoot;
      const windowEles = rootShadowDom
        .elementsFromPoint(clientX, clientY)
        .filter((e) => 'window' in e) as GemPanelWindowElement[];
      const currentWindowEle = windowEles.find((e) => e.window === currentPanWindow);
      const hoverWindowEle = windowEles.find((e) => e !== currentWindowEle && e.window !== currentWindowEle?.window);
      if (hoverWindowEle) {
        const { x, y, width, height } = hoverWindowEle.getBoundingClientRect();
        const isSmall = width < 4 * WINDOW_BORDER || height < 3 * WINDOW_BORDER;
        updateStore(store, {
          hoverWindow: hoverWindowEle.window,
          panWindow: currentPanWindow,
          hoverWindowPosition: isSmall
            ? 'center'
            : detectPosition([x, y, width, height], [clientX, clientY], WINDOW_BORDER),
        });
      }
    }, 400),
  });
}

export function cancelHandleWindow() {
  updateStore(store, { hoverWindow: null, panWindow: null });
}

export function dropHandleWindow({ config, window }: WindowConfig) {
  clearTimeout(store.windowPanTimer);
  if (store.hoverWindow) {
    if (store.hoverWindowPosition === 'center') {
      config.mergeWindow(window, store.hoverWindow);
    } else {
      config.createWindow(window, store.hoverWindowPosition);
    }
    cancelHandleWindow();
  }
}

export function updateCurrentPanel({ window }: WindowConfig, current: number) {
  window.changeCurrent(current);
  updateStore(store, {});
}

export function updatePanelSort({ window }: WindowConfig, p1: Panel, p2: Panel) {
  window.changePanelSort(p1, p2);
  updateStore(store, {});
}

export function updateWindowPosition({ config, window }: WindowConfig, movement: [number, number]) {
  config.moveWindowPosition(window, movement);
  updateStore(store, {});
}

export function updateWindowZIndex({ config, window }: WindowConfig) {
  config.focusWindow(window);
  updateStore(store, {});
}

export function updateWindowType({ config, window }: WindowConfig, { x, y, width, height }: DOMRect) {
  config.removeWindow(window, [x, y, width, height]);
  updateStore(store, {});
}

export function closePanel({ config, window, panel }: PanelConfig) {
  config.closePanel(window, panel);
  updateStore(store, {});
}

export function moveSide({ config, window }: WindowConfig, side: Side, movmentPercentage: [number, number]) {
  config.moveSide(window, side, movmentPercentage);
  updateStore(store, {});
}
