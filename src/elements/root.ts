import { html, GemElement, customElement, property, connectStore, boolattribute, attribute } from '@mantou/gem';
import { Config } from '../lib/config';
import { store, updateConfig } from '../store';

import './window';

/**
 * @attr cache
 * @attr cache-version
 */
@customElement('gem-panel')
@connectStore(store)
export class GemPanelElement extends GemElement {
  @property config: Config;
  @boolattribute cache: boolean;
  @attribute cacheVersion: string;

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
}
