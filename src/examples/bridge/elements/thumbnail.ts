import { customElement, GemElement, html, property } from '@mantou/gem';
import { Item } from '../store';
import { getImage } from '../utils';

@customElement('bridge-thumbnail')
export class BridgeThumbnailElement extends GemElement {
  @property data: Item;

  render() {
    const { filename } = this.data;
    return html`
      <style>
        :host {
          display: grid;
          padding: 0.2em;
        }
        img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: contain;
        }
        .title {
          text-align: center;
          padding: 0.2em 1em;
        }
      </style>
      <img src=${getImage(this.data, 100)} />
      <div class="title">${filename}</div>
    `;
  }
}
