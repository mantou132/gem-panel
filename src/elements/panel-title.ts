import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { Panel, Window } from '../lib/config';
import { closePanel, closeWindow, store } from '../lib/store';
import { openMenu } from './menu';

@customElement('gem-panel-title')
@connectStore(store)
export class GemPanelTitleElement extends GemElement {
  window: Window;
  panel: Panel;

  #clickHandle = (evt: MouseEvent) => {
    evt.stopPropagation();
    const { window, panel } = this;
    const defaultMenus = [
      {
        text: 'close panel',
        handle: () => closePanel({ window, panel }),
      },
      {
        text: 'close panel group',
        handle: () => closeWindow({ window }),
      },
    ];
    openMenu(evt.x, evt.y, [...(store.openPanelMenuBefore?.(panel, window) || []), ...defaultMenus]);
  };

  render = () => {
    return html`
      <style>
        :host {
          padding: 0.2em 0;
          font-size: 0.85em;
          display: flex;
          align-items: center;
          gap: 0.5em;
          text-transform: capitalize;
        }
        .panel-button {
          position: relative;
          display: block;
          width: 1em;
          height: 1em;
          border-radius: 1px;
          overflow: hidden;
        }
        .panel-button::before,
        .panel-button::after {
          content: '';
          position: absolute;
        }
        .panel-button::before {
          top: 50%;
          left: 15%;
          width: 70%;
          height: 1px;
          background: currentColor;
          box-shadow: 0 3px 0 currentColor, 0 -3px 0 currentColor;
        }
        .panel-button:hover::after {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: currentColor;
          opacity: 0.2;
        }
        .menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 10em;
        }
      </style>
      <slot></slot>
      <span part="panel-button" class="panel-button" @pointerdown=${this.#clickHandle}></span>
    `;
  };
}
