import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore, updatePath } from '../store';

import { theme } from '../../../';

@connectStore(bridgeStore)
@customElement('bridge-navigation')
export class BridgenNvigationElement extends GemElement {
  #clickHandle = (index: number) => {
    updatePath(bridgeStore.path.slice(0, index + 1));
  };

  render() {
    const path = bridgeStore.path;
    return html`
      <style>
        :host {
          cursor: default;
          display: flex;
          gap: 1em;
          background: ${theme.backgroundColor};
          font-size: 0.75em;
          font-family: ${theme.fontFamily};
          padding: 0.5em;
          color: ${theme.primaryColor};
          border-bottom: 1px solid ${theme.darkBackgroundColor};
        }
        .fragment:last-of-type {
          font-weight: bolder;
        }
      </style>
      <div class="fragment" @click=${() => this.#clickHandle(-1)}>Home</div>
      ${path.map(
        (fragment, index) => html`
          <div>${'>'}</div>
          <div class="fragment" @click=${() => this.#clickHandle(index)}>${fragment}</div>
        `,
      )}
    `;
  }
}
