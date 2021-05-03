import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { WINDOW_BORDER } from '../const';
import { Config, Panel, Window } from '../lib/config';
import { store } from '../store';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type HoverWindowPosition = typeof sides[number] | 'center';

@customElement('gem-panel-mask')
@connectStore(store)
export class GemPanelMaskElement extends GemElement {
  config: Config;
  window: Window;
  panel: Panel;

  render = () => {
    return html`
      <style>
        :host {
          display: contents;
        }
        .center,
        .top,
        .right,
        .bottom,
        .left {
          position: absolute;
          z-index: 2;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .center {
          background: red;
          opacity: 0.2;
        }
        .top,
        .right,
        .bottom,
        .left {
          border: ${WINDOW_BORDER}px solid transparent;
          opacity: 0.2;
        }
        .top {
          border-top-color: red;
        }
        .right {
          border-right-color: red;
        }
        .bottom {
          border-bottom-color: red;
        }
        .left {
          border-left-color: red;
        }
        .active {
          opacity: 0.4;
        }
      </style>
      ${store.hoverWindowPosition === 'center'
        ? html`<div class="center"></div>`
        : sides.map((e) => html`<div class="${e} ${e === store.hoverWindowPosition ? 'active' : ''}"></div>`)}
    `;
  };
}
