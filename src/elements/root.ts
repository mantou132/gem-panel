import { html, GemElement, customElement, property, connectStore, boolattribute, attribute, repeat } from '@mantou/gem';
import { updateTheme } from '@mantou/gem/helper/theme';
import { Layout, Window } from '../lib/layout';
import { Panel } from '../lib/panel';
import {
  closePanel,
  closeWindow,
  openHiddenPanel,
  openPanelInWindow,
  addHiddenPanel,
  store,
  updateAppState,
  deletePanelFromWindow,
  deleteHiddenPanel,
} from '../lib/store';
import { theme, Theme } from '../lib/theme';
import { isOutside, keyBy, exclude } from '../lib/utils';
import { MenuItem, openContextMenu } from './menu';
import { GemPanelWindowElement, windowTagName } from './window';
import './menu';

@customElement('gem-panel')
@connectStore(store)
export class GemPanelElement extends GemElement {
  @property layout?: Layout;
  @property panels?: Panel[];
  @property theme?: Theme;
  @boolattribute cache: boolean;
  @attribute cacheVersion: string;

  constructor(args?: { layout?: Layout; panels?: Panel[]; theme?: Theme; cache?: boolean; cacheVersion?: string }) {
    super();
    Object.assign(this, args);
  }

  #getKey = (cacheVersion = this.cacheVersion) => {
    // Modify when it is not compatible
    const v = 2;
    return `${this.tagName}-${v}-${cacheVersion}`;
  };

  #loadCache = () => {
    if (this.cache) {
      const layout = Layout.parse(localStorage.getItem(this.#getKey()) || 'null');
      if (layout) updateAppState({ layout });
    }
  };

  #cacheAs = (cacheVersion = this.cacheVersion) => {
    if (this.cache) {
      localStorage.setItem(this.#getKey(cacheVersion), JSON.stringify(store.layout));
    }
  };

  #save = () => this.#cacheAs();

  #queryPanel = (arg: string | Panel, panels: Panel[]) => {
    const title = typeof arg === 'string' ? arg : arg.name;
    return panels.find((e) => e.name === title);
  };

  #queryWindow = (panel: Panel) => {
    return store.layout.windows.find((w) => w.panels.includes(panel.name));
  };

  #cleanOutsideWindow = () => {
    const rect = this.getBoundingClientRect();
    this.shadowRoot?.querySelectorAll<GemPanelWindowElement>(windowTagName).forEach((ele) => {
      if (ele.window.isGridWindow()) return;
      const targetRect = ele.getBoundingClientRect();
      if (isOutside(rect, targetRect)) {
        closeWindow(ele.window);
      }
    });
  };

  #onResize = () => {
    const resizeObserver = new ResizeObserver(this.#cleanOutsideWindow);
    resizeObserver.observe(this);
  };

  mounted = () => {
    this.#onResize();
    this.effect(
      () => {
        updateAppState({
          layout: this.layout,
          panels: keyBy(this.panels || [], 'name'),
        });
      },
      () => [this.layout, this.panels],
    );
    this.effect(
      () => updateTheme(theme, this.theme || {}),
      () => [this.theme],
    );
    this.effect(
      (_, old) => {
        if (old) {
          this.#cacheAs(old[0]);
        }
        this.#loadCache();
      },
      () => [this.cacheVersion],
    );

    window.addEventListener('unload', this.#save);
    return () => {
      window.removeEventListener('unload', this.#save);
    };
  };

  render = () => {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, windows } = store.layout;
    return html`
      <style>
        :host {
          box-sizing: border-box;
          position: relative;
          /* hidden side */
          overflow: hidden;
          display: grid;
          gap: ${theme.windowGap};
          flex-grow: 1;
          height: 100%;
          grid-template-areas: ${gridTemplateAreas};
          grid-template-rows: ${gridTemplateRows};
          grid-template-columns: ${gridTemplateColumns};
          cursor: default;
          user-select: none;
          -webkit-user-select: none;
          background: ${theme.darkBackgroundColor};
          color: ${theme.secondaryColor};
          font-family: ${theme.fontFamily};
          font-size: ${theme.fontSize};
        }
      </style>
      ${repeat(
        windows,
        (w) => w.id,
        (window) =>
          html`
            <gem-panel-window
              exportparts="
                window,
                fixed-window,
                cell-window,
                window-bar,
                panel-header,
                panel-title,
                panel-drag-title,
                panel-active-title,
                panel-content,
                panel-button,
                panel-loader
              "
              .window=${window}
            ></gem-panel-window>
          `,
      )}
      <gem-panel-menu exportparts="menu,menu-item"></gem-panel-menu>
    `;
  };

  get showPanels() {
    return store.layout.windows
      .map((w) => w.panels)
      .flat()
      .map((p) => store.panels[p]);
  }

  get activePanels() {
    return store.layout.windows.map((w) => w.panels[w.current]).map((p) => store.panels[p]);
  }

  get hiddenPanels() {
    return Object.values(exclude({ ...store.panels }, 'name', this.showPanels));
  }

  openHiddenPanel(arg: string | Panel) {
    const panel = this.#queryPanel(arg, this.hiddenPanels);
    if (!panel) return;
    openHiddenPanel(panel.name);
  }

  openPanelInWindow(arg: string | Panel, window: Window) {
    const panel = this.#queryPanel(arg, this.hiddenPanels);
    if (!panel) return;
    openPanelInWindow(window, panel.name);
  }

  closePanel(arg: string | Panel) {
    const panel = this.#queryPanel(arg, this.showPanels);
    if (!panel) return;
    const window = this.#queryWindow(panel);
    if (!window) return;
    closePanel(window, panel.name);
  }

  addPanel(panel: Panel) {
    addHiddenPanel(panel);
  }

  deletePanel(arg: string | Panel) {
    const panel = this.#queryPanel(arg, this.showPanels);
    if (panel) {
      const window = this.#queryWindow(panel);
      if (!window) return;
      deletePanelFromWindow(window, panel.name);
    } else {
      const hiddenPanel = this.#queryPanel(arg, this.hiddenPanels);
      if (!hiddenPanel) return;
      deleteHiddenPanel(hiddenPanel.name);
    }
  }

  clearPanel() {
    store.layout.windows.forEach((window) =>
      window.panels.forEach((panelName) => {
        if (!store.panels[panelName]) deletePanelFromWindow(window, panelName);
      }),
    );
  }

  updateAllPanel() {
    updateAppState({});
  }

  clearCache() {
    localStorage.removeItem(this.#getKey());
  }

  openContextMenu(activeElement: HTMLElement | null, x: number, y: number, menus: MenuItem[]) {
    openContextMenu(activeElement, x, y, menus);
  }
}
