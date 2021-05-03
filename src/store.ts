import { createStore, updateStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import { GemPanelTitleElement } from './elements/panel-title';
import { Side, GemPanelWindowElement } from './elements/window';
import { Panel } from './lib/config';

export const store = createStore({});

export function updateCurrentPanel({ window }: GemPanelWindowElement, current: number) {
  window.changeCurrent(current);
  updateStore(store, {});
}

export function updatePanelSort({ window }: GemPanelWindowElement, p1: Panel, p2: Panel) {
  window.changePanelSort(p1, p2);
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
