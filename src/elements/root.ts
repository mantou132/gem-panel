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
import { Config, Panel } from '../lib/config';
import { closePanel, openHiddenPanel, store, updateConfig } from '../lib/store';

import './window';

export type PanelChangeDetail = { showPanels: Panel[]; hiddenPanels: Panel[] };

/**
 * @attr cache
 * @attr cache-version
 * @event panel-change
 */
@customElement('gem-panel')
@connectStore(store)
export class GemPanelElement extends GemElement {
  @property config: Config;
  @boolattribute cache: boolean;
  @attribute cacheVersion: string;
  @emitter panelChange: Emitter<PanelChangeDetail>;

  constructor(config: Config, optionnal?: { cache: boolean; cacheVersion: string }) {
    super();
    this.config = config;
    Object.assign(this, optionnal);
  }

  #getKey = () => {
    return `${this.tagName}-${this.cacheVersion}`;
  };

  mounted = () => {
    this.effect(
      () => updateConfig(this.config),
      () => [this.config],
    );
    this.effect(
      () => this.panelChange({ showPanels: this.showPanels, hiddenPanels: this.hiddenPanels }),
      () => [this.hiddenPanels.length],
    );
    if (this.cache) {
      window.addEventListener('unload', this.unmounted);
      const config = Config.parse(localStorage.getItem(this.#getKey()) || 'null');
      if (config) {
        updateConfig(config);
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
          overflow: hidden;
          display: grid;
          gap: 2px;
          flex-grow: 1;
          height: 100%;
          grid-template-areas: ${gridTemplateAreas};
          grid-template-rows: ${gridTemplateRows};
          grid-template-columns: ${gridTemplateColumns};
          cursor: default;
          user-select: none;
        }
      </style>
      ${windows.map((window) => html`<gem-panel-window .window=${window}></gem-panel-window>`)}
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
