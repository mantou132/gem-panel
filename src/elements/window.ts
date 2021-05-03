import { html, GemElement, customElement, connectStore, updateStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { Config, Panel, Window } from '../lib/config';
import {
  cancelHandleWindow,
  moveSide,
  store,
  updateCurrentPanel,
  updatePanelSort,
  updateWindowPosition,
  updateWindowType,
  updateWindowZIndex,
} from '../store';

import './panel-title';
import { GemPanelTitleElement } from './panel-title';
import { distance } from '../lib/utils';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type Side = typeof sides[number];

type State = {
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
  config: Config;
  window: Window;

  state: State = {
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
    evt.stopPropagation();
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
    evt.stopPropagation();
    const { panel, move, offsetY, parentOffsetY, clientX, clientY } = this.state;
    if (!panel) return;
    // first move
    if (!move && distance(evt.clientX - clientX, evt.clientY - clientY) < 4) return;
    this.setState({ move: true, clientX: evt.clientX, clientY: evt.clientY });
    const ele = this.shadowRoot?.elementFromPoint(evt.clientX, parentOffsetY + offsetY);
    if (ele instanceof GemPanelTitleElement && ele.panel !== panel) {
      updatePanelSort(this, panel, ele.panel);
    }
  };

  #onMoveTitleEnd = (evt: PointerEvent) => {
    evt.stopPropagation();
    const { panel } = this.state;
    if (!panel) return;
    setTimeout(() => {
      this.setState({ panel: null, move: false });
    });
  };

  #clickHandle = (index: number) => {
    const { move } = this.state;
    if (!move) {
      updateCurrentPanel(this, index);
    }
  };

  #onHeaderPan = ({ detail }: CustomEvent<PanEventDetail>) => {
    window.clearTimeout(store.windowPanTimer);
    if (this.isGrid) {
      const { x, y, width, height } = this.getBoundingClientRect();
      updateWindowType(this, [x, y, width, height]);
    } else {
      updateStore(store, {
        windowPanTimer: window.setTimeout(() => {
          const shadowDom = (this.getRootNode() as unknown) as ShadowRoot;
          const eles = shadowDom
            .elementsFromPoint(detail.clientX, detail.clientY)
            .filter((e) => e instanceof GemPanelWindowElement) as GemPanelWindowElement[];
          const ele = eles.find((e) => e !== this && e.window !== this.window);
          if (ele) {
            updateStore(store, { hoverWindow: ele.window, panWindow: this.window });
          }
        }, 400),
      });
      if (distance(detail.x, detail.y) > 4) {
        cancelHandleWindow();
      }
      updateWindowPosition(this, detail.x, detail.y);
    }
  };

  #onHeaderEnd = () => {
    window.clearTimeout(store.windowPanTimer);
    if (store.hoverWindow) {
      this.config.mergeWindow(this.window, store.hoverWindow);
      cancelHandleWindow();
    }
  };

  get isGrid() {
    const { position, dimension } = this.window;
    return !position && !dimension;
  }

  mounted = () => {
    this.addEventListener('pointerdown', () => {
      if (!this.isGrid) {
        updateWindowZIndex(this);
      }
    });
  };

  render = () => {
    const isGrid = this.isGrid;
    const { panels, gridArea, current = 0, position, dimension, zIndex } = this.window;
    const { panel, move, offsetX, clientX, parentOffsetX } = this.state;
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: white;
          position: ${isGrid ? 'relative' : 'fixed'};
          left: ${position?.[0]}px;
          top: ${position?.[1]}px;
          width: ${dimension?.[0]}px;
          height: ${dimension?.[1]}px;
          grid-area: ${gridArea};
          z-index: ${isGrid ? 0 : zIndex};
          overflow: ${isGrid ? 'visible' : 'hidden'};
          box-shadow: ${isGrid ? 'none' : '0px 1px 3px rgba(0, 0, 0, .4)'};
          opacity: ${store.panWindow === this.window ? 0.5 : 1};
        }
        .header {
          overflow: hidden;
          position: relative;
          display: flex;
        }
        .title {
          background: white;
          border: 1px solid transparent;
          border-bottom: none;
        }
        .content {
          position: relative;
          border: 1px solid red;
          flex-grow: 1;
          margin-top: -1px;
        }
        .title.active {
          z-index: 1;
          position: relative;
          border-color: red;
        }
        .title.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .title.temp {
          pointer-events: none;
          position: absolute;
          left: 0;
          bottom: 0;
          transform: translateX(${clientX - offsetX - parentOffsetX}px);
        }
        .top,
        .right,
        .bottom,
        .left {
          position: absolute;
          background: black;
        }
        :is(.top, .right, .bottom, .left):hover {
          background: blue;
        }
        :is(.top, .bottom):hover {
          cursor: row-resize;
        }
        :is(.right, .left):hover {
          cursor: col-resize;
        }
        .top,
        .bottom {
          width: 100%;
          height: 2px;
        }
        .right,
        .left {
          width: 2px;
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
        .mask {
          position: absolute;
          z-index: 2;
          width: 100%;
          height: 100%;
          background: rgba(255, 0, 0, 0.2);
        }
      </style>
      ${isGrid
        ? sides.map(
            (dir) => html`
              <gem-gesture
                class=${dir}
                @pan=${({ detail }: CustomEvent<PanEventDetail>) => moveSide(this, dir, detail)}
              ></gem-gesture>
            `,
          )
        : ''}
      <gem-gesture class="header" @pan=${this.#onHeaderPan} @end=${this.#onHeaderEnd}>
        ${panels.map(
          (p, index) =>
            html`
              <gem-panel-title
                class=${`title ${p === panel && move ? 'hidden' : ''} ${index === current ? 'active' : ''}`}
                .config=${this.config}
                .window=${this.window}
                .panel=${p}
                @click=${() => this.#clickHandle(index)}
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
                .config=${this.config}
                .window=${this.window}
                .panel=${panel}
              >
                ${panel.title}
              </gem-panel-title>
            `
          : ''}
      </gem-gesture>
      <div class="content">${panels[current].content}</div>
      ${store.hoverWindow === this.window ? html`<div class="mask"></div>` : ''}
    `;
  };
}
