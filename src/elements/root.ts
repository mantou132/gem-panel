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
} from '@mantou/gem';
import { updateTheme } from '@mantou/gem/helper/theme';
import { Config, Panel } from '../lib/config';
import { closePanel, openHiddenPanel, store, updateAppState } from '../lib/store';
import { theme } from '../lib/theme';
import { MenuItem } from './menu';

import './window';
import './menu';

export type PanelChangeDetail = { showPanels: Panel[]; hiddenPanels: Panel[] };
export type OpenPanelMenuBeforeCallback = (panel: Panel) => MenuItem[];

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

  #getKey = () => {
    return `${this.tagName}-${this.cacheVersion}`;
  };

  mounted = () => {
    this.effect(
      () => updateAppState({ config: this.config, openPanelMenuBefore: this.openPanelMenuBefore }),
      () => [this.config, this.openPanelMenuBefore],
    );
    this.effect(
      () => updateTheme(theme, this.theme || {}),
      () => [this.theme],
    );
    this.effect(
      () => this.panelChange({ showPanels: this.showPanels, hiddenPanels: this.hiddenPanels }),
      () => [this.hiddenPanels.length],
    );
    window.addEventListener('unload', this.unmounted);
    if (this.cache) {
      const config = Config.parse(localStorage.getItem(this.#getKey()) || 'null');
      if (config) {
        updateAppState({ config });
      }
    }
  };

  unmounted = () => {
    this.cache && localStorage.setItem(this.#getKey(), JSON.stringify(store.config));
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
      ${windows.map((window) => html`<gem-panel-window .window=${window}></gem-panel-window>`)}
      <gem-panel-menu></gem-panel-menu>
    `;
  };

  get hiddenPanels() {
    return [...new Set(store.config.panels)];
  }

  get showPanels() {
    return [...new Set(store.config.windows.map((w) => w.panels).flat())];
  }

  get windows() {
    return store.config.windows;
  }

  openHiddenPanel(arg: string | Panel) {
    let panel: Panel | undefined;
    if (typeof arg === 'string') {
      panel = this.hiddenPanels.find((e) => e.title === arg);
    } else {
      panel = arg;
    }
    if (!panel) return;
    openHiddenPanel(panel);
  }

  closePanel(arg: string | Panel) {
    let panel: Panel | undefined;
    if (typeof arg === 'string') {
      panel = this.showPanels.find((e) => (e.title = arg));
    } else {
      panel = arg;
    }
    if (!panel) return;
    const window = this.windows.find((e) => e.panels.includes(panel as Panel));
    if (!window) return;
    closePanel({ window, panel });
  }
}
