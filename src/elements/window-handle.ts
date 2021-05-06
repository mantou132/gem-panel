import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { getThemeStore } from '@mantou/gem/helper/theme';
import { PanEventDetail } from '@mantou/gem/elements/gesture';
import '@mantou/gem/elements/gesture';

import { moveSide, updateWindowRect } from '../lib/store';
import { Window } from '../lib/config';
import { store } from '../lib/store';
import { theme } from '../lib/theme';

const sides = ['top', 'right', 'bottom', 'left'] as const;
export type Side = typeof sides[number];
export type MoveSideArgs = { movementX: number; movementY: number; width: number; height: number; gap: number };

const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;
export type Corner = typeof corners[number];

@customElement('gem-panel-handle')
@connectStore(store)
export class GemPanelHandleElement extends GemElement {
  window: Window;

  #onSidePan = ({ detail }: CustomEvent<PanEventDetail>, side: Side) => {
    const { width, height } = (this.getRootNode() as ShadowRoot).host.getBoundingClientRect();
    const gapStr = getThemeStore(theme).windowGap;
    let gap = 0;
    if (gapStr.trim().endsWith('px')) {
      gap = parseFloat(gapStr);
    } else {
      console.info('Cause the moving axis to shake!');
    }
    moveSide({ window: this.window }, side, { width, height, gap, movementX: detail.x, movementY: detail.y });
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
    updateWindowRect({ window: this.window }, [movement.x, movement.y, movement.w, movement.h]);
  };

  render = () => {
    const isGrid = this.window.isGridWindow();
    return html`
      <style>
        :host {
          display: contents;
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
