import { html, GemElement, customElement, connectStore, repeat } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { Panel, Window } from '../lib/config';
import {
  cancelHandleWindow,
  dropHandleWindow,
  setWindowPanTimeout,
  store,
  updateCurrentPanel,
  updatePanelSort,
  updateWindowPosition,
  updateWindowType,
  updateWindowZIndex,
  independentPanel,
} from '../lib/store';
import { GemPanelTitleElement } from './panel-title';
import { distance } from '../lib/utils';
import { theme } from '../lib/theme';
import {
  CANCEL_WINDOW_DRAGOVER_DISTANCE,
  ENTWE_PANEL_SORT_DISTANCE,
  NEWWINDOW_FROM_PANEL_Y_OFFSET,
  WINDOW_TITLEBAR_HEIGHT,
} from '../lib/const';

import './panel-title';
import './window-mask';
import './window-handle';

export const windowTagName = 'gem-panel-window';

type State = {
  independentWindow: Window | null; // store?
  panel: Panel | null;
  move: boolean;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
};

@customElement(windowTagName)
@connectStore(store)
export class GemPanelWindowElement extends GemElement<State> {
  window: Window;

  state: State = {
    independentWindow: null,
    panel: null,
    move: false,
    clientX: 0,
    clientY: 0,
    offsetX: 0,
    offsetY: 0,
    originX: 0,
    originY: 0,
    width: 0,
    height: 0,
  };

