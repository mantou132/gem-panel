import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { Window } from '../lib/layout';
import { closePanel, closeWindow, store } from '../lib/store';
import { MenuItem, openContextMenu } from './menu';

@customElement('gem-panel-title')
@connectStore(store)
export class GemPanelTitleElement extends GemElement {
  window: Window;
  panelName: string;

  #defaultMenus: MenuItem[] = [
    {
      text: 'close panel',
      handle: () => closePanel(this.window, this.panelName),
    },
    {
      text: 'close panel group',
      handle: () => closeWindow(this.window),
    },
  ];

  // https://bugs.chromium.org/p/chromium/issues/detail?id=1206640
  #pointerDownHandle = (evt: MouseEvent) => {
    evt.stopPropagation();
    const panel = store.panels[this.panelName];
    if (!panel) return;
    setTimeout(async () => {
      const activeElement = (this.getRootNode() as ShadowRoot)?.activeElement;
      const menus = (await panel.getMenu?.(this.window, panel, this.#defaultMenus)) || this.#defaultMenus;
      openContextMenu(activeElement as HTMLElement, evt.x, evt.y, menus);
    });
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
      ${store.panels[this.panelName]?.title || 'No title'}
      <span part="panel-button" class="panel-button" @pointerdown=${this.#pointerDownHandle}></span>
    `;
  };
}
