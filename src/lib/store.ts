import { createStore, updateStore } from '@mantou/gem';
import { WINDOW_HOVER_BORDER } from './const';
import { Config, Panel, PannelContent, Window } from './config';
import { detectPosition } from './utils';
import { GemPanelWindowElement } from '../elements/window';
import { HoverWindowPosition } from '../elements/window-mask';
import { MoveSideArgs, Side } from '../elements/window-handle';
import { OpenPanelMenuBeforeCallback } from '../elements/root';

type AppState = {
  config: Config;
  openPanelMenuBefore?: OpenPanelMenuBeforeCallback;
  windowPanTimer: number;
  hoverWindow: null | Window;
  panWindow: null | Window;
  hoverWindowPosition: HoverWindowPosition;
};
type WindowConfig = { window: Window };
type PanelConfig = WindowConfig & { panel: Panel };

export const store = createStore<AppState>({
  config: new Config(),
  windowPanTimer: 0,
  hoverWindow: null,
  hoverWindowPosition: 'center',
  panWindow: null,
});

export function updateAppState(state: Partial<AppState>) {
  updateStore(store, state);
}

export function openHiddenPanel(panel: Panel) {
  store.config.openHiddenPanel(panel);
  updateStore(store);
}

export function openPanelInWindow(panel: Panel, window: Window) {
  store.config.openPanelInWindow(panel, window);
  updateStore(store);
}

export function loadContentInPanel(panel: Panel, content: PannelContent) {
  panel.loadContent(content);
  updateStore(store);
}

export function independentPanel({ window }: WindowConfig, panel: Panel, rect: [number, number, number, number]) {
  const newWindow = store.config.createIndependentWindow(window, panel, rect);
  updateStore(store);
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
        const isCenterPostion =
          !hoverWindowEle.window.isGridWindow() || width < 4 * WINDOW_HOVER_BORDER || height < 3 * WINDOW_HOVER_BORDER;
        updateStore(store, {
          hoverWindow: hoverWindowEle.window,
          panWindow: currentPanWindow,
          hoverWindowPosition: isCenterPostion
            ? 'center'
            : detectPosition([x, y, width, height], [clientX, clientY], WINDOW_HOVER_BORDER),
        });
      }
    }, 400),
  });
}

export function cancelHandleWindow() {
  updateStore(store, { hoverWindow: null, panWindow: null });
}

export function dropHandleWindow({ window }: WindowConfig) {
  clearTimeout(store.windowPanTimer);
  if (store.hoverWindow) {
    store.config.focusWindow(store.hoverWindow);
    if (store.hoverWindowPosition === 'center') {
      store.config.mergeWindow(window, store.hoverWindow);
    } else {
      store.config.createGridWindow(window, store.hoverWindow, store.hoverWindowPosition);
    }
    cancelHandleWindow();
  }
}

export function updateCurrentPanel({ window }: WindowConfig, panel: Panel) {
  window.changeCurrent(window.panels.findIndex((p) => p === panel));
  updateStore(store);
}

export function updatePanelSort({ window }: WindowConfig, p1: Panel, p2: Panel) {
  window.changePanelSort(p1, p2);
  updateStore(store);
}

export function updateWindowPosition({ window }: WindowConfig, movement: [number, number]) {
  store.config.moveWindow(window, movement);
  updateStore(store);
}

export function updateWindowRect({ window }: WindowConfig, movement: [number, number, number, number]) {
  store.config.changeWindowRect(window, movement);
  updateStore(store);
}

export function updateWindowZIndex({ window }: WindowConfig) {
  store.config.focusWindow(window);
  updateStore(store);
}

export function updateWindowType({ window }: WindowConfig, { x, y, width, height }: DOMRect) {
  store.config.removeWindow(window, [x, y, width, height]);
  updateStore(store);
}

export function closePanel({ window, panel }: PanelConfig) {
  store.config.closePanel(window, panel);
  updateStore(store);
}

export function closeWindow({ window }: WindowConfig) {
  store.config.removeWindow(window);
  updateStore(store);
}

export function moveSide({ window }: WindowConfig, side: Side, args: MoveSideArgs) {
  store.config.moveSide(window, side, args);
  updateStore(store);
}
