import { html, GemElement, customElement, property, connectStore } from '@mantou/gem';
import { Config } from '../lib/config';
import { store } from '../store';

import './window';

@customElement('gem-panel')
@connectStore(store)
export class GemPanelElement extends GemElement {
  @property config: Config;

  constructor(config: Config) {
    super();
    this.config = config;
  }

  render = () => {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, windows } = this.config;
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
      ${windows.map(
        (window) =>
          html`
            <gem-panel-window .window=${window} .config=${this.config} @hidden-panel=${console.log}></gem-panel-window>
          `,
      )}
    `;
  };
}
