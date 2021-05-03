import { createStore, updateStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import { Side, GemPanelWindowElement } from './elements/window';
import { Config, Panel, Window } from './lib/config';

type AppStore = { windowPanTimer: number; hoverWindow: null | Window; panWindow: null | Window };
type WindowConfig = { config: Config; window: Window };
type PanelConfig = WindowConfig & { panel: Panel };

export const store = createStore<AppStore>({
  windowPanTimer: 0,
  hoverWindow: null,
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
        updateStore(store, { hoverWindow: hoverWindowEle.window, panWindow: currentPanWindow });
      }
    }, 400),
  });
}

export function cancelHandleWindow() {
  updateStore(store, { hoverWindow: null, panWindow: null });
}

export function cancelAndMergeWindow({ config, window }: WindowConfig) {
  clearTimeout(store.windowPanTimer);
  if (store.hoverWindow) {
    config.mergeWindow(window, store.hoverWindow);
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

export function updateWindowType(ele: GemPanelWindowElement) {
  const { config, window } = ele;
  const { x, y, width, height } = ele.getBoundingClientRect();
  config.removeWindow(window, [x, y, width, height]);
  updateStore(store, {});
}

export function closePanel({ config, window, panel }: PanelConfig) {
  config.closePanel(window, panel);
  updateStore(store, {});
}

export function moveSide(ele: GemPanelWindowElement, side: Side, { x, y }: PanEventDetail) {
  const { width, height } = ele.getBoundingClientRect();
  const { config, window } = ele;

  if (side === 'top' || side === 'bottom') {
    const axisIndex = config.findHAxis(window);
    config.moveHAxis(side === 'top' ? axisIndex : axisIndex + 1, (y / height) * config.getWindowHeight(window));
  } else {
    const axisIndex = config.findVAxis(window);
    config.moveVAxis(side === 'left' ? axisIndex : axisIndex + 1, (x / width) * config.getWindowWidth(window));
  }
  updateStore(store, {});
}
