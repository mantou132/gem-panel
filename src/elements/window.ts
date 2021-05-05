import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { getThemeStore } from '@mantou/gem/helper/theme';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { Panel, Window } from '../lib/config';
import {
  cancelHandleWindow,
  dropHandleWindow,
  setWindowPanTimeout,
  moveSide,
  store,
  updateCurrentPanel,
  updatePanelSort,
  updateWindowPosition,
  updateWindowType,
  updateWindowZIndex,
  independentPanel,
  updateWindowDimension,
} from '../lib/store';

import './panel-title';
import './window-mask';
import { GemPanelTitleElement } from './panel-title';
import { distance } from '../lib/utils';
import { theme } from '../lib/theme';
import {
  CANCEL_WINDOW_DRAG_DISTANCE,
  ENTWE_PANEL_SORT_DISTANCE,
  NEWWINDOW_FROM_PANEL_Y_OFFSET,
  WINDOW_TITLEBAR_HEIGHT,
} from '../lib/const';

const sides = ['top', 'right', 'bottom', 'left'] as const;
export type Side = typeof sides[number];

const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;
export type Corner = typeof corners[number];

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
};

@customElement('gem-panel-window')
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
  };

  #onMoveTitleStart = (panel: Panel, evt: PointerEvent) => {
    evt.stopPropagation(); // prevent <gem-gesture>
    this.#onFocusWindow(); // manual trigger
    const target = evt.currentTarget as HTMLElement;
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
    evt.stopPropagation();
    const { panel, move, offsetX, offsetY, parentOffsetY, clientX, clientY, independentWindow } = this.state;
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
    const target = evt.currentTarget as HTMLElement;
    target.setPointerCapture(evt.pointerId);
    // first move
    if (!move && distance(evt.clientX - clientX, evt.clientY - clientY) < ENTWE_PANEL_SORT_DISTANCE) return;
    if (Math.abs(evt.clientY - (parentOffsetY + offsetY)) > NEWWINDOW_FROM_PANEL_Y_OFFSET) {
      const { width, height } = this.getBoundingClientRect();
      const independentWindow = independentPanel(this, panel, [
        evt.clientX - offsetX,
        evt.clientY - offsetY - WINDOW_TITLEBAR_HEIGHT,
        width,
        height,
      ]);
      // enter panel move mode
      this.setState({
        panel: null,
        move: false,
        independentWindow,
        clientX: evt.clientX,
        clientY: evt.clientY,
      });
    } else {
      this.setState({ move: true, clientX: evt.clientX, clientY: evt.clientY });
      const ele = this.shadowRoot?.elementFromPoint(evt.clientX, parentOffsetY + offsetY);
      if (ele instanceof GemPanelTitleElement && ele.panel !== panel) {
        updatePanelSort(this, panel, ele.panel);
      }
    }
  };

  #onMoveTitleEnd = (evt: PointerEvent) => {
    evt.stopPropagation();
    const { independentWindow } = this.state;
    setTimeout(() => {
      if (independentWindow) {
        dropHandleWindow({ window: independentWindow });
      }
      this.setState({ panel: null, move: false, independentWindow: null });
    });
  };

  #onFocusPanel = (index: number) => {
    const { move, independentWindow } = this.state;
    if (!move && !independentWindow) {
      updateCurrentPanel(this, index);
    }
  };

  #onHeaderPan = ({ detail }: CustomEvent<PanEventDetail>) => {
    clearTimeout(store.windowPanTimer);
    if (this.window.isGridWindow()) {
      updateWindowType(this, this.getBoundingClientRect());
    } else {
      setWindowPanTimeout(this, this.window, [detail.clientX, detail.clientY]);
      if (distance(detail.x, detail.y) > CANCEL_WINDOW_DRAG_DISTANCE) {
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

  #onSidePan = ({ detail }: CustomEvent<PanEventDetail>, side: Side) => {
    const { width, height } = this.getBoundingClientRect();
    const gapStr = getThemeStore(theme).windowGap;
    let gap = 0;
    if (gapStr.trim().endsWith('px')) {
      gap = parseFloat(gapStr);
    } else {
      console.info('Cause the moving axis to shake!');
    }
    moveSide(this, side, [detail.x / width, detail.y / height, gap / width, gap / height]);
  };

  #onCornerPan = ({ detail: { x, y } }: CustomEvent<PanEventDetail>, corner: Corner) => {
    const movement = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };
    if (corner === 'top-left') {
      movement.w = -x;
      movement.h = -y;
      movement.x = x;
      movement.y = y;
    }
    if (corner === 'top-right') {
      movement.w = x;
      movement.h = -y;
      movement.y = y;
    }
    if (corner === 'bottom-right') {
      movement.w = x;
      movement.h = y;
    }
    if (corner === 'bottom-left') {
      movement.x = x;
      movement.w = -x;
      movement.h = y;
    }
    updateWindowPosition(this, [movement.x, movement.y]);
    updateWindowDimension(this, [movement.w, movement.h]);
  };

  #onFocusWindow = () => {
    if (!this.window.isGridWindow()) {
      updateWindowZIndex(this);
    }
  };

  mounted = () => {
    this.addEventListener('pointerdown', this.#onFocusWindow);
  };

  render = () => {
    const isGrid = this.window.isGridWindow();
    const { panels, gridArea, current = 0, position, dimension, zIndex } = this.window;
    const { panel, move, offsetX, clientX, parentOffsetX, independentWindow } = this.state;
    // Render the left panel to keep event listening
    const independentPanel = independentWindow?.panels[0];

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
        .title.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .title.temp {
          pointer-events: none;
          position: absolute;
          top: ${theme.panelContentGap};
          left: 0;
          transform: translateX(${clientX - offsetX - parentOffsetX}px);
          border-bottom-color: ${theme.focusColor};
        }
        .content {
          padding: ${theme.panelContentGap};
          padding-top: 0;
          position: relative;
          height: 0;
          flex-grow: 1;
        }
        .top,
        .right,
        .bottom,
        .left {
          position: absolute;
        }
        :is(.top, .bottom) {
          cursor: row-resize;
        }
        :is(.right, .left) {
          cursor: col-resize;
        }
        .top,
        .bottom {
          width: 100%;
          height: ${theme.windowGap};
        }
        .right,
        .left {
          width: ${theme.windowGap};
          height: 100%;
        }
        .top {
          bottom: 100%;
        }
        .right {
          left: 100%;
        }
        .bottom {
          top: 100%;
        }
        .left {
          right: 100%;
        }
        .top-left,
        .top-right,
        .bottom-right,
        .bottom-left {
          position: absolute;
          width: 8px;
          height: 8px;
          z-index: 1;
        }
        .top-left {
          top: 0;
          left: 0;
          cursor: nwse-resize;
        }
        .top-right {
          top: 0;
          right: 0;
          cursor: nesw-resize;
        }
        .bottom-right {
          bottom: 0;
          right: 0;
          cursor: nwse-resize;
        }
        .bottom-left {
          bottom: 0;
          left: 0;
          cursor: nesw-resize;
        }
      </style>
      ${isGrid
        ? sides.map(
            (side) => html`
              <gem-gesture
                class=${side}
                @pan=${(evt: CustomEvent<PanEventDetail>) => this.#onSidePan(evt, side)}
              ></gem-gesture>
            `,
          )
        : ''}
      ${isGrid ? '' : html`<gem-gesture class="bar" @pan=${this.#onHeaderPan} @end=${this.#onHeaderEnd}></gem-gesture>`}
      <div class="flex">
        <gem-gesture
          class="widthgrow header"
          @wheel=${this.#onHeaderWheel}
          @pan=${this.#onHeaderPan}
          @end=${this.#onHeaderEnd}
        >
          ${panels.concat(independentPanel || []).map(
            (p, index) =>
              html`
                <gem-panel-title
                  class=${`
                  ${(p === panel && move) || (index !== 0 && p === independentPanel) ? 'hidden' : ''}
                  ${index === current ? 'active' : ''}
                  title
                `}
                  .window=${this.window}
                  .panel=${p}
                  @click=${() => this.#onFocusPanel(index)}
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
      <div class="flex content">
        <div class="widthgrow">${panels[current].content}</div>
      </div>
      ${store.hoverWindow === this.window ? html`<gem-panel-mask></gem-panel-mask>` : ''}
      ${isGrid
        ? ''
        : corners.map(
            (corner) => html`
              <gem-gesture
                class=${corner}
                @pan=${(evt: CustomEvent<PanEventDetail>) => this.#onCornerPan(evt, corner)}
              ></gem-gesture>
            `,
          )}
    `;
  };
}
