import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { Config, Window } from '../lib/config';
import { moveSide, store, updateCurrentPanel } from '../store';

import './panel-title';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type Side = typeof sides[number];

@customElement('gem-panel-window')
@connectStore(store)
export class GemPanelWindowElement extends GemElement {
  config: Config;
  window: Window;

  render = () => {
    const { panels, gridArea, current = 0 } = this.window;
    return html`
      <style>
        :host {
          position: relative;
          display: flex;
          flex-direction: column;
          grid-area: ${gridArea};
        }
        .header {
          display: flex;
        }
        .title {
          background: white;
          border: 1px solid transparent;
          border-bottom: none;
        }
        .content {
          border: 1px solid red;
          flex-grow: 1;
          margin-top: -1px;
        }
        .title:where(.--active, :--active) {
          position: relative;
          border-color: red;
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
          (panel, index) =>
            html`
              <gem-panel-title
                class="title"
                .active=${index === current}
                .config=${this.config}
                .window=${this.window}
                .panel=${panel}
                @click=${() => updateCurrentPanel(this, index)}
              >
                ${panel.title}
              </gem-panel-title>
            `,
        )}
      </div>
      <div class="content">${panels[current].content}</div>
    `;
  };
}
