import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { WINDOW_HOVER_BORDER } from '../lib/const';
import { store } from '../lib/store';
import { theme } from '../lib/theme';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type HoverWindowPosition = typeof sides[number] | 'center';

@customElement('gem-panel-mask')
@connectStore(store)
export class GemPanelMaskElement extends GemElement {
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
          box-sizing: border-box;
          z-index: 2;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .center {
          background: ${theme.focusColor};
          opacity: 0.2;
        }
        .top,
        .right,
        .bottom,
        .left {
          border: ${WINDOW_HOVER_BORDER}px solid transparent;
          opacity: 0.1;
        }
        .top {
          border-top-color: ${theme.focusColor};
        }
        .right {
          border-right-color: ${theme.focusColor};
        }
        .bottom {
          border-bottom-color: ${theme.focusColor};
        }
        .left {
          border-left-color: ${theme.focusColor};
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
