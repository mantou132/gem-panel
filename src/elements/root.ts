import {
  html,
  GemElement,
  customElement,
  property,
  connectStore,
  boolattribute,
  attribute,
  emitter,
  Emitter,
  repeat,
} from '@mantou/gem';
import { updateTheme } from '@mantou/gem/helper/theme';
import { Config, Panel, Window, PannelContent } from '../lib/config';
import {
  closePanel,
  closeWindow,
  loadContentInPanel,
  openHiddenPanel,
  openPanelInWindow,
  store,
  updateAppState,
} from '../lib/store';
import { theme } from '../lib/theme';
import { isOutside } from '../lib/utils';
import { MenuItem } from './menu';
import { GemPanelWindowElement, windowTagName } from './window';
import './menu';

export type PanelChangeDetail = { showPanels: Panel[]; hiddenPanels: Panel[]; activePanels: Panel[] };
export type OpenPanelMenuBeforeCallback = (panel: Panel, window: Window) => MenuItem[];

/**
 * @attr cache
 * @attr cache-version
 * @event panel-change
 */
@customElement('gem-panel')
@connectStore(store)
export class GemPanelElement extends GemElement {
  @property openPanelMenuBefore?: OpenPanelMenuBeforeCallback;
  @property config?: Config;
  @property theme?: Partial<typeof theme>;
  @boolattribute cache: boolean;
  @attribute cacheVersion: string;
  @emitter panelChange: Emitter<PanelChangeDetail>;

  constructor(
    config: Config,
    optionnal?: { cache?: boolean; cacheVersion?: string; openPanelMenuBefore?: OpenPanelMenuBeforeCallback },
  ) {
    super();
    this.config = config;
    Object.assign(this, optionnal);
  }

  #getKey = (cacheVersion = this.cacheVersion) => {
    // Modify when it is not compatible
    const v = 1;
    return `${this.tagName}-${v}-${cacheVersion}`;
  };

  #loadCache = () => {
    if (this.cache) {
      const config = Config.parse(localStorage.getItem(this.#getKey()) || 'null');
      if (config) {
        updateAppState({ config });
      }
    }
  };

  #cacheAs = (cacheVersion = this.cacheVersion) => {
    if (this.cache) {
      localStorage.setItem(this.#getKey(cacheVersion), JSON.stringify(store.config));
    }
  };

  #save = () => this.#cacheAs();

  #queryPanel = (arg: string | Panel, panels: Panel[]) => {
    const title = typeof arg === 'string' ? arg : arg.title;
    return panels.find((e) => e.title === title);
  };

  #cleanOutsideWindow = () => {
    const rect = this.getBoundingClientRect();
    [...this.shadowRoot!.querySelectorAll<GemPanelWindowElement>(windowTagName)]
      .filter((wEle) => !wEle.window.isGridWindow())
      .forEach((ele) => {
        const targetRect = ele.getBoundingClientRect();
        if (isOutside(rect, targetRect)) {
          closeWindow(ele);
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
      () => updateAppState({ config: this.config, openPanelMenuBefore: this.openPanelMenuBefore }),
      () => [this.config, this.openPanelMenuBefore],
    );
    this.effect(
      () => updateTheme(theme, this.theme || {}),
      () => [this.theme],
    );
    this.effect(
      () =>
        this.panelChange({
          showPanels: this.showPanels,
          hiddenPanels: this.hiddenPanels,
          activePanels: this.activePanels,
        }),
      () => this.showPanels.map(({ title }) => title),
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
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, windows } = store.config;
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
          background: ${theme.darkBackgroundColor};
          color: ${theme.secondaryColor};
          font-family: ${theme.fontFamily};
          font-size: ${theme.fontSize};
        }
      </style>
      ${repeat(
        windows,
        (w) => w.id,
        (window) => html`<gem-panel-window .window=${window} tabindex="0"></gem-panel-window>`,
      )}
      <gem-panel-menu></gem-panel-menu>
    `;
  };

  get hiddenPanels() {
    return store.config.panels;
  }

  get showPanels() {
    return store.config.windows.map((w) => w.panels).flat();
  }

  get activePanels() {
    return store.config.windows.map((w) => w.panels[w.current || 0]);
  }

  get windows() {
    return store.config.windows;
  }

  openHiddenPanel(arg: string | Panel) {
    const panel = this.#queryPanel(arg, this.hiddenPanels);
    if (!panel) return;
    openHiddenPanel(panel);
  }

  openPanelInWindow(arg: string | Panel, window: Window) {
    const panel = this.#queryPanel(arg, this.hiddenPanels);
    if (!panel) return;
    openPanelInWindow(panel, window);
  }

  loadContentInPanel(arg: string | Panel, content: PannelContent) {
    const panel = this.#queryPanel(arg, this.showPanels);
    if (!panel) return;
    loadContentInPanel(panel, content);
  }

  closePanel(arg: string | Panel) {
    const panel = this.#queryPanel(arg, this.showPanels);
    if (!panel) return;
    const window = this.windows.find((e) => e.panels.includes(panel as Panel));
    if (!window) return;
    closePanel({ window, panel });
  }
}
