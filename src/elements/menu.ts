import { html, GemElement, customElement, connectStore, createStore, updateStore, styleMap } from '@mantou/gem';
import { MENU_Z_INDEX } from '../lib/const';
import { theme } from '../lib/theme';

export interface MenuItem {
  text: string;
  handle?: () => void;
  menu?: MenuItem[];
}

type MenuState = {
  activeElement: HTMLElement | null;
  open: boolean;
  menuStack: {
    menu: MenuItem[];
    x: number;
    y: number;
  }[];
};

export const menuStore = createStore<MenuState>({
  activeElement: null,
  open: false,
  menuStack: [],
});

export function openContextMenu(activeElement: HTMLElement | null, x: number, y: number, menu: MenuItem[]) {
  updateStore(menuStore, { open: true, activeElement, menuStack: [{ x, y, menu }] });
}

export function pointerDownHandle() {
  setTimeout(() => menuStore.activeElement?.focus());
  updateStore(menuStore, { open: false });
}

function addMenuStack(x: number, y: number, menu: MenuItem[]) {
  const index = menuStore.menuStack.findIndex((e) => e.menu === menu);
  if (index > -1) {
    updateStore(menuStore, { menuStack: menuStore.menuStack.slice(0, index + 1) });
  } else {
    updateStore(menuStore, { menuStack: [...menuStore.menuStack, { x, y, menu }] });
  }
}

@customElement('gem-panel-menu')
@connectStore(menuStore)
export class GemPanelMenuElement extends GemElement {
  #enterMenu = (evt: PointerEvent, menu: MenuItem[]) => {
    const { x, y, width } = (evt.target as HTMLDivElement).getBoundingClientRect();
    const em = parseInt(getComputedStyle(this).fontSize);
    addMenuStack(x + 2 * width < innerWidth ? x + width - em : x - width + em, y - 0.4 * em, menu);
  };

  stopPropagation = (evt: Event) => {
    evt.stopPropagation();
  };

  mounted = () => {
    this.addEventListener('pointerdown', pointerDownHandle);
  };

  render = () => {
    if (!menuStore.open) {
      return html`<style>
        :host {
          display: none;
        }
      </style>`;
    }

    const { menuStack } = menuStore;

    return html`
      <style>
        :host {
          position: fixed;
          z-index: ${MENU_Z_INDEX};
          display: block;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          text-transform: capitalize;
          font-size: 0.85em;
        }
        .menu {
          position: absolute;
          gap: 1px;
          background: ${theme.backgroundColor};
          color: ${theme.secondaryColor};
          border: 1px solid ${theme.borderColor};
          box-shadow: 0 0.3em 1em rgba(0, 0, 0, 0.4);
          border-radius: 4px;
          overflow: auto;
        }
        .item {
          line-height: 1.5;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding: 0.4em 1em;
          display: flex;
          justify-content: space-between;
        }
        .item:hover,
        .open {
          color: ${theme.primaryColor};
        }
        .submenu-mark {
          position: relative;
          width: 1em;
        }
        .submenu-mark::before,
        .submenu-mark::after {
          position: absolute;
          content: '';
          width: 80%;
          height: 2px;
          border-radius: 1em;
          top: 50%;
          background: currentColor;
          transform-origin: center right;
        }
        .submenu-mark::before {
          transform: translateY(-50%) scale(0.8) rotate(-45deg);
        }
        .submenu-mark::after {
          transform: translateY(-50%) scale(0.8) rotate(45deg);
        }
        .separator {
          opacity: 0.3;
          background: currentColor;
          height: 1px;
          margin: 0 1em;
        }
      </style>
      ${menuStack.map(
        ({ x, y, menu }, index) => html`
          <div
            part="menu"
            class="menu"
            style=${styleMap({
              width: '200px',
              maxHeight: `calc(100vh - ${y}px)`,
              top: `${y + 4}px`,
              left: `min(${x}px, calc(100vw - 200px))`,
            })}
          >
            ${menu.map(({ text, handle, menu: subMenu }) =>
              text === '---'
                ? html`<div part="menu-item-separator" class="separator"></div>`
                : html`
                    <div
                      part="menu-item"
                      class=${`item ${subMenu && subMenu === menuStack[index + 1]?.menu ? 'open' : ''}`}
                      @pointerover=${(evt: PointerEvent) => this.#enterMenu(evt, subMenu || menu)}
                      @pointerdown=${handle || this.stopPropagation}
                    >
                      ${text}${subMenu ? html`<div part="menu-submenu-mark" class="submenu-mark"></div>` : ''}
                    </div>
                  `,
            )}
          </div>
        `,
      )}
    `;
  };
}
