import { createStore, updateStore } from '@mantou/gem';
import { DROP_DETECTION_DELAY, WINDOW_HOVER_DETECT_BORDER, WINDOW_HOVER_DETECT_HEADER_HEIGHT } from './const';
import { Layout, Window } from './layout';
import { Panel, PanelContent } from './panel';
import { detectPosition } from './utils';
import { GemPanelWindowElement } from '../elements/window';
import { HoverWindowPosition } from '../elements/window-mask';
import { MoveSideArgs, Side } from '../elements/window-handle';

type AppState = {
  layout: Layout;
  panels: { [name: string]: Panel };
  windowPanTimer: number;
  hoverWindow: null | Window;
  panWindow: null | Window;
  hoverWindowPosition: HoverWindowPosition;
};

export const store = createStore<AppState>({
  layout: new Layout(),
  panels: {},
  windowPanTimer: 0,
  hoverWindow: null,
  hoverWindowPosition: 'center',
  panWindow: null,
});

export function updateAppState(state: Partial<AppState>) {
  updateStore(store, state);
}

export function addHiddenPanel(panel: Panel) {
  store.panels[panel.name] = panel;
}

export function deleteHiddenPanel(panelName: string) {
  delete store.panels[panelName];
}

export function deletePanelFromWindow(window: Window, panelName: string) {
  store.layout.closePanel(window, panelName);
  deleteHiddenPanel(panelName);
  updateStore(store);
}

export function openHiddenPanel(panelName: string) {
  store.layout.openHiddenPanel(panelName);
  updateStore(store);
}

export function openPanelInWindow(window: Window, panelName: string) {
  store.layout.openPanelInWindow(window, panelName);
  updateStore(store);
}

export function loadContentInPanel(panelName: string, content: PanelContent) {
  const panel = store.panels[panelName];
  if (!panel) return;
  panel.detail.content = content;
  updateStore(store);
}

export function independentPanel(window: Window, panelName: string, rect: [number, number, number, number]) {
  const newWindow = store.layout.createIndependentWindow(window, panelName, rect);
  updateStore(store);
  return newWindow;
}

export function setWindowPanTimeout(
  ele: GemPanelWindowElement,
  currentPanWindow: Window,
  [clientX, clientY]: [number, number],
) {
  const detectHoverWindow = () => {
    const rootShadowDom = (ele.getRootNode() as unknown) as ShadowRoot;
    const windowEles = rootShadowDom
      .elementsFromPoint(clientX, clientY)
      .filter((e) => 'window' in e) as GemPanelWindowElement[];
    const currentWindowEle = windowEles.find((e) => e.window === currentPanWindow);
    const hoverWindowEle = windowEles.find((e) => e !== currentWindowEle && e.window !== currentWindowEle?.window);
    if (hoverWindowEle) {
      const { x, y, width, height } = hoverWindowEle.getBoundingClientRect();
      const isCenterPostion =
        !hoverWindowEle.window.isGridWindow() ||
        width < 4 * WINDOW_HOVER_DETECT_BORDER ||
        height < 3 * WINDOW_HOVER_DETECT_BORDER + 2 * WINDOW_HOVER_DETECT_HEADER_HEIGHT;
      const isHeader = clientY > y && clientY < y + WINDOW_HOVER_DETECT_HEADER_HEIGHT;
      const hoverWindowPosition = isCenterPostion
        ? 'center'
        : isHeader
        ? 'header'
        : detectPosition(
            [x, y + WINDOW_HOVER_DETECT_HEADER_HEIGHT, width, height - WINDOW_HOVER_DETECT_HEADER_HEIGHT],
            [clientX, clientY],
            WINDOW_HOVER_DETECT_BORDER,
          );

      updateStore(store, {
        hoverWindow: hoverWindowEle.window,
        panWindow: currentPanWindow,
        hoverWindowPosition,
      });
    }
  };
  if (store.hoverWindow) {
    detectHoverWindow();
  } else {
    updateStore(store, { windowPanTimer: window.setTimeout(detectHoverWindow, DROP_DETECTION_DELAY) });
  }
}

export function cancelHandleWindow() {
  updateStore(store, { hoverWindow: null, panWindow: null });
}

export function dropHandleWindow(window: Window) {
  clearTimeout(store.windowPanTimer);
  if (store.hoverWindow) {
    if (store.hoverWindowPosition === 'center' || store.hoverWindowPosition === 'header') {
      store.layout.mergeWindow(window, store.hoverWindow);
    } else {
      store.layout.createGridWindow(window, store.hoverWindow, store.hoverWindowPosition);
    }
    cancelHandleWindow();
  }
}

export function updateCurrentPanel(window: Window, panelName: string) {
  window.changeCurrent(window.panels.findIndex((p) => p === panelName));
  updateStore(store);
}

export function updatePanelSort(window: Window, p1: string, p2: string) {
  window.changePanelSort(p1, p2);
  updateStore(store);
}

export function updateWindowPosition(window: Window, movement: [number, number]) {
  store.layout.moveWindow(window, movement);
  updateStore(store);
}

export function updateWindowRect(window: Window, movement: [number, number, number, number]) {
  store.layout.changeWindowRect(window, movement);
  updateStore(store);
}

export function updateWindowZIndex(window: Window) {
  store.layout.focusWindow(window);
  updateStore(store);
}

export function updateWindowType(window: Window, { x, y, width, height }: DOMRect) {
  store.layout.removeWindow(window, [x, y, width, height]);
  updateStore(store);
}

export function closePanel(window: Window, panelName: string) {
  store.layout.closePanel(window, panelName);
  updateStore(store);
}

export function closeWindow(window: Window) {
  store.layout.removeWindow(window);
  updateStore(store);
}

export function moveSide(window: Window, side: Side, args: MoveSideArgs) {
  store.layout.moveSide(window, side, args);
  updateStore(store);
}