  #onMoveTitleStart = (panel: Panel, evt: PointerEvent) => {
    evt.stopPropagation(); // prevent <gem-gesture>
    const target = evt.currentTarget as HTMLElement;
    const { x, y, width, height } = target.getBoundingClientRect();
    this.setState({
      panel,
      clientX: evt.clientX,
      clientY: evt.clientY,
      offsetX: evt.clientX - x,
      offsetY: evt.clientY - y,
      originX: x,
      originY: y,
      width,
      height,
    });
  };

  #onMoveTitle = (evt: PointerEvent) => {
    const target = evt.currentTarget as HTMLElement;
    // pointerdown setPointerCapture title 不能触发内部按钮点击
    target.setPointerCapture(evt.pointerId);
    const { panel, move, width, offsetX, offsetY, originY, clientX, clientY, independentWindow } = this.state;
    if (independentWindow) {
      clearTimeout(store.windowPanTimer);
      this.setState({ clientX: evt.clientX, clientY: evt.clientY });
      const [x, y] = [evt.clientX - clientX, evt.clientY - clientY];
      updateWindowPosition({ window: independentWindow }, [x, y]);
      setWindowPanTimeout(this, independentWindow, [evt.clientX, evt.clientY]);
      if (distance(x, y) > 4) {
        cancelHandleWindow();
      }
    }
    if (!panel) return;
    // first move
    if (!move && distance(evt.clientX - clientX, evt.clientY - clientY) < ENTWE_PANEL_SORT_DISTANCE) return;

    if (Math.abs(evt.clientY - (originY + offsetY)) > NEWWINDOW_FROM_PANEL_Y_OFFSET) {
      const { width, height } = this.getBoundingClientRect();
      const independentWindow = independentPanel(this, panel, [
        evt.clientX - offsetX,
        evt.clientY - offsetY - WINDOW_TITLEBAR_HEIGHT,
        width,
        height,
      ]);
      this.setState({
        independentWindow,
        panel: null,
        move: false,
        clientX: evt.clientX,
        clientY: evt.clientY,
      });
    } else {
      this.setState({ move: true, clientX: evt.clientX, clientY: evt.clientY });
      const eles = this.shadowRoot?.elementsFromPoint(evt.clientX, originY + offsetY);
      const ele = eles?.find((e) => e instanceof GemPanelTitleElement && e.panel !== panel) as GemPanelTitleElement;
      if (!ele) return;
      const eleRect = ele.getBoundingClientRect();
      if (evt.clientX > clientX ? evt.clientX > eleRect.x + eleRect.width - width : evt.clientX < eleRect.x + width) {
        updatePanelSort(this, panel, ele.panel);
        this.setState({ originX: evt.clientX > clientX ? eleRect.x + eleRect.width - width : eleRect.x });
      }
    }
  };

  #onMoveTitleEnd = () => {
    const { independentWindow } = this.state;
    // pointerup -> click
    setTimeout(() => {
      if (independentWindow) {
        dropHandleWindow({ window: independentWindow });
      }
      this.setState({ panel: null, move: false, independentWindow: null });
    });
  };

  #onActivePanel = (panel: Panel) => {
    const { move, independentWindow } = this.state;
    if (!move && !independentWindow) {
      updateCurrentPanel(this, panel);
    }
  };

  #onHeaderPan = ({ detail }: CustomEvent<PanEventDetail>) => {
    clearTimeout(store.windowPanTimer);
    if (this.window.isGridWindow()) {
      if (distance(detail.x, detail.y) > CANCEL_WINDOW_DRAGOVER_DISTANCE) {
        updateWindowType(this, this.getBoundingClientRect());
      }
    } else {
      setWindowPanTimeout(this, this.window, [detail.clientX, detail.clientY]);
      if (distance(detail.x, detail.y) > CANCEL_WINDOW_DRAGOVER_DISTANCE) {
        cancelHandleWindow();
      }
      updateWindowPosition(this, [detail.x, detail.y]);
    }
  };

  #onHeaderEnd = () => {
    dropHandleWindow(this);
  };

  #onHeaderWheel = (evt: WheelEvent) => {
    const target = evt.currentTarget as HTMLElement;
    target.scrollBy(evt.deltaY, 0);
  };

  #onFocusWindow = () => {
    updateWindowZIndex(this);
  };

  mounted = () => {
    this.addEventListener('focus', this.#onFocusWindow);
  };

  render = () => {
    const isGrid = this.window.isGridWindow();
    const { panels, gridArea, current = 0, position, dimension, zIndex } = this.window;
    const { panel, move, clientX, originX, offsetX } = this.state;

    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: ${theme.backgroundColor};
          gap: ${theme.panelContentGap};
          position: ${isGrid ? 'relative' : 'absolute'};
          left: ${position?.[0]}px;
          top: ${position?.[1]}px;
          width: ${dimension?.[0]}px;
          height: ${dimension?.[1]}px;
          grid-area: ${gridArea || 'none'};
          z-index: ${isGrid ? 0 : zIndex};
          overflow: ${isGrid ? 'visible' : 'hidden'};
          box-shadow: ${isGrid ? 'none' : '0 0.3em 1em rgba(0, 0, 0, .4)'};
          opacity: ${store.panWindow === this.window ? 0.5 : 1};
          border-radius: ${isGrid ? '0' : '4px'};
        }
        :host::after {
          content: ${isGrid ? 'none' : '""'};
          pointer-events: none;
          border-radius: inherit;
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          box-sizing: border-box;
          border: 1px solid ${theme.borderColor};
        }
        .bar {
          height: ${WINDOW_TITLEBAR_HEIGHT}px;
          background: ${theme.darkBackgroundColor};
          margin-bottom: calc(0px - ${theme.panelContentGap});
        }
        .flex {
          display: flex;
        }
        .widthgrow {
          width: 0;
          flex-grow: 1;
          overflow: auto;
          scrollbar-width: none;
        }
        .widthgrow::-webkit-scrollbar {
          width: 0;
        }
        .header {
          padding: ${theme.panelContentGap};
          overflow: hidden;
          position: relative;
          display: flex;
          flex-shrink: 0;
          gap: 1.8em;
        }
        .title {
          position: relative;
          background: ${theme.backgroundColor};
          flex-shrink: 0;
          border-bottom: 2px solid transparent;
        }
        .title.active {
          z-index: 1;
          color: ${theme.primaryColor};
          border-color: currentColor;
        }
        .title.moveing {
          transform: translateX(${clientX - originX - offsetX}px);
          border-bottom-color: ${theme.focusColor};
        }
        .content {
          padding: ${theme.panelContentGap};
          padding-top: 0;
          position: relative;
          height: 0;
          flex-grow: 1;
        }
      </style>
      ${isGrid ? '' : html`<gem-gesture class="bar" @pan=${this.#onHeaderPan} @end=${this.#onHeaderEnd}></gem-gesture>`}
      <div class="flex">
        <gem-gesture
          class="widthgrow header"
          @wheel=${this.#onHeaderWheel}
          @pan=${this.#onHeaderPan}
          @end=${this.#onHeaderEnd}
        >
          ${repeat(
            panels,
            (p) => p.title,
            (p, index) =>
              html`
                <gem-panel-title
                  class=${`
              title
              ${p === panel && move ? 'moveing' : ''}
              ${index === current ? 'active' : ''}
            `}
                  .window=${this.window}
                  .panel=${p}
                  @click=${() => this.#onActivePanel(p)}
                  @pointerdown=${(evt: PointerEvent) => this.#onMoveTitleStart(p, evt)}
                  @pointermove=${this.#onMoveTitle}
                  @pointerup=${this.#onMoveTitleEnd}
                  @pointercancel=${this.#onMoveTitleEnd}
                >
                  ${p.title}
                </gem-panel-title>
              `,
          )}
        </gem-gesture>
      </div>
      <div class="flex content">
        <div class="widthgrow">${panels[current].content}</div>
      </div>
      ${store.hoverWindow === this.window ? html`<gem-panel-mask></gem-panel-mask>` : ''}
      <gem-panel-handle .window=${this.window}></gem-panel-handle>
    `;
  };
}
