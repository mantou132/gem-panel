import { createStore, updateStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import { GemPanelTitleElement } from './elements/panel-title';
import { Side, GemPanelWindowElement } from './elements/window';
import { Panel, Window } from './lib/config';

type AppStore = { windowPanTimer: number; hoverWindow: null | Window; panWindow: null | Window };

export const store = createStore<AppStore>({
  windowPanTimer: 0,
  hoverWindow: null,
  panWindow: null,
});

export function setWindowPanTimeout(ele: GemPanelWindowElement, [clientX, clientY]: [number, number]) {
  updateStore(store, {
    windowPanTimer: window.setTimeout(() => {
      const shadowDom = (ele.getRootNode() as unknown) as ShadowRoot;
      const eles = shadowDom.elementsFromPoint(clientX, clientY) as GemPanelWindowElement[];
      const e = eles.find((e) => e !== ele && e.window && e.window !== ele.window);
      if (e) {
        updateStore(store, { hoverWindow: e.window, panWindow: ele.window });
      }
    }, 400),
  });
}

export function cancelHandleWindow() {
  updateStore(store, { hoverWindow: null, panWindow: null });
}

export function cancelAndMergeWindow({ config, window }: GemPanelWindowElement) {
  clearTimeout(store.windowPanTimer);
  if (store.hoverWindow) {
    config.mergeWindow(window, store.hoverWindow);
    cancelHandleWindow();
  }
}

export function updateCurrentPanel({ window }: GemPanelWindowElement, current: number) {
  window.changeCurrent(current);
  updateStore(store, {});
}

export function updatePanelSort({ window }: GemPanelWindowElement, p1: Panel, p2: Panel) {
  window.changePanelSort(p1, p2);
  updateStore(store, {});
}

export function updateWindowPosition({ config, window }: GemPanelWindowElement, x: number, y: number) {
  config.changeWindowPosition(window, x, y);
  updateStore(store, {});
}

export function updateWindowZIndex({ config, window }: GemPanelWindowElement) {
  config.focusWindow(window);
  updateStore(store, {});
}

export function updateWindowType(ele: GemPanelWindowElement) {
  const { config, window } = ele;
  const { x, y, width, height } = ele.getBoundingClientRect();
  config.removeWindow(window, [x, y, width, height]);
  updateStore(store, {});
}

export function closePanel({ config, window, panel }: GemPanelTitleElement) {
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
