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
    if (this.window.isGridWindow()) {
      const { width, height } = (this.getRootNode() as ShadowRoot).host.getBoundingClientRect();
      const gapStr = getThemeStore(theme).windowGap;
      let gap = 0;
      if (gapStr.trim().endsWith('px')) {
        gap = parseFloat(gapStr);
      } else {
        console.info('Cause the moving axis to shake!');
      }
      moveSide({ window: this.window }, side, { width, height, gap, movementX: detail.x, movementY: detail.y });
    } else {
      const movement = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      };
      if (side === 'top') {
        movement.h = -detail.y;
        movement.y = detail.y;
      }
      if (side === 'right') {
        movement.w = detail.x;
      }
      if (side === 'bottom') {
        movement.h = detail.y;
      }
      if (side === 'left') {
        movement.x = detail.x;
        movement.w = -detail.x;
      }
      updateWindowRect({ window: this.window }, [movement.x, movement.y, movement.w, movement.h]);
    }
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
          --width: ${isGrid ? theme.windowGap : '8px'};
          --offset: calc(0px - var(--width) / ${isGrid ? 1 : 2});
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
          height: var(--width);
        }
        .right,
        .left {
          width: var(--width);
          height: 100%;
        }
        .top {
          top: var(--offset);
        }
        .right {
          right: var(--offset);
        }
        .bottom {
          bottom: var(--offset);
        }
        .left {
          left: var(--offset);
        }
        .top-left,
        .top-right,
        .bottom-right,
        .bottom-left {
          position: absolute;
          width: var(--width);
          height: var(--width);
          z-index: 1;
        }
        .top-left {
          top: var(--offset);
          left: var(--offset);
          cursor: nwse-resize;
        }
        .top-right {
          top: var(--offset);
          right: var(--offset);
          cursor: nesw-resize;
        }
        .bottom-right {
          bottom: var(--offset);
          right: var(--offset);
          cursor: nwse-resize;
        }
        .bottom-left {
          bottom: var(--offset);
          left: var(--offset);
          cursor: nesw-resize;
        }
      </style>
      ${sides.map(
        (side) => html`
          <gem-gesture
            class=${side}
            @pan=${(evt: CustomEvent<PanEventDetail>) => this.#onSidePan(evt, side)}
          ></gem-gesture>
        `,
      )}
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
