import { html, GemElement } from '@mantou/gem';

import './elements/switch';

class Lib extends GemElement {
  render() {
    return html`
      <style>
        lib-switch {
          margin-top: 5em;
        }
      </style>
      <lib-switch></lib-switch>
    `;
  }
}

customElements.define('lib-root', Lib);
