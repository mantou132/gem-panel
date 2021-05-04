import { html, GemElement, customElement, connectStore, createStore, updateStore } from '@mantou/gem';
import { theme } from '../lib/theme';

export interface MenuItem {
  text: string;
  handle: () => void;
}

type MenuState = {
  open: boolean;
  menus: MenuItem[];
  x: number;
  y: number;
};

export const menuStore = createStore<MenuState>({
  open: false,
  menus: [],
  x: 0,
  y: 0,
});

export function openMenu(x: number, y: number, menus: MenuItem[]) {
  updateStore(menuStore, { open: true, x, y, menus });
}

export function closeMenu() {
  updateStore(menuStore, { open: false });
}

@customElement('gem-panel-menu')
@connectStore(menuStore)
export class GemPanelMenuElement extends GemElement {
  mounted = () => {
    this.addEventListener('click', closeMenu);
  };

  render = () => {
    if (!menuStore.open) {
      return html`<style>
        :host {
          display: none;
        }
      </style>`;
    }

    return html`
      <style>
        :host {
          position: fixed;
          z-index: 12345678;
          display: block;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          text-transform: capitalize;
        }
        .menu {
          position: absolute;
          gap: 1px;
          width: 200px;
          max-height: calc(100vh - ${menuStore.y}px);
          background: ${theme.darkBackgroundColor};
          color: ${theme.secondaryColor};
          border: 1px solid ${theme.borderColor};
          box-shadow: 0 0.3em 1em rgba(0, 0, 0, 0.4);
          border-radius: 2px;
          top: ${menuStore.y + 4}px;
          left: min(${menuStore.x}px, calc(100vw - 200px));
          overflow: auto;
        }
        .item {
          line-height: 1.5;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding: 0.4em 1em;
          background: ${theme.backgroundColor};
        }
        .item:hover {
          color: ${theme.primaryColor};
        }
      </style>
      <div class="menu">
        ${menuStore.menus.map(({ text, handle }) => html`<div class="item" @click=${handle}>${text}</div>`)}
      </div>
    `;
  };
}
