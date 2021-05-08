import { html, GemElement, customElement, connectStore } from '@mantou/gem';
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
  ENTWE_WINDOW_DRAGOVER_DISTANCE,
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
  offsetX: number;
  offsetY: number;
  parentOffsetX: number;
  parentOffsetY: number;
  clientX: number;
  clientY: number;
  scrollX: number;
};

@customElement(windowTagName)
@connectStore(store)
export class GemPanelWindowElement extends GemElement<State> {
  window: Window;

  state: State = {
    independentWindow: null,
    panel: null,
    move: false,
    offsetX: 0,
    offsetY: 0,
    parentOffsetX: 0,
    parentOffsetY: 0,
    clientX: 0,
    clientY: 0,
    scrollX: 0,
  };

  #onMoveTitleStart = (panel: Panel, evt: PointerEvent) => {
    evt.stopPropagation(); // prevent <gem-gesture>
    const target = evt.currentTarget as HTMLElement;
    target.setPointerCapture(evt.pointerId);
    const { x, y } = target.getBoundingClientRect();
    const parentRect = target.offsetParent?.getBoundingClientRect();
    this.setState({
      panel,
      offsetX: evt.clientX - x,
      offsetY: evt.clientY - y,
      parentOffsetX: parentRect?.x,
      parentOffsetY: parentRect?.y,
      clientX: evt.clientX,
      clientY: evt.clientY,
    });
  };

  #onMoveTitle = (evt: PointerEvent) => {
    const { panel, move, offsetY, parentOffsetY, clientX, clientY } = this.state;
    if (!panel) return;
    // first move
    if (!move && distance(evt.clientX - clientX, evt.clientY - clientY) < ENTWE_PANEL_SORT_DISTANCE) return;

    const target = evt.currentTarget as HTMLElement;
    if (Math.abs(evt.clientY - (parentOffsetY + offsetY)) > NEWWINDOW_FROM_PANEL_Y_OFFSET) {
      this.#createIndependentWindow(evt);
    } else {
      this.setState({
        move: true,
        clientX: evt.clientX,
        clientY: evt.clientY,
        scrollX: target.offsetParent?.scrollLeft,
      });
      const ele = this.shadowRoot?.elementFromPoint(evt.clientX, parentOffsetY + offsetY);
      if (ele instanceof GemPanelTitleElement && ele.panel !== panel) {
        updatePanelSort(this, panel, ele.panel);
      }
    }
  };

  #onMoveTitleEnd = () => {
    // pointerup -> click
    setTimeout(() => {
      this.setState({ panel: null, move: false });
    });
  };

  #createIndependentWindow = (evt: PointerEvent) => {
    const { panel, offsetX, offsetY } = this.state;
    if (!panel) return;
    // Transfer event target
    this.setPointerCapture(evt.pointerId);
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
  };

  #onMove = (evt: PointerEvent) => {
    const { clientX, clientY, independentWindow } = this.state;
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
  };

  #onMoveEnd = () => {
    const { independentWindow } = this.state;
    if (independentWindow) {
      dropHandleWindow({ window: independentWindow });
      this.setState({ independentWindow: null });
    }
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
      if (distance(detail.x, detail.y) > ENTWE_WINDOW_DRAGOVER_DISTANCE) {
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
    this.addEventListener('pointermove', this.#onMove);
    this.addEventListener('pointerup', this.#onMoveEnd);
    this.addEventListener('pointercancel', this.#onMoveEnd);
  };

  render = () => {
    const isGrid = this.window.isGridWindow();
    const { panels, gridArea, current = 0, position, dimension, zIndex } = this.window;
    const { panel, move, offsetX, clientX, scrollX, parentOffsetX } = this.state;

    return html`
      <style>
        :host {
          display: flex;
          position: ${isGrid ? 'relative' : 'absolute'};
          left: ${position?.[0]}px;
          top: ${position?.[1]}px;
          width: ${dimension?.[0]}px;
          height: ${dimension?.[1]}px;
          grid-area: ${gridArea || 'none'};
          z-index: ${isGrid ? 0 : zIndex};
          gap: ${theme.panelContentGap};
        }
        :host(:focus-within) {
          z-index: ${isGrid ? 1 : zIndex};
        }
        .window {
          flex-grow: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: ${theme.backgroundColor};
          box-shadow: ${isGrid ? 'none' : '0 0.3em 1em rgba(0, 0, 0, .4)'};
          opacity: ${store.panWindow === this.window ? 0.5 : 1};
          border-radius: ${isGrid ? '0' : '4px'};
          border: 1px solid ${isGrid ? 'transparent' : theme.borderColor};
        }
        .bar {
          height: ${WINDOW_TITLEBAR_HEIGHT}px;
          background: ${theme.darkBackgroundColor};
          margin-bottom: calc(0px - ${theme.panelContentGap});
        }
        .header,
        .content {
          overflow: auto;
          scrollbar-width: none;
        }
        :is(.header, .content)::-webkit-scrollbar {
          width: 0;
        }
        .header-wrap {
          display: flex;
        }
        .header {
          width: 0;
          flex-grow: 1;
          padding: ${theme.panelContentGap};
          overflow: hidden;
          position: relative;
          display: flex;
          gap: 1.8em;
        }
        .title {
          position: relative;
          background: ${theme.backgroundColor};
          flex-shrink: 0;
          border-bottom: 2px solid transparent;
        }
        .title.active {
          color: ${theme.primaryColor};
          border-color: currentColor;
        }
        .title.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .title.temp {
          pointer-events: none;
          position: absolute;
          top: ${theme.panelContentGap};
          left: 0;
          transform: translateX(${clientX - offsetX - parentOffsetX + scrollX}px);
          border-bottom-color: ${theme.focusColor};
        }
        .content {
          padding: ${theme.panelContentGap};
          padding-top: 0;
          position: relative;
          z-index: 1;
          height: 0;
          flex-grow: 1;
        }
        :is(.window, .content):is(:focus, :focus-visible) {
          outline: none;
        }
      </style>
      <div part="window ${isGrid ? 'cell-window' : 'fixed-window'}" tabindex="0" class="window">
        ${isGrid
          ? ''
          : html`
              <gem-gesture
                part="window-bar"
                class="bar"
                @pan=${this.#onHeaderPan}
                @end=${this.#onHeaderEnd}
              ></gem-gesture>
            `}
        <div class="header-wrap">
          <gem-gesture
            part="panel-header"
            class="header"
            @wheel=${this.#onHeaderWheel}
            @pan=${this.#onHeaderPan}
            @end=${this.#onHeaderEnd}
          >
            ${panels.map(
              (p, index) =>
                html`
                  <gem-panel-title
                    part="panel-title ${index === current ? 'panel-active-title' : ''}"
                    exportparts="panel-button"
                    class=${`
                    ${p === panel && move ? 'hidden' : ''}
                    ${index === current ? 'active' : ''}
                    title
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
            ${panel && move
              ? html`
                  <gem-panel-title
                    part="panel-title panel-drag-title ${panels[current] === panel ? 'panel-active-title' : ''}"
                    exportparts="panel-button"
                    class=${`title temp ${panels[current] === panel ? 'active' : ''}`}
                    .window=${this.window}
                    .panel=${panel}
                  >
                    ${panel.title}
                  </gem-panel-title>
                `
              : ''}
          </gem-gesture>
        </div>
        <!-- Insert content here to style the window -->
        <div part="panel-content" class="content">${panels[current].content}</div>
        ${store.hoverWindow === this.window ? html`<gem-panel-mask></gem-panel-mask>` : ''}
      </div>
      <gem-panel-handle .window=${this.window}></gem-panel-handle>
    `;
  };
}
