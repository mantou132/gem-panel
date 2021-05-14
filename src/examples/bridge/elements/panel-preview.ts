import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore } from '../store';
import { getImage } from '../utils';

@connectStore(bridgeStore)
@customElement('bridge-panel-preview')
export class BridgePanelPreviewElement extends GemElement {
  render() {
    const [item] = [...bridgeStore.selection];
    if (!item) return null;
    return html`
      <style>
        :host {
          display: grid;
          grid-template-rows: 1fr auto;
          height: 100%;
          box-sizing: border-box;
          padding: 0.2em;
          justify-content: center;
          align-items: center;
        }
        img {
          overflow: hidden;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .title {
          text-align: center;
          padding: 0.2em 1em;
        }
      </style>
      <img src=${getImage(item)} />
      <div class="title">${item.filename}</div>
    `;
  }
}
