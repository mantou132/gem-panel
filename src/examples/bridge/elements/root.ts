import { html, connectStore, customElement, GemElement, refobject, RefObject } from '@mantou/gem';

import { MenuItem, GemPanelElement, Layout, Panel, Window, theme } from '../../../';
import { bridgeStore, layoutModes, updateLayoutMode } from '../store';
import { ContextMenuDetail } from '../base-element';

import './navigation';
import { openHiddenPanel } from '../../../lib/store';

const getMenu = async (window: Window, _panel: Panel, defaultMenus: MenuItem[]) => {
  const menus: MenuItem[] = [...defaultMenus];
  const gemPanelEle = document.querySelector<GemPanelElement>('gem-panel');
  if (gemPanelEle) {
    gemPanelEle.hiddenPanels.forEach((panel) => {
      menus.unshift({
        text: `open "${panel.title}"`,
        handle: () => gemPanelEle.openPanelInWindow(panel, window),
      });
    });
  }
  return menus;
};

const favorites = new Panel('favorites', {
  title: 'favorites',
  getMenu,
  async getContent() {
    await import('./panel-favorites');
    return html`<bridge-panel-favorites></bridge-panel-favorites>`;
  },
});

const content = new Panel('content', {
  title: 'content',
  getMenu,
  async getContent() {
    await import('./panel-content');
    return html`<bridge-panel-content></bridge-panel-content>`;
  },
});

const filter = new Panel('filter', {
  title: 'filter',
  getMenu,
  async getContent() {
    await import('./panel-filter');
    return html`<bridge-panel-filter></bridge-panel-filter>`;
  },
});

const metadata = new Panel('metadata', {
  title: 'metadata',
  getMenu,
  async getContent() {
    await import('./panel-metadata');
    return html`<bridge-panel-metadata></bridge-panel-metadata>`;
  },
});

const preview = new Panel('preview', {
  title: 'preview',
  getMenu,
  async getContent() {
    await import('./panel-preview');
    return html`<bridge-panel-preview></bridge-panel-preview>`;
  },
});

const folders = new Panel('folders', {
  title: 'folders',
  getMenu,
  async getContent() {
    await import('./panel-folders');
    return html`<bridge-panel-folders></bridge-panel-folders>`;
  },
});

const libraries = new Panel('libraries', {
  title: 'libraries',
  getMenu,
});

const panels = [favorites, content, filter, metadata, preview, folders, libraries];

const getDefaultEssentialsLayout = () => {
  const w1 = new Window([favorites], { gridArea: 'favorites' });
  const w2 = new Window([content], { gridArea: 'content' });
  const w3 = new Window([filter], { gridArea: 'filter' });
  const w4 = new Window([preview], { gridArea: 'preview' });
  const w5 = new Window([metadata], { gridArea: 'metadata' });

  const layout = new Layout([w1, w2, w3, w4, w5], {
    gridTemplateAreas: `
    "favorites content preview"
    "filter content preview"
    "filter content metadata"
  `,
    gridTemplateColumns: '1fr 2fr 1fr',
    gridTemplateRows: '3fr 1fr 3fr',
  });
  return layout;
};

const getDefaultLibrariesLayout = () => {
  const w1 = new Window([folders], { gridArea: 'folders' });
  const w2 = new Window([content], { gridArea: 'content' });
  const w3 = new Window([libraries], { gridArea: 'libraries' });
  const w4 = new Window([preview], { gridArea: 'preview' });
  const w5 = new Window([metadata], { gridArea: 'metadata' });

  const layout = new Layout([w1, w2, w3, w4, w5], {
    gridTemplateAreas: `
    "folders preview libraries"
    "metadata preview libraries"
    "metadata content libraries"
  `,
    gridTemplateColumns: '1fr 2fr 1fr',
    gridTemplateRows: '6fr 1fr 3fr',
  });
  return layout;
};

@connectStore(bridgeStore)
@customElement('bridge-root')
export class BridgeRootElement extends GemElement {
  @refobject panelElementRef: RefObject<GemPanelElement>;

  #essentialsLayout = getDefaultEssentialsLayout();
  #librariesLayout = getDefaultLibrariesLayout();

  #getLayout = () => {
    if (bridgeStore.mode === 'essentials') {
      return this.#essentialsLayout;
    } else {
      return this.#librariesLayout;
    }
  };

  #onContextmenu = ({ x, y }: MouseEvent) => {
    this.panelElementRef.element?.openContextMenu(null, x, y, [
      { text: 'reset layout', handle: this.resetLayout },
      { text: '---' },
      ...this.panelElementRef.element?.hiddenPanels.map(({ name, title }) => ({
        text: `open "${title}"`,
        handle: () => openHiddenPanel(name),
      })),
    ]);
  };

  mounted = () => {
    this.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
    });
    this.addEventListener('open-context-menu', ({ detail }: CustomEvent<ContextMenuDetail>) => {
      const { activeElement, x, y, menu } = detail;
      this.panelElementRef.element?.openContextMenu(activeElement, x, y, menu);
    });
  };

  render() {
    return html`
      <style>
        :host {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: ${theme.darkBackgroundColor};
        }
        header {
          cursor: default;
          display: flex;
          justify-content: center;
          gap: 1em;
          padding: 0.3em;
          color: ${theme.secondaryColor};
          font-family: ${theme.fontFamily};
          font-size: 0.85em;
          background: ${theme.backgroundColor};
          align-items: center;
          text-transform: capitalize;
          border-bottom: 1px solid ${theme.darkBackgroundColor};
        }
        .mode {
          padding: 0.2em 0.5em;
          border-radius: 2px;
          border: 1px solid transparent;
        }
        .mode:hover {
          border: 1px solid ${theme.borderColor};
        }
        .active {
          background: ${theme.darkBackgroundColor};
          color: ${theme.primaryColor};
          border: 1px solid ${theme.borderColor};
        }
      </style>
      <header @contextmenu=${this.#onContextmenu}>
        ${layoutModes.map(
          (mode) =>
            html`
              <div class="mode ${mode === bridgeStore.mode ? 'active' : ''}" @click=${() => updateLayoutMode(mode)}>
                ${mode}
              </div>
            `,
        )}
      </header>
      <bridge-navigation></bridge-navigation>
      <gem-panel
        ref=${this.panelElementRef.ref}
        .cache=${true}
        .cacheVersion=${`${bridgeStore.mode}-3`}
        .panels=${panels}
        .layout=${this.#getLayout()}
      >
      </gem-panel>
    `;
  }

  resetLayout = () => {
    this.panelElementRef.element?.clearCache();
    this.#essentialsLayout = getDefaultEssentialsLayout();
    this.#librariesLayout = getDefaultLibrariesLayout();
    this.update();
  };
}
