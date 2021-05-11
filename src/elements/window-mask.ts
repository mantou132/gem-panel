import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { WINDOW_HOVER_DETECT_BORDER, WINDOW_HOVER_DETECT_HEADER_HEIGHT } from '../lib/const';
import { store } from '../lib/store';
import { theme } from '../lib/theme';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type HoverWindowPosition = typeof sides[number] | 'center' | 'header';

@customElement('gem-panel-mask')
@connectStore(store)
export class GemPanelMaskElement extends GemElement {
  render = () => {
    const position = store.hoverWindowPosition;
    const headerHeight = store.hoverWindow?.engross ? 0 : WINDOW_HOVER_DETECT_HEADER_HEIGHT;

    return html`
      <style>
        :host {
          display: contents;
        }
        .header,
        .center,
        .side {
          position: absolute;
          z-index: 1;
          box-sizing: border-box;
          margin: 0;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .header {
          background: ${theme.focusColor};
          opacity: 0.1;
          height: ${headerHeight}px;
          bottom: auto;
        }
        .center {
          background: ${theme.focusColor};
          opacity: 0.2;
        }
        .side {
          top: ${headerHeight}px;
          border: ${WINDOW_HOVER_DETECT_BORDER}px solid transparent;
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
      ${position === 'header' || position === 'center'
        ? html`<div class="center"></div>`
        : html`
            <div class="header"></div>
            ${sides.map((e) => html`<div class="side ${e} ${e === position ? 'active' : ''}"></div>`)}
          `}
    `;
  };
}
