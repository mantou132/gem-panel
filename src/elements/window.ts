import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { Config, Panel, Window } from '../lib/config';
import { moveSide, store, updateCurrentPanel, updatePanelSort } from '../store';

import './panel-title';
import { GemPanelTitleElement } from './panel-title';

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

  #onStart = (panel: Panel, evt: PointerEvent) => {
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

  #onMove = (evt: PointerEvent) => {
    const { panel, move, offsetY, parentOffsetY, clientX, clientY } = this.state;
    if (!panel) return;
    // first move
    if (!move && Math.sqrt((evt.clientX - clientX) ** 2 + (evt.clientY - clientY) ** 2) < 4) return;
    this.setState({ move: true, clientX: evt.clientX, clientY: evt.clientY });
    const ele = this.shadowRoot?.elementFromPoint(evt.clientX, parentOffsetY + offsetY);
    if (ele instanceof GemPanelTitleElement && ele.panel !== panel) {
      updatePanelSort(this, panel, ele.panel);
    }
  };

  #onEnd = () => {
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

  render = () => {
    const { panels, gridArea, current = 0 } = this.window;
    const { panel, move, offsetX, clientX, parentOffsetX } = this.state;
    return html`
      <style>
        :host {
          position: relative;
          display: flex;
          flex-direction: column;
          grid-area: ${gridArea};
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
      </style>
      ${sides.map(
        (dir) => html`
          <gem-gesture
            class=${dir}
            @pan=${({ detail }: CustomEvent<PanEventDetail>) => moveSide(this, dir, detail)}
          ></gem-gesture>
        `,
      )}
      <div class="header">
        ${panels.map(
          (p, index) =>
            html`
              <gem-panel-title
                class=${`title ${p === panel && move ? 'hidden' : ''} ${index === current ? 'active' : ''}`}
                .config=${this.config}
                .window=${this.window}
                .panel=${p}
                @click=${() => this.#clickHandle(index)}
                @pointerdown=${(evt: PointerEvent) => this.#onStart(p, evt)}
                @pointermove=${this.#onMove}
                @pointerup=${this.#onEnd}
                @pointercancel=${this.#onEnd}
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
      </div>
      <div class="content">${panels[current].content}</div>
    `;
  };
}
